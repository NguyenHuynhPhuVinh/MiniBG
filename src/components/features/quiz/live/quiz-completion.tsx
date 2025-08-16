"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  Home,
  Loader2,
  CheckCircle,
  XCircle,
  Target,
  Gamepad2,
  Coins,
  Star,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import LeaderboardDisplay from "./leaderboard-display";
import { quizService } from "@/lib/services/api";

// Interface cho item trong leaderboard
interface LeaderboardItem {
  user_id: string | number;
  score: number;
  name?: string;
  student_id?: string;
}

interface QuizCompletionProps {
  finalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  quizId: number;
  // Thêm props cho round system
  roundHistory?: Array<{
    round: number;
    questionsAttempted: number[];
    correctAnswers: number;
    incorrectAnswers: number;
  }>;
  // Thêm props cho game mode
  isGameMode?: boolean;
  onClose?: () => void; // Custom close handler cho game mode
  // Props cho vòng 5 đặc biệt
  hasRound5?: boolean;
  round5Score?: number;
  round5Total?: number;
  // Props cho điểm tổng từ minigame
  minigameScore?: number; // Điểm tổng từ minigame (thu thập xu, bonus, etc.)
  // Props cho bảng xếp hạng trong game mode
  userPosition?: number;
  totalParticipants?: number;
}

