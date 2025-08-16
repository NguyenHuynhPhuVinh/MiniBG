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
import { HelpCircle, X, Loader2, Zap, Trophy } from "lucide-react";
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

// Racing-themed wrapper components
const RacingQuizPinDisplay = ({
  pin,
  quizName,
  onStartQuiz,
  disabled,
}: any) => {
  return (
    <div className="relative">
      {/* Racing gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg opacity-10"></div>
      <div className="relative">
        <QuizPinDisplay
          pin={pin}
          quizName={quizName}
          onStartQuiz={onStartQuiz}
          disabled={disabled}
        />
      </div>
      {/* Racing icons */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
        <Trophy className="h-6 w-6 text-orange-500" />
      </div>
    </div>
  );
};

const RacingParticipantList = ({ participants }: any) => {
  return (
    <div className="relative">
      {/* Racing theme styling */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg opacity-50"></div>
      <div className="relative">
        <ParticipantList participants={participants} />
      </div>
    </div>
  );
};

const QuizRacingWaitingRoomPage = () => {
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

  // Xử lý khi quiz bắt đầu - Racing navigation
  useEffect(() => {
    if (quizStarted) {
      console.log("Quiz Racing đã bắt đầu, kiểm tra vai trò người dùng");

      if (!isTeacher) {
        // Học sinh chuyển đến trang racing live
        toast.success("🏁 Quiz Racing đã bắt đầu! Sẵn sàng đua!");
        router.push(`/quiz-racing-live/${quizId}`);
      } else {
        // Giáo viên chuyển đến trang theo dõi
        toast.success(
          "🏁 Quiz Racing đã bắt đầu! Chuyển đến trang theo dõi..."
        );
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
        console.log("Quiz Racing Waiting Room API Response:", response); // Debug log

        if (response?.success && response?.data) {
          setQuiz(response.data.quiz);
        } else {
          console.warn(
            "Unexpected quiz racing waiting room response structure:",
            response
          );
          throw new Error("Invalid response structure");
        }

        // Nếu quiz đã active, chỉ học sinh chuyển hướng sang trang quiz-racing-live
        if (response?.data?.quiz?.status === "active" && !isTeacher) {
          // Kiểm tra xem đã tham gia quiz chưa
          try {
            // Gọi API để tham gia lại quiz nếu cần
            const joinResponse = await quizService.joinQuiz(quizId, {
              pin: response.quiz.pin || "",
            });

            // Nếu có thông tin về tiến độ làm bài, chuyển hướng tới quiz-racing-live
            if (joinResponse.session && joinResponse.progress) {
              toast.success(
                "🏁 Quiz Racing đang diễn ra, đang chuyển đến bài đua..."
              );
            }

            router.push(`/quiz-racing-live/${quizId}`);
          } catch (joinError) {
            console.error("Lỗi khi tham gia lại quiz racing:", joinError);
            // Vẫn chuyển hướng nếu quiz đang active
            router.push(`/quiz-racing-live/${quizId}`);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin quiz racing:", error);
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
      console.log("Socket đã kết nối, gọi joinWaitingRoom() cho Quiz Racing");
      joinWaitingRoom();
    }
  }, [isConnected, joinWaitingRoom]);

  // Xử lý bắt đầu bài kiểm tra (chỉ dành cho giáo viên)
  const handleStartQuiz = async () => {
    try {
      // Bắt đầu bài kiểm tra racing
      await quizService.startQuiz(quizId);
    } catch (err) {
      toast.error("Không thể bắt đầu Quiz Racing");
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
      toast.success("Bạn đã rời khỏi phòng chờ Quiz Racing");
      // Chuyển hướng về dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Lỗi khi rời phòng racing:", error);
      toast.error("Không thể rời phòng. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange-500 mx-auto" />
          <span className="mt-4 text-base sm:text-lg text-orange-700">
            🏁 Đang tải phòng chờ Quiz Racing...
          </span>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="mt-4 text-xl font-bold">Không tìm thấy Quiz Racing</h2>
          <p className="mt-2 text-muted-foreground">
            Quiz Racing không tồn tại hoặc bạn không có quyền truy cập
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Dialog xác nhận rời phòng */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              🏁 Bạn muốn rời khỏi phòng chờ Quiz Racing?
            </DialogTitle>
            <DialogDescription>
              Nếu bạn rời khỏi phòng chờ, bạn sẽ không thể tham gia cuộc đua này
              khi nó bắt đầu.
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

      {/* Nút thoát với racing theme */}
      <div className="absolute top-6 right-6 z-20">
        <div className="relative flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackToDashboard}
            className="rounded-full h-12 w-12 border-2 border-orange-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer bg-white/80 backdrop-blur-sm"
            aria-label={isTeacher ? "Quay lại" : "Rời phòng"}
            title={
              isTeacher ? "Quay lại trang chủ" : "Rời khỏi phòng chờ Racing"
            }
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto py-6 sm:py-10 md:py-16 px-4">
        {/* Racing-themed header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
            🏁 Quiz Racing - Phòng Chờ
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Sẵn sàng cho cuộc đua tri thức!
          </p>
        </div>

        <RacingQuizPinDisplay
          pin={quiz.pin || "Không có mã PIN"}
          quizName={quiz.name}
          onStartQuiz={handleStartQuiz}
          disabled={quiz.status !== "pending" || participants.length === 0}
        />

        <RacingParticipantList participants={participants} />

        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm sm:text-base">
            🚨 Lỗi kết nối: {error}
          </div>
        )}

        {!isConnected && !error && (
          <div className="mt-4 p-3 sm:p-4 bg-orange-100 border border-orange-300 text-orange-800 rounded-md text-sm sm:text-base">
            🔄 Đang kết nối với máy chủ Racing...
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizRacingWaitingRoomPage;
