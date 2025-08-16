"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, X, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { quizService } from "@/lib/services/api";
import { toast } from "sonner";
import { Question, Answer, QuizRound } from "@/lib/types/quiz";
import { QuizHeader } from "@/components/features/quiz/live/quiz-header";
import { QuizQuestionDisplay } from "@/components/features/quiz/live/quiz-question-display";
import { RoundTransition } from "@/components/features/quiz/live/round-transition";

interface QuizRoundOverlayProps {
  isVisible: boolean;
  roundNumber: number;
  questions: Question[];
  timeLimit: number;
  quizId: number;
  userId: number | string;
  onComplete: (
    score: number,
    totalQuestions: number,
    wrongQuestions?: Question[]
  ) => void;
  onClose: () => void;
  // Props cho vòng 5 đặc biệt
  isSpecialRound?: boolean;
  wrongQuestions?: Question[];
  // Props cho bảng xếp hạng
  updateUserPosition?: () => Promise<void>;
  userPosition?: number;
  totalParticipants?: number;
}

export const QuizRoundOverlay: React.FC<QuizRoundOverlayProps> = ({
  isVisible,
  roundNumber,
  questions,
  timeLimit,
  quizId,
  userId,
  onComplete,
  onClose,
  isSpecialRound = false,
  wrongQuestions = [],
  updateUserPosition,
  userPosition,
  totalParticipants,
}) => {
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);
  const wrongAnswersRef = useRef<Question[]>([]);

  // Ref để track score real-time
  const scoreRef = useRef(0);
  const initializedRef = useRef<string | null>(null);
  const completedRef = useRef(false); // Guard để tránh duplicate onComplete calls

  // Timer state
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [startTime] = useState<number>(Date.now());

  // Initialize quiz khi component mount
  useEffect(() => {
    if (isVisible && questions.length > 0) {
      // Tránh re-initialize nếu đã init cho round này
      const roundKey = `${roundNumber}-${questions.length}`;
      if (initializedRef.current === roundKey) {
        console.log(`⚠️ Round ${roundNumber} already initialized, skipping`);
        return;
      }

      console.log(
        `🔄 Initializing Round ${roundNumber}: ${questions.length} questions, resetting score to 0`
      );

      if (isSpecialRound) {
        console.log(`🔍 Special Round 5 questions received:`);
        console.log(`   Questions count: ${questions.length}`);
        console.log(
          `   Question IDs:`,
          questions.map((q) => q.question_id)
        );
        console.log(`   Questions:`, questions);
      }
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowResult(false);
      scoreRef.current = 0; // Reset score ref trước
      setScore(0);
      setIsCompleted(false);
      setTimeLeft(timeLimit);
      completedRef.current = false; // Reset completion guard

      // KHÔNG reset wrongAnswersRef để persist qua các round
      // wrongAnswersRef sẽ accumulate tất cả câu sai từ round 1-4
      console.log(
        `🔄 NOT resetting wrongAnswersRef for round ${roundNumber} (current: ${wrongAnswersRef.current.length} questions)`
      );
      console.log(
        `🔄 Current wrongAnswersRef:`,
        wrongAnswersRef.current.map((q) => q.question_id)
      );

      initializedRef.current = roundKey;
    }
  }, [isVisible, roundNumber, questions, timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (!isVisible || isCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        setIsTimeWarning(newTime <= 10);

        if (newTime <= 0) {
          clearInterval(timer);
          handleQuizTimeout();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, isCompleted, timeLeft]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle quiz timeout
  const handleQuizTimeout = () => {
    if (completedRef.current) {
      console.log(`⚠️ Quiz timeout ignored - already completed`);
      return;
    }
    completedRef.current = true;
    setIsCompleted(true);
    setTimeout(() => {
      // Sử dụng scoreRef khi timeout
      onComplete(scoreRef.current, questions.length);
    }, 1500);
  };

  // Xử lý khi chọn đáp án
  const handleAnswerSelect = async (answerId: number) => {
    if (isAnswered) return;

    console.log(
      `🔍 Answer select: questionIndex=${currentQuestionIndex}, answerId=${answerId}, currentScore=${scoreRef.current}`
    );

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Tìm đáp án được chọn
    const selectedAnswerObj = currentQuestion.answers.find(
      (a) => a.answer_id === answerId
    );
    if (!selectedAnswerObj) return;

    const correct = selectedAnswerObj.iscorrect;

    setSelectedAnswer(answerId);
    setIsAnswered(true);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const oldScore = scoreRef.current;
      scoreRef.current += 1; // Update ref trước
      setScore(scoreRef.current); // Update state để trigger re-render
      console.log(`✅ Score updated: ${oldScore} → ${scoreRef.current}`);
    } else {
      console.log(`❌ Wrong answer, score remains: ${scoreRef.current}`);
    }

    try {
      // Gửi đáp án lên backend
      await quizService.submitRealtimeAnswer(
        quizId,
        currentQuestion.question_id,
        answerId,
        startTime,
        userId,
        false // Không hiển thị leaderboard trong round mode
      );
    } catch (error) {
      toast.error("Không thể gửi đáp án");
    }

    // Auto chuyển câu sau 2 giây
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  // Chuyển câu tiếp theo
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      // Hoàn thành round - tính score cuối cùng
      if (completedRef.current) {
        console.log(`⚠️ Round completion ignored - already completed`);
        return;
      }
      completedRef.current = true;
      setIsCompleted(true);
      setTimeout(() => {
        // Sử dụng scoreRef để có score chính xác
        const finalScore = scoreRef.current;
        console.log(
          `🎯 Round ${roundNumber} Final Score: ${finalScore}/${questions.length} (scoreRef: ${scoreRef.current}, state: ${score})`
        );

        // Gọi onComplete và để QuizGameWrapper quyết định làm gì tiếp theo
        onComplete(finalScore, questions.length, wrongAnswersRef.current);
      }, 1500);
    }
  };

  // Kiểm tra visibility
  if (!isVisible) return null;

  // Round completed state - Sử dụng RoundTransition component
  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <RoundTransition
        visible={isCompleted}
        currentRound={roundNumber + 1} // +1 vì RoundTransition hiển thị "Hoàn thành Vòng X"
        roundConfig={{
          round: roundNumber + 1,
          name: `Vòng ${roundNumber + 1}`,
          description: `Chuẩn bị vòng tiếp theo`,
          allowBackNavigation: false,
          trackIncorrectAnswers: true,
        }}
        questionsInRound={questions.length}
        previousRoundStats={{
          attempted: questions.length,
          correct: score,
          incorrect: questions.length - score,
        }}
        onComplete={() => {
          // Callback này sẽ được gọi sau khi animation hoàn thành
          // Trigger onComplete của parent component
          if (completedRef.current) {
            console.log(
              `⚠️ RoundTransition onComplete ignored - already completed`
            );
            return;
          }
          completedRef.current = true;
          setTimeout(() => {
            onComplete(scoreRef.current, questions.length);
          }, 500);
        }}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-full flex flex-col">
        {/* Tận dụng QuizHeader từ quiz-live system - Fixed header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <QuizHeader
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            currentScore={score}
            totalQuestionsOverall={questions.length}
            quizTimeLeft={timeLeft}
            onPrevQuestion={() => {
              if (currentQuestionIndex > 0 && !isAnswered) {
                setCurrentQuestionIndex((prev) => prev - 1);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setShowResult(false);
              }
            }}
            onNextQuestion={() => {
              if (currentQuestionIndex < questions.length - 1 && isAnswered) {
                handleNextQuestion();
              }
            }}
            formatTime={formatTime}
            // Bảng xếp hạng props
            userPosition={userPosition}
            totalParticipants={totalParticipants}
            // Round system props
            currentRound={roundNumber}
            roundConfig={{
              round: roundNumber,
              name: isSpecialRound
                ? `Vòng ${roundNumber} - Đặc Biệt`
                : `Vòng ${roundNumber}`,
              description: `Quiz vòng ${roundNumber} - ${questions.length} câu hỏi`,
              allowBackNavigation: false,
              trackIncorrectAnswers: true,
            }}
            canNavigateBack={false}
            // Navigation props
            canMoveToNextRound={false}
            // Game mode props
            isGameMode={true} // Ẩn navigation buttons trong game mode
          />
        </div>

        {/* Main content - Full scroll */}
        <div className="flex-1 pt-12">
          {/* Tận dụng QuizQuestionDisplay từ quiz-live system */}
          <QuizQuestionDisplay
            key={`round-${roundNumber}-question-${currentQuestion.question_id}-${currentQuestionIndex}`}
            question={currentQuestion}
            quizId={quizId}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answered={isAnswered}
            selectedAnswer={selectedAnswer}
            isCorrect={isCorrect}
            currentRound={roundNumber}
            roundAnswered={isAnswered ? roundNumber : 0}
            onAnswer={async (selectedAnswer, isCorrect) => {
              // Xử lý tương tự như handleAnswerSelect nhưng với interface mới
              if (isAnswered) return;

              console.log(
                `🔍 Answer select via QuizQuestionDisplay: questionIndex=${currentQuestionIndex}, answerId=${selectedAnswer}, currentScore=${scoreRef.current}`
              );

              setSelectedAnswer(selectedAnswer);
              setIsAnswered(true);
              setIsCorrect(isCorrect);
              setShowResult(true);

              if (isCorrect) {
                const oldScore = scoreRef.current;
                scoreRef.current += 1;
                setScore(scoreRef.current);
                console.log(
                  `✅ Score updated: ${oldScore} → ${scoreRef.current}`
                );
              } else {
                console.log(
                  `❌ Wrong answer, score remains: ${scoreRef.current}`
                );

                // Track câu sai cho vòng 5 (chỉ track khi không phải vòng đặc biệt)
                if (!isSpecialRound) {
                  const currentQuestion = questions[currentQuestionIndex];
                  if (
                    currentQuestion &&
                    !wrongAnswersRef.current.find(
                      (q) => q.question_id === currentQuestion.question_id
                    )
                  ) {
                    console.log(
                      `📝 Adding wrong question to Round 5: ${currentQuestion.question_id}`
                    );
                    wrongAnswersRef.current = [
                      ...wrongAnswersRef.current,
                      currentQuestion,
                    ];
                    setWrongAnswers(wrongAnswersRef.current);
                    console.log(
                      `📝 Updated wrongAnswersRef:`,
                      wrongAnswersRef.current
                    );
                  }
                }
              }

              // Cập nhật vị trí bảng xếp hạng
              if (updateUserPosition) {
                try {
                  await updateUserPosition();
                  console.log("🏆 User position updated after answer");
                } catch (error) {
                  console.error("❌ Failed to update user position:", error);
                }
              }

              // Auto chuyển câu sau 2 giây
              setTimeout(() => {
                handleNextQuestion();
              }, 2000);
            }}
          />
        </div>
      </div>
    </div>
  );
};
