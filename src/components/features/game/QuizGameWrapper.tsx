"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StartGame from "../../../../phaser/GameEngine";
import { EventBus } from "../../../../phaser/EventBus";
import { quizService } from "@/lib/services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { QuizRoundOverlay } from "./QuizRoundOverlay";
import { MinigameOverlay } from "./MinigameOverlay";
import { SceneLoadingOverlay } from "./SceneLoadingOverlay";
import { QuizCompletion } from "@/components/features/quiz/live/quiz-completion";
import { MinigameCore } from "../../../../phaser/classes";
import { useQuizSocket } from "@/lib/hooks/quiz/useQuizSocket";

interface QuizGameWrapperProps {
  quizId: number;
  user: any;
}

const QuizGameWrapper: React.FC<QuizGameWrapperProps> = ({ quizId, user }) => {
  const router = useRouter();
  const game = useRef<Phaser.Game | null>(null);
  const [quizData, setQuizData] = useState<any>(null);

  // Overlay states
  const [showQuizOverlay, setShowQuizOverlay] = useState(false);
  const [currentQuizData, setCurrentQuizData] = useState<any>(null);
  const [showSceneLoading, setShowSceneLoading] = useState(false);
  const [showFinalCompletion, setShowFinalCompletion] = useState(false);

  // Game progress tracking
  const [totalRounds] = useState(4);
  const [roundScores, setRoundScores] = useState<{
    [key: number]: { score: number; total: number; wrongQuestions?: any[] };
  }>({});
  const [isFinalCompletion, setIsFinalCompletion] = useState(false);
  const [needsRound5, setNeedsRound5] = useState(false);
  const [globalWrongQuestions, setGlobalWrongQuestions] = useState<any[]>([]);
  const globalWrongQuestionsRef = useRef<any[]>([]);
  const [isSpecialRoundActive, setIsSpecialRoundActive] = useState(false);

  // Socket integration cho bảng xếp hạng realtime
  const { userPosition, totalParticipants, updateUserPosition } = useQuizSocket(
    {
      quizId,
      user,
      questionsLength: quizData?.questions?.length || 0,
    }
  );

  // Khởi tạo Phaser game
  useLayoutEffect(() => {
    if (game.current === null) {
      console.log("🎮 Initializing Phaser game...");

      // Reset MinigameCore hoàn toàn khi bắt đầu game mới
      MinigameCore.getInstance().resetCompletely();

      game.current = StartGame("quiz-game-container");
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        game.current = null;
      }
    };
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Lắng nghe khi scene ready
    EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
      console.log("🎮 Scene ready:", scene_instance.scene.key);

      // Nếu là PreloadScene, bắt đầu load quiz data
      if (scene_instance.scene.key === "PreloadScene") {
        loadQuizData();
      }
    });

    // Lắng nghe request quiz data từ Phaser
    EventBus.on("request-quiz-data", () => {
      console.log("📥 Phaser requesting quiz data");
      if (quizData) {
        EventBus.emit("quiz-data-loaded", quizData);
      } else {
        loadQuizData();
      }
    });

    // Lắng nghe show quiz overlay
    EventBus.on("show-quiz-overlay", (data: any) => {
      console.log("🎮 QuizGameWrapper: Received show-quiz-overlay event", data);

      // Nếu đang trong final completion, ignore
      if (isFinalCompletion) {
        console.log("🚫 Ignoring show-quiz-overlay during final completion");
        return;
      }

      setCurrentQuizData(data);
      setShowQuizOverlay(true);
    });

    // Lắng nghe hide quiz overlay
    EventBus.on("hide-quiz-overlay", () => {
      setShowQuizOverlay(false);
      setCurrentQuizData(null);
    });

    // Lắng nghe scene loading events
    EventBus.on("scene-loading-start", () => {
      setShowSceneLoading(true);
    });

    // Bỏ auto-hide khi scene loading complete
    // EventBus.on("scene-loading-complete", () => {
    //   setShowSceneLoading(false);
    // });

    // Chỉ ẩn khi user nhấn nút bắt đầu
    EventBus.on("scene-loading-user-start", () => {
      setShowSceneLoading(false);
      console.log("🎮 User started game, hiding scene loading overlay");
    });

    // Quiz completion giờ được handle bởi QuizRoundOverlay

    return () => {
      EventBus.removeListener("current-scene-ready");
      EventBus.removeListener("request-quiz-data");
      EventBus.removeListener("show-quiz-overlay");
      EventBus.removeListener("hide-quiz-overlay");
      EventBus.removeListener("quiz-completed");
      EventBus.removeListener("scene-loading-start");
      EventBus.removeListener("scene-loading-user-start");
    };
  }, [quizData, router]);

  /**
   * 📥 LOAD QUIZ DATA - Load quiz data từ backend
   */
  const loadQuizData = async () => {
    try {
      console.log("📥 Loading quiz data for quiz:", quizId);

      // Load quiz info và questions song song
      const [quizInfoResponse, questionsResponse] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.getQuizQuestions(quizId),
      ]);

      console.log("📝 Quiz Info Response:", quizInfoResponse);
      console.log("📝 Questions Response:", questionsResponse);

      // Extract duration
      let duration = 300; // Default 5 phút
      if (quizInfoResponse?.success && quizInfoResponse?.data?.quiz?.duration) {
        const durationInMinutes = parseInt(quizInfoResponse.data.quiz.duration);
        duration = durationInMinutes * 60;
      } else if (quizInfoResponse?.data?.duration) {
        const durationInMinutes = parseInt(quizInfoResponse.data.duration);
        duration = durationInMinutes * 60;
      }

      // Extract questions
      let questions: any[] = [];
      if (
        questionsResponse?.success &&
        questionsResponse?.data &&
        Array.isArray(questionsResponse.data.questions)
      ) {
        questions = questionsResponse.data.questions;
      }

      const data = {
        quizId: quizId,
        userId: user.user_id,
        questions: questions,
        duration: duration,
        quizInfo: quizInfoResponse?.data?.quiz || quizInfoResponse?.data,
      };

      setQuizData(data);

      // Emit data cho Phaser
      EventBus.emit("quiz-data-loaded", data);
    } catch (error) {
      console.error("❌ Error loading quiz data:", error);
      toast.error("Không thể tải dữ liệu quiz. Vui lòng thử lại.");
      router.push("/dashboard");
    }
  };

  /**
   * ✅ HANDLE QUIZ OVERLAY COMPLETE - Xử lý khi quiz overlay hoàn thành
   */
  const handleQuizOverlayComplete = (
    score: number,
    totalQuestions: number,
    wrongQuestions?: any[]
  ) => {
    const roundNumber = currentQuizData?.roundNumber;

    console.log(
      `🎮 handleQuizOverlayComplete called for Round ${roundNumber} with score=${score}`
    );

    // Luôn ẩn overlay sau khi một vòng kết thúc
    setShowQuizOverlay(false);
    setCurrentQuizData(null);

    // 1. Lưu điểm và các câu hỏi sai
    if (roundNumber && !roundScores[roundNumber]) {
      const updatedRoundScores = {
        ...roundScores,
        [roundNumber]: {
          score,
          total: totalQuestions,
          wrongQuestions: wrongQuestions || [],
        },
      };
      setRoundScores(updatedRoundScores);

      if (wrongQuestions && wrongQuestions.length > 0) {
        setGlobalWrongQuestions((prev) => {
          const existingIds = new Set(prev.map((q) => q.question_id));
          const newQuestions = wrongQuestions.filter(
            (q) => !existingIds.has(q.question_id)
          );
          const newList = [...prev, ...newQuestions];
          globalWrongQuestionsRef.current = newList;
          return newList;
        });
      }
    }

    // 2. Quyết định hành động tiếp theo
    if (roundNumber < totalRounds) {
      // Nếu là Vòng 1, 2, 3 -> Báo cho RoundManager để bắt đầu vòng tiếp theo
      console.log(`🎯 Emitting round-quiz-completed for round ${roundNumber}`);
      EventBus.emit("round-quiz-completed", { score });
    } else if (roundNumber === totalRounds) {
      // Nếu là Vòng 4 -> Kiểm tra xem có cần Vòng 5 không
      setTimeout(() => {
        const finalWrongQuestions = globalWrongQuestionsRef.current;
        if (finalWrongQuestions.length > 0) {
          // Có câu sai, chuẩn bị cho Vòng 5
          console.log(
            `🔄 Round 4 completed. Preparing Round 5 with ${finalWrongQuestions.length} questions.`
          );
          setNeedsRound5(true);
          setIsSpecialRoundActive(true);
          const round5Data = {
            roundNumber: 5,
            questions: finalWrongQuestions,
            timeLimit: 300,
            quizId: quizId,
            userId: user?.user_id || "anonymous",
            isSpecialRound: true,
          };
          setCurrentQuizData(round5Data);
          setShowQuizOverlay(true); // Hiển thị lại overlay cho Vòng 5
        } else {
          // Không có câu sai, kết thúc game
          console.log(
            `🎉 All rounds completed with no wrong answers. Showing final completion.`
          );
          setIsFinalCompletion(true);
          setShowFinalCompletion(true);
        }
      }, 100);
    } else if (roundNumber === 5) {
      // Nếu là Vòng 5 -> Luôn kết thúc game
      console.log(`🎉 Special Round 5 completed. Showing final completion.`);
      setIsFinalCompletion(true);
      setShowFinalCompletion(true);
    }
  };

  /**
   * ❌ HANDLE QUIZ OVERLAY CLOSE - Xử lý khi quiz overlay bị đóng (bao gồm final completion)
   */
  const handleQuizOverlayClose = () => {
    console.log(`🏠 QuizGameWrapper: handleQuizOverlayClose called`);

    // Reset states
    setIsFinalCompletion(false);
    setShowFinalCompletion(false);
    setIsSpecialRoundActive(false);
    setShowQuizOverlay(false);
    setCurrentQuizData(null);

    // Cleanup Phaser game trước khi navigate
    if (game.current) {
      game.current.destroy(true);
      game.current = null;
    }

    // Navigate về dashboard
    router.push("/dashboard");
  };

  return (
    <div className="relative w-full h-full">
      {/* Game Container */}
      <div
        id="quiz-game-container"
        className="absolute inset-0 w-full h-full"
      />

      {/* Scene Loading Overlay - Full screen khi scene đang load */}
      <SceneLoadingOverlay isVisible={showSceneLoading} />

      {/* Minigame Overlay - Hiển thị điểm và thời gian */}
      <MinigameOverlay
        isVisible={!showQuizOverlay && !showSceneLoading}
        className=""
        userPosition={userPosition}
        totalParticipants={totalParticipants}
      />

      {/* Quiz Round Overlay */}
      {showQuizOverlay && currentQuizData && (
        <QuizRoundOverlay
          isVisible={showQuizOverlay}
          roundNumber={currentQuizData.roundNumber}
          questions={currentQuizData.questions}
          timeLimit={currentQuizData.timeLimit}
          quizId={currentQuizData.quizId}
          userId={currentQuizData.userId}
          onComplete={handleQuizOverlayComplete}
          onClose={handleQuizOverlayClose}
          // Props cho vòng 5 đặc biệt
          isSpecialRound={currentQuizData.isSpecialRound || false}
          wrongQuestions={
            currentQuizData.isSpecialRound ? currentQuizData.questions : []
          }
          // Props cho bảng xếp hạng
          updateUserPosition={updateUserPosition}
          userPosition={userPosition}
          totalParticipants={totalParticipants}
        />
      )}

      {/* Final Quiz Completion - Chuyển từ QuizRoundOverlay lên đây */}
      {showFinalCompletion &&
        (() => {
          console.log(`🎊 Rendering QuizCompletion from QuizGameWrapper`);

          // Tính toán điểm số cuối cùng từ roundScores
          let finalScore = 0;
          let totalQuestions = 0;

          // Tính tổng điểm từ các round 1-4 (không bao gồm vòng 5)
          Object.entries(roundScores).forEach(([roundNum, round]) => {
            const roundNumber = parseInt(roundNum);
            if (roundNumber <= 4) {
              finalScore += round.score;
              totalQuestions += round.total;
            }
          });

          const percentage =
            totalQuestions > 0
              ? Math.round((finalScore / totalQuestions) * 100)
              : 0;

          // Tạo round history
          const roundHistory = Array.from(
            { length: needsRound5 ? 5 : totalRounds },
            (_, i) => {
              const roundNum = i + 1;
              if (roundScores[roundNum]) {
                const roundData = roundScores[roundNum];
                return {
                  round: roundNum,
                  questionsAttempted: Array.from(
                    { length: roundData.total },
                    (_, j) => j
                  ),
                  correctAnswers: roundData.score,
                  incorrectAnswers: roundData.total - roundData.score,
                };
              } else {
                return {
                  round: roundNum,
                  questionsAttempted: [0, 1, 2],
                  correctAnswers: 0,
                  incorrectAnswers: 3,
                };
              }
            }
          );

          const minigameScore = MinigameCore.getInstance().getCurrentScore();

          return (
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              style={{ zIndex: 10001 }}
            >
              <QuizCompletion
                finalScore={percentage}
                correctAnswers={finalScore}
                totalQuestions={totalQuestions}
                quizId={quizId}
                roundHistory={roundHistory}
                isGameMode={true}
                onClose={handleQuizOverlayClose}
                hasRound5={needsRound5}
                round5Score={roundScores[5]?.score || 0}
                round5Total={roundScores[5]?.total || 0}
                minigameScore={minigameScore}
                // Leaderboard props cho game mode
                userPosition={userPosition}
                totalParticipants={totalParticipants}
              />
            </div>
          );
        })()}
    </div>
  );
};

export default QuizGameWrapper;
