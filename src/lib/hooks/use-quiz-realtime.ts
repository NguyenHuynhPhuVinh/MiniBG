/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react";
import {
  QuizParticipant,
  NewParticipantEvent,
  ParticipantsUpdateEvent,
  Question,
} from "@/lib/types/quiz";
import quizService from "@/lib/services";
import quizSocketService, {
  QuizStartedEvent,
  NewQuestionEvent,
} from "@/lib/services/socket/quiz";
import socketService from "@/lib/services/socket";
import { useAuthStatus } from "@/lib/hooks/use-auth";

export const useQuizRealtime = (quizId: number, isTeacher: boolean = false) => {
  const [participants, setParticipants] = useState<QuizParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState<Question | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const { user } = useAuthStatus();

  // Tạo ID duy nhất cho component này
  const componentId = useRef(
    `quiz_${quizId}_${isTeacher ? "teacher" : "student"}_${Date.now()}`
  ).current;

  // Hàm để tải lại danh sách người tham gia từ API
  const reloadParticipants = useCallback(async () => {
    if (!quizId) return;

    try {
      const response = await quizService.getQuizParticipants(quizId);
      console.log("Quiz Participants API Response:", response);

      if (
        response?.success &&
        response?.data &&
        Array.isArray(response.data.participants)
      ) {
        setParticipants(response.data.participants);
        return response.data.participants;
      } else {
        console.warn("API trả về dữ liệu không hợp lệ:", response);
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người tham gia:", error);
      return null;
    }
  }, [quizId]);

  // Cải thiện hàm tham gia vào phòng chờ với useCallback
  const joinWaitingRoom = useCallback(async () => {
    if (isConnected) {
      console.log(`Đang tham gia các phòng cho quiz: ${quizId}`);

      // Sử dụng quizSocketService để tham gia các phòng, cung cấp userId nếu có
      quizSocketService.joinAllQuizRooms(quizId, isTeacher, user?.user_id);

      console.log("user.user_id:", user?.user_id);

      // Tất cả người dùng đều tải danh sách người tham gia khi tham gia phòng
      if (participants.length === 0) {
        await reloadParticipants();
      }
    }
  }, [
    isConnected,
    quizId,
    isTeacher,
    participants.length,
    reloadParticipants,
    user?.user_id,
  ]);

  // Tải danh sách người tham gia khi component được mount
  useEffect(() => {
    if (quizId) {
      reloadParticipants();
    }
  }, [quizId, reloadParticipants]);

  // Thiết lập các event listener và kết nối socket
  useEffect(() => {
    console.log(
      `Khởi tạo kết nối socket cho quiz: ${quizId}, isTeacher: ${isTeacher}`
    );

    // Kết nối socket
    socketService.connect();
    setIsConnected(socketService.isSocketConnected());

    // Tham gia các phòng quiz
    quizSocketService.joinAllQuizRooms(quizId, isTeacher, user?.user_id);

    // Lắng nghe sự kiện học viên mới tham gia
    quizSocketService.onNewParticipant(
      quizId,
      componentId,
      (data: NewParticipantEvent) => {
        console.log("Học viên mới tham gia:", data.participant);
        setParticipants((prev) => {
          // Kiểm tra xem người tham gia đã tồn tại chưa
          const exists = prev.some(
            (p) => p.user_id === data.participant.user_id
          );
          if (!exists) {
            return [...prev, data.participant];
          }
          return prev;
        });
      }
    );

    // Lắng nghe sự kiện cập nhật danh sách người tham gia
    quizSocketService.onParticipantsUpdate(
      quizId,
      componentId,
      (data: ParticipantsUpdateEvent) => {
        console.log(
          "Quiz ID khớp, cập nhật danh sách người tham gia:",
          data.participants
        );
        console.log(
          "Số lượng người tham gia:",
          data.participants ? data.participants.length : 0
        );

        if (Array.isArray(data.participants)) {
          setParticipants(data.participants);
        } else {
          console.error(
            "data.participants không phải là mảng:",
            data.participants
          );
        }
      }
    );

    // Lắng nghe sự kiện người tham gia rời phòng
    socketService.on("participantLeft", componentId, (data: any) => {
      if (
        data &&
        data.quiz_id &&
        parseInt(data.quiz_id.toString()) === quizId
      ) {
        console.log("Học viên rời phòng, user_id:", data.user_id);

        // Cập nhật danh sách người tham gia
        setParticipants((prev) =>
          prev.filter((p) => p.user_id !== data.user_id)
        );
      }
    });

    // Lắng nghe sự kiện quiz bắt đầu
    quizSocketService.onQuizStarted(
      quizId,
      componentId,
      (data: QuizStartedEvent) => {
        console.log("Quiz bắt đầu, ID:", data.quiz_id);
        setQuizStarted(true);

        // Lưu câu hỏi đầu tiên nếu có
        if (data.current_question) {
          console.log("Lưu câu hỏi đầu tiên:", data.current_question);
          setInitialQuestion(data.current_question);
        }

        // Lưu số lượng câu hỏi
        if (data.total_questions) {
          setTotalQuestions(data.total_questions);
        }
      }
    );

    // Lắng nghe sự kiện câu hỏi mới (cho trang live)
    quizSocketService.onNewQuestion(
      quizId,
      componentId,
      (data: NewQuestionEvent) => {
        console.log("Nhận câu hỏi mới:", data);
        // Cập nhật câu hỏi hiện tại nếu cần
        setInitialQuestion(data.current_question || null);
        setTotalQuestions(data.total_questions || 0);
      }
    );

    // Lắng nghe trạng thái kết nối socket
    const checkConnectionInterval = setInterval(() => {
      const connected = socketService.isSocketConnected();
      if (connected !== isConnected) {
        setIsConnected(connected);
        if (connected) {
          // Tự động tham gia lại các phòng nếu kết nối lại
          quizSocketService.joinAllQuizRooms(quizId, isTeacher, user?.user_id);
          // Tải lại dữ liệu người tham gia
          reloadParticipants();
          setError(null);
        } else {
          setError("Mất kết nối đến máy chủ");
        }
      }
    }, 3000);

    // Tải danh sách người tham gia sau khi kết nối
    if (socketService.isSocketConnected()) {
      reloadParticipants();
    }

    // Dọn dẹp khi component unmount
    return () => {
      console.log("Dọn dẹp kết nối socket cho quiz realtime...");
      clearInterval(checkConnectionInterval);
      quizSocketService.offAllQuizEvents(componentId);
    };
  }, [quizId, isTeacher, reloadParticipants, user?.user_id]);

  return {
    participants,
    setParticipants,
    isConnected,
    error,
    joinWaitingRoom,
    reloadParticipants,
    quizStarted,
    initialQuestion,
    totalQuestions,
  };
};

export default useQuizRealtime;