export const QuizCompletion: React.FC<QuizCompletionProps> = ({
  finalScore,
  correctAnswers,
  totalQuestions,
  quizId,
  roundHistory = [],
  isGameMode = false,
  onClose,
  hasRound5 = false,
  round5Score = 0,
  round5Total = 0,
  minigameScore = 0,
  userPosition,
  totalParticipants,
}) => {
  console.log(
    `🎊 QuizCompletion rendered with finalScore=${finalScore}, isGameMode=${isGameMode}`
  );
  const router = useRouter();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Lấy bảng xếp hạng khi component mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        console.log("Fetching final leaderboard for quiz:", quizId);
        const response = await quizService.getLeaderboard(quizId);
        console.log("Final leaderboard response:", response);

        if (
          response.data?.leaderboard &&
          response.data.leaderboard.length > 0
        ) {
          setLeaderboard(response.data.leaderboard);
        }
      } catch (error) {
        console.error("Error fetching final leaderboard:", error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    // Delay một chút để hiển thị kết quả cá nhân trước
    const timer = setTimeout(() => {
      fetchLeaderboard();
    }, 2000);

    return () => clearTimeout(timer);
  }, [quizId]);

  // Xác định màu sắc và thông điệp dựa trên điểm số
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Xuất sắc! Bạn đã làm rất tốt!";
    if (score >= 60) return "Tốt! Bạn đã vượt qua bài quiz!";
    return "Cần cố gắng thêm! Hãy ôn tập và thử lại!";
  };

  // Function để toggle hiển thị bảng xếp hạng
  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
  };

  const handleBackToResults = () => {
    setShowLeaderboard(false);
  };

  // Nếu đang hiển thị bảng xếp hạng
  if (showLeaderboard) {
    return (
      <div className="fixed inset-0 bg-background overflow-y-auto">
        <div className="min-h-full">
          <div className="container mx-auto p-4">
            {/* Header với nút quay lại - Sticky */}
            <div className="sticky top-0 bg-background z-10 flex justify-between items-center mb-6 pt-4 pb-4 border-b">
              <Button
                onClick={handleBackToResults}
                variant="outline"
                className="flex items-center gap-2"
              >
                ← Quay lại kết quả
              </Button>
              <Button
                onClick={() => {
                  if (isGameMode && onClose) {
                    onClose(); // Sử dụng custom close handler cho game mode
                  } else {
                    router.push("/dashboard");
                  }
                }}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Về Dashboard
              </Button>
            </div>

            {/* Bảng xếp hạng */}
            <div className="pb-8">
              <LeaderboardDisplay
                leaderboard={leaderboard}
                totalQuestions={totalQuestions}
                currentQuestionIndex={totalQuestions - 1}
                isLastQuestion={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl lg:max-w-4xl my-4 sm:my-8"
        >
        <Card className={`${isGameMode ? 'border border-primary/20' : 'border-0'} bg-card`}>
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 20 }}
              className="flex justify-center mb-4"
            >
              <div className={`p-4 rounded-full ${isGameMode ? 'bg-gradient-to-br from-primary/20 to-primary/10' : 'bg-primary/10'}`}>
                {isGameMode ? (
                  <Gamepad2 className="h-12 w-12 text-primary" />
                ) : (
                  <Trophy className="h-12 w-12 text-primary" />
                )}
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {isGameMode ? 'Game Hoàn Thành!' : 'Quiz Hoàn Thành!'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Điểm số chính */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={`text-center p-6 rounded-2xl border ${getScoreBgColor(
                finalScore
              )}`}
            >
              <div
                className={`text-5xl font-bold mb-2 ${getScoreColor(
                  finalScore
                )}`}
              >
                {finalScore}%
              </div>
              <p className="text-base text-muted-foreground font-medium">
                {getScoreMessage(finalScore)}
              </p>
            </motion.div>

            {/* Điểm tổng từ minigame - chỉ hiển thị khi là game mode */}
            {isGameMode && minigameScore > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gamepad2 className="h-5 w-5 text-blue-600" />
                  <div className="text-3xl font-bold text-blue-600">
                    {minigameScore}
                  </div>
                  <Coins className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm text-blue-700 font-medium">
                  Điểm minigame
                </p>

                {/* Achievement badge nếu điểm cao */}
                {minigameScore >= 100 && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <Trophy className="h-3 w-3" />
                    <span>Xuất sắc!</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Thông tin xếp hạng - chỉ hiển thị khi là game mode và có dữ liệu */}
            {isGameMode && userPosition && totalParticipants && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-center p-4 rounded-xl border bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <div className="text-3xl font-bold text-yellow-600">
                    #{userPosition}
                  </div>
                </div>
                <p className="text-sm text-yellow-700 font-medium">
                  Xếp hạng: {userPosition}/{totalParticipants}
                </p>

                {/* Badge cho top 3 */}
                {userPosition <= 3 && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <Star className="h-3 w-3" />
                    <span>Top {userPosition}!</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Thống kê chi tiết */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={`grid gap-3 sm:gap-4 ${
                hasRound5
                  ? 'grid-cols-2 sm:grid-cols-4'
                  : 'grid-cols-3'
              }`}
            >
              <div className="text-center p-3 sm:p-4 bg-card rounded-xl border-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {correctAnswers}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Câu đúng
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-card rounded-xl border-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {totalQuestions - correctAnswers}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Câu sai
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-card rounded-xl border-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {roundHistory.length}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Số vòng
                </p>
              </div>

              {/* Vòng 5 đặc biệt - chỉ hiển thị khi có */}
              {hasRound5 && (
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 relative overflow-hidden">
                  <div className="absolute top-1 right-1">
                    <Star className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">
                      {round5Score}/{round5Total}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-700 font-medium">
                    Vòng 5 Đặc Biệt
                  </p>
                </div>
              )}
            </motion.div>

            {/* Thống kê theo vòng - Giao diện sạch */}
            {roundHistory.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-base sm:text-lg font-semibold text-center text-foreground mb-2">
                  Lịch sử vòng
                </h3>

                {/* List layout cho các vòng - 1 vòng trên 1 dòng */}
                <div className="space-y-3">
                  {roundHistory.map((round) => (
                    <div
                      key={round.round}
                      className={`border-0 rounded-lg p-3 sm:p-4 ${
                        round.round === 5 && isGameMode
                          ? 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 relative overflow-hidden'
                          : 'bg-muted/30'
                      }`}
                    >
                      {/* Vòng 5 có decoration đặc biệt - chỉ trong game mode */}
                      {round.round === 5 && isGameMode && (
                        <>
                          <div className="absolute top-2 right-2">
                            <Star className="h-4 w-4 text-purple-400" />
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <Zap className="h-3 w-3 text-purple-300" />
                          </div>
                        </>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Thông tin vòng */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold ${
                            round.round === 5 && isGameMode
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                              : 'bg-primary text-primary-foreground'
                          }`}>
                            {round.round === 5 && isGameMode ? (
                              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              round.round
                            )}
                          </div>
                          <div>
                            <div className={`font-medium text-sm sm:text-base ${
                              round.round === 5 && isGameMode ? 'text-purple-800' : 'text-foreground'
                            }`}>
                              {round.round === 5 && isGameMode ? 'Vòng 5 - Đặc Biệt' : `Vòng ${round.round}`}
                            </div>
                            <div className={`text-xs sm:text-sm ${
                              round.round === 5 && isGameMode ? 'text-purple-600' : 'text-muted-foreground'
                            }`}>
                              {round.questionsAttempted.length} câu hỏi
                            </div>
                          </div>
                        </div>

                        {/* Kết quả */}
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div className="text-base sm:text-lg font-bold text-green-600">
                              {round.correctAnswers}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <div className="text-base sm:text-lg font-bold text-red-600">
                              {round.incorrectAnswers}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-primary" />
                            <div className="text-base sm:text-lg font-bold text-primary">
                              {Math.round(
                                (round.correctAnswers /
                                  round.questionsAttempted.length) *
                                  100
                              )}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Nút xem bảng xếp hạng */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="pt-4 space-y-3"
            >
              <Button
                onClick={handleShowLeaderboard}
                disabled={loadingLeaderboard || leaderboard.length === 0}
                className="w-full h-12 text-base font-medium rounded-xl cursor-pointer"
                size="lg"
                variant="outline"
              >
                {loadingLeaderboard ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Xem bảng xếp hạng
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  if (isGameMode && onClose) {
                    onClose(); // Sử dụng custom close handler cho game mode
                  } else {
                    router.push("/dashboard");
                  }
                }}
                className="w-full h-12 text-base font-medium rounded-xl cursor-pointer"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Về Dashboard
              </Button>

              {/* Thêm nút chơi lại cho game mode */}
              {isGameMode && (
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full h-12 text-base font-medium rounded-xl cursor-pointer"
                  size="lg"
                  variant="outline"
                >
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Chơi lại
                </Button>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
};

export default QuizCompletion;
