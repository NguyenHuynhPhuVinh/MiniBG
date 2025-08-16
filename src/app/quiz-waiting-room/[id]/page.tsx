"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ParticipantList,
  QuizPinDisplay,
} from "@/components/features/quiz/waiting-room";
import { useQuizRealtime } from "@/lib/hooks/use-quiz-realtime";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import quizService from "@/lib/services";
import { Quiz } from "@/lib/types/quiz";
import { HelpCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/forms";
import { hasRole } from "@/lib/auth/role-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback";

const QuizWaitingRoomPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const quizId = parseInt(id as string, 10);
  const { isAuthenticated } = useAuthStatus();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Xác định người dùng là giáo viên hay học sinh
  const isTeacher = isAuthenticated() && hasRole(["teacher", "Teacher"]);

  // Sử dụng hook realtime để lấy danh sách người tham gia
  const {
    participants: realtimeParticipants,
    isConnected,
    error,
    joinWaitingRoom,
    reloadParticipants,
    quizStarted,
  } = useQuizRealtime(quizId, isTeacher);

  // Kết hợp danh sách người tham gia
  const participants = useMemo(() => {
    return realtimeParticipants;
  }, [realtimeParticipants]);

  // Xử lý khi quiz bắt đầu
  useEffect(() => {
    if (quizStarted) {
      console.log("Quiz đã bắt đầu, kiểm tra vai trò người dùng");

      if (!isTeacher) {
        // Học sinh chuyển đến trang làm bài
        toast.success("Bài kiểm tra đã bắt đầu!");
        router.push(`/quiz-live/${quizId}`);
      } else {
        // Giáo viên chuyển đến trang theo dõi
        toast.success("Bài kiểm tra đã bắt đầu! Chuyển đến trang theo dõi...");
        router.push(`/quiz-monitor/${quizId}`);
      }
    }
  }, [quizStarted, quizId, router, isTeacher]);

  // Thêm useEffect để gọi reload participants khi cần
  useEffect(() => {
    if (isTeacher && quizId && isConnected) {
      reloadParticipants();
    }
  }, [isTeacher, quizId, isConnected, reloadParticipants]);

  // Lấy thông tin quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizById(quizId);
        console.log("Quiz Waiting Room API Response:", response); // Debug log

        if (response?.success && response?.data) {
          setQuiz(response.data.quiz);
        } else {
          console.warn(
            "Unexpected quiz waiting room response structure:",
            response
          );
          throw new Error("Invalid response structure");
        }

        // Nếu quiz đã active, chỉ học sinh chuyển hướng sang trang quiz-live
        if (response?.data?.quiz?.status === "active" && !isTeacher) {
          // Kiểm tra xem đã tham gia quiz chưa
          try {
            // Gọi API để tham gia lại quiz nếu cần
            const joinResponse = await quizService.joinQuiz(quizId, {
              pin: response.quiz.pin || "",
            });

            // Nếu có thông tin về tiến độ làm bài, chuyển hướng tới quiz-live
            if (joinResponse.session && joinResponse.progress) {
              toast.success(
                "Bài kiểm tra đang diễn ra, đang chuyển đến bài làm..."
              );
            }

            router.push(`/quiz-live/${quizId}`);
          } catch (joinError) {
            console.error("Lỗi khi tham gia lại quiz:", joinError);
            // Vẫn chuyển hướng nếu quiz đang active
            router.push(`/quiz-live/${quizId}`);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId && !isNaN(quizId)) {
      fetchQuiz();
    } else {
      toast.error("ID bài kiểm tra không hợp lệ");
      setLoading(false);
    }
  }, [quizId, isTeacher, id, router]);

  // Thêm useEffect để gọi joinWaitingRoom khi socket đã kết nối
  useEffect(() => {
    if (isConnected) {
      console.log("Socket đã kết nối, gọi joinWaitingRoom()");
      joinWaitingRoom();
    }
  }, [isConnected, joinWaitingRoom]);

  // Xử lý bắt đầu bài kiểm tra (chỉ dành cho giáo viên)
  const handleStartQuiz = async () => {
    try {
      // Bắt đầu bài kiểm tra
      await quizService.startQuiz(quizId);

      // Gọi API để tự động chạy tất cả các câu hỏi
      //await quizService.startAutoQuiz(quizId);
    } catch (err) {
      toast.error("Không thể bắt đầu bài kiểm tra");
      console.error(err);
    }
  };

  const handleBackToDashboard = async () => {
    if (!isTeacher) {
      // Hiển thị dialog xác nhận cho học sinh
      setShowLeaveDialog(true);
    } else {
      // Giáo viên không cần xác nhận, chuyển hướng ngay
      router.push("/dashboard");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      // Gọi API rời phòng
      await quizService.leaveQuiz(quizId);
      toast.success("Bạn đã rời khỏi phòng chờ");
      // Chuyển hướng về dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Lỗi khi rời phòng:", error);
      toast.error("Không thể rời phòng. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto" />
          <span className="mt-4 text-base sm:text-lg">
            Đang tải phòng chờ...
          </span>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="mt-4 text-xl font-bold">
            Không tìm thấy bài kiểm tra
          </h2>
          <p className="mt-2 text-muted-foreground">
            Bài kiểm tra không tồn tại hoặc bạn không có quyền truy cập
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Dialog xác nhận rời phòng */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn muốn rời khỏi phòng chờ?</DialogTitle>
            <DialogDescription>
              Nếu bạn rời khỏi phòng chờ, bạn sẽ không thể tham gia bài kiểm tra
              này khi nó bắt đầu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveRoom}
              className="cursor-pointer"
            >
              Rời phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nút thoát đặt ở ngoài container để không bị ảnh hưởng bởi max-width */}
      <div className="absolute top-6 right-6 z-20">
        <div className="relative flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackToDashboard}
            className="rounded-full h-12 w-12 border-2 border-gray-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all cursor-pointer"
            aria-label={isTeacher ? "Quay lại" : "Rời phòng"}
            title={isTeacher ? "Quay lại trang chủ" : "Rời khỏi phòng chờ"}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto py-6 sm:py-10 md:py-16 px-4">
        <QuizPinDisplay
          pin={quiz.pin || "Không có mã PIN"}
          quizName={quiz.name}
          onStartQuiz={handleStartQuiz}
          disabled={quiz.status !== "pending" || participants.length === 0}
        />

        <ParticipantList participants={participants} />

        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-red-100 text-red-800 rounded-md text-sm sm:text-base">
            Lỗi kết nối: {error}
          </div>
        )}

        {!isConnected && !error && (
          <div className="mt-4 p-3 sm:p-4 bg-orange-100 text-orange-800 rounded-md text-sm sm:text-base">
            Đang kết nối với máy chủ...
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizWaitingRoomPage;
