"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";

import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
  RefreshCw,
  Trophy,
  Target,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useQuizRealtime } from "@/lib/hooks/use-quiz-realtime";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { hasRole } from "@/lib/auth/role-manager";
import quizService from "@/lib/services";
import { Quiz, QuizParticipant } from "@/lib/types/quiz";
import { toast } from "sonner";
import { useQuizMonitorRealtime } from "@/lib/hooks/use-quiz-monitor-realtime";
import {
  QuizStatusChart,
  ScoreDistributionChart,
  RealtimeLeaderboard,
  ProgressTimelineChart,
  QuizProgressChart,
} from "@/components/features/charts";

const QuizMonitorPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const quizId = parseInt(id as string, 10);
  const { isAuthenticated } = useAuthStatus();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra quyền giáo viên
  const isTeacher = isAuthenticated() && hasRole(["teacher", "Teacher"]);

  // Sử dụng hook realtime để lấy danh sách người tham gia
  const { participants, isConnected, error, reloadParticipants } =
    useQuizRealtime(quizId, true); // true = isTeacher

  // Sử dụng hook monitor realtime để lấy thống kê và điểm số
  const { statistics, notifications, clearNotifications } =
    useQuizMonitorRealtime(quizId);

  // Lấy thông tin quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizById(quizId);
        console.log("Quiz Monitor API Response:", response); // Debug log

        if (response?.success && response?.data) {
          setQuiz(response.data.quiz);
        } else {
          console.warn("Unexpected quiz monitor response structure:", response);
          throw new Error("Invalid response structure");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin quiz:", error);
        toast.error("Không thể tải thông tin bài kiểm tra");
      } finally {
        setLoading(false);
      }
    };

    if (quizId && !isNaN(quizId)) {
      fetchQuiz();
    }
  }, [quizId]);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (!loading && !isTeacher) {
      toast.error("Bạn không có quyền truy cập trang này");
      router.push("/dashboard");
    }
  }, [isTeacher, loading, router]);

  // Chỉ dùng realtime socket, không cần polling
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (isConnected) {
  //       reloadParticipants();
  //     }
  //   }, 10000);

  //   return () => clearInterval(interval);
  // }, [isConnected, reloadParticipants]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang làm bài";
      case "pending":
        return "Chờ bắt đầu";
      default:
        return "Không xác định";
    }
  };

  const formatTime = (date: string | Date) => {
    if (!date) return "Chưa có";
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN");
  };

  // Tính toán thống kê (ưu tiên dữ liệu realtime)
  const stats = {
    total: statistics?.total_participants || participants.length,
    completed: participants.filter((p) => p.status === "completed").length,
    inProgress: participants.filter((p) => p.status === "in_progress").length,
    pending: participants.filter((p) => p.status === "pending").length,
    averageScore: statistics?.average_score
      ? Math.round(statistics.average_score)
      : participants.length > 0
      ? Math.round(
          participants.reduce((sum, p) => sum + p.score, 0) /
            participants.length
        )
      : 0,
    highestScore: statistics?.highest_score || 0,
    lowestScore: statistics?.lowest_score || 0,
    completionRate: statistics?.completion_rate || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
          <span className="mt-4 text-lg">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold">
            Không tìm thấy bài kiểm tra
          </h2>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Quay lại Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Theo dõi bài kiểm tra</h1>
            <p className="text-muted-foreground">{quiz.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={quiz.status === "active" ? "default" : "secondary"}>
            {quiz.status === "active"
              ? "Đang diễn ra"
              : quiz.status === "pending"
              ? "Chờ bắt đầu"
              : "Đã kết thúc"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={reloadParticipants}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Thông báo realtime */}
      {notifications.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50 hover:border-primary transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800">
                Thông báo realtime
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-blue-600 hover:text-blue-800"
              >
                Xóa tất cả
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification, index) => (
                <div
                  key={index}
                  className="text-sm text-blue-700 bg-blue-100 p-2 rounded"
                >
                  {notification}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Thống kê tổng quan với tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="charts">Biểu đồ</TabsTrigger>
          <TabsTrigger value="leaderboard">Xếp hạng</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Thống kê nhanh */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card className="border-2 hover:border-primary transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Tổng học viên
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Hoàn thành
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.completed}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Đang làm
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.inProgress}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Chờ bắt đầu
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.pending}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Điểm TB
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.averageScore}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Điểm cao nhất
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.highestScore}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Biểu đồ theo dõi tiến trình trong tổng quan */}
          <QuizProgressChart participants={participants} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          {/* Biểu đồ thống kê */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuizStatusChart data={stats} />
            <ScoreDistributionChart participants={participants} />
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <RealtimeLeaderboard participants={participants} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <ProgressTimelineChart participants={participants} />
        </TabsContent>
      </Tabs>

      {/* Danh sách học viên */}
      <Card className="border-2 hover:border-primary transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Danh sách học viên ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có học viên nào tham gia
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((participant) => (
                <ParticipantCard
                  key={participant.user_id}
                  participant={participant}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trạng thái kết nối */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border-2 border-orange-300 text-orange-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="font-medium">Đang kết nối lại...</span>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          <span className="font-medium">Lỗi: {error}</span>
        </div>
      )}

      {isConnected && !error && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-2 border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Kết nối thành công</span>
        </div>
      )}
    </div>
  );
};

// Component hiển thị thông tin từng học viên
const ParticipantCard: React.FC<{
  participant: QuizParticipant;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  formatTime: (date: string | Date) => string;
}> = ({ participant, getStatusColor, getStatusText, formatTime }) => {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
            <span className="font-bold text-primary text-lg">
              {participant.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-lg">{participant.name}</h3>
            <p className="text-sm text-muted-foreground">{participant.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Tiến độ */}
          {participant.progress !== null &&
            participant.progress !== undefined && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <div className="w-24">
                  <Progress value={participant.progress} className="h-2" />
                </div>
                <span className="text-sm font-medium">
                  {participant.progress}%
                </span>
              </div>
            )}

          {/* Điểm số */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Điểm</p>
            <p className="font-bold text-lg">{participant.score}</p>
          </div>

          {/* Trạng thái */}
          <Badge className={getStatusColor(participant.status)}>
            {getStatusText(participant.status)}
          </Badge>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      {(participant.correct_answers !== null ||
        participant.total_answers !== null ||
        participant.current_question_id !== null) && (
        <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {participant.correct_answers !== null &&
            participant.total_answers !== null && (
              <div>
                <span className="text-muted-foreground">Trả lời: </span>
                <span className="font-medium">
                  {participant.correct_answers}/{participant.total_answers} đúng
                </span>
              </div>
            )}

          {participant.current_question_id !== null && (
            <div>
              <span className="text-muted-foreground">Câu hiện tại: </span>
              <span className="font-medium">
                #{participant.current_question_id}
              </span>
            </div>
          )}

          <div>
            <span className="text-muted-foreground">Lần cuối: </span>
            <span className="font-medium">
              {formatTime(participant.last_accessed)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizMonitorPage;
