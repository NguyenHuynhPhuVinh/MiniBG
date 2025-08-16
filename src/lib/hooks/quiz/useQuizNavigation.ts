import { useState, useEffect, useCallback } from "react";
import { QuestionRoundState } from "@/lib/types/quiz";

interface UseQuizNavigationProps {
  questionsInCurrentRound: number[];
  canNavigateBack: boolean;
  questionStates: Record<number, QuestionRoundState>;
  onMoveToNextRound: () => void;
  moveToNextRound: (
    updatedQuestionStates?: Record<number, QuestionRoundState>
  ) => void;
  questionsLength: number;
  currentRound: number;
  onNavigationChange?: (currentQuestionIndex: number) => void;
  initialCurrentQuestionIndex?: number;
}

interface UseQuizNavigationReturn {
  currentQuestionIndex: number;
  autoNavigateTimer: NodeJS.Timeout | null;
  setCurrentQuestionIndex: (index: number) => void;
  handlePrevQuestion: () => void;
  handleNextQuestion: () => void;
  isLastQuestionInRound: () => boolean;
  canMoveToNextRound: () => boolean;
  handleAnswerSubmit: (
    selectedAnswer: number,
    isCorrect: boolean,
    onUpdatePosition: () => Promise<void>
  ) => void;
}

export const useQuizNavigation = ({
  questionsInCurrentRound,
  canNavigateBack,
  questionStates,
  moveToNextRound,
  questionsLength,
  currentRound,
  onNavigationChange,
  initialCurrentQuestionIndex,
}: UseQuizNavigationProps): UseQuizNavigationReturn => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    initialCurrentQuestionIndex ?? 0
  );
  const [autoNavigateTimer, setAutoNavigateTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [previousRound, setPreviousRound] = useState(currentRound);

  const handlePrevQuestion = useCallback(() => {
    // Hủy bỏ bộ đếm thời gian tự động chuyển câu nếu có
    if (autoNavigateTimer) {
      clearTimeout(autoNavigateTimer);
      setAutoNavigateTimer(null);
    }

    // Chỉ cho phép quay lại nếu round config cho phép
    if (canNavigateBack) {
      const currentIndexInRound =
        questionsInCurrentRound.indexOf(currentQuestionIndex);
      if (currentIndexInRound > 0) {
        const prevQuestionInRound =
          questionsInCurrentRound[currentIndexInRound - 1];
        setCurrentQuestionIndex(prevQuestionInRound);
      }
    }
  }, [
    autoNavigateTimer,
    canNavigateBack,
    questionsInCurrentRound,
    currentQuestionIndex,
  ]);

  const handleNextQuestion = useCallback(() => {
    // Hủy bỏ bộ đếm thời gian tự động chuyển câu nếu có
    if (autoNavigateTimer) {
      clearTimeout(autoNavigateTimer);
      setAutoNavigateTimer(null);
    }

    const currentIndexInRound =
      questionsInCurrentRound.indexOf(currentQuestionIndex);
    if (currentIndexInRound < questionsInCurrentRound.length - 1) {
      const nextQuestionInRound =
        questionsInCurrentRound[currentIndexInRound + 1];
      setCurrentQuestionIndex(nextQuestionInRound);
    }
  }, [autoNavigateTimer, questionsInCurrentRound, currentQuestionIndex]);

  // Kiểm tra xem có phải câu cuối của vòng không
  const isLastQuestionInRound = useCallback(() => {
    const currentIndexInRound =
      questionsInCurrentRound.indexOf(currentQuestionIndex);
    return currentIndexInRound === questionsInCurrentRound.length - 1;
  }, [questionsInCurrentRound, currentQuestionIndex]);

  // Kiểm tra xem có thể chuyển vòng không (ở câu cuối và chưa trả lời)
  const canMoveToNextRound = useCallback(() => {
    return (
      isLastQuestionInRound() &&
      !questionStates[currentQuestionIndex]?.isAnswered
    );
  }, [isLastQuestionInRound, questionStates, currentQuestionIndex]);

  // Xử lý khi trả lời câu hỏi
  const handleAnswerSubmit = useCallback(
    (
      selectedAnswer: number,
      isCorrect: boolean,
      onUpdatePosition: () => Promise<void>
    ) => {
      console.log("=== ANSWERING QUESTION ===");
      console.log("Question index:", currentQuestionIndex);
      console.log("Selected answer:", selectedAnswer);
      console.log("Is correct:", isCorrect);
      console.log("Current round:", currentRound);

      // Cập nhật vị trí bảng xếp hạng sau khi trả lời
      try {
        setTimeout(async () => {
          await onUpdatePosition();
        }, 1000);
      } catch (error) {
        console.error("Error updating position after answer:", error);
      }

      // Hủy bỏ bộ đếm thời gian hiện tại nếu có
      if (autoNavigateTimer) {
        clearTimeout(autoNavigateTimer);
      }

      // Kiểm tra xem có phải câu cuối của vòng không
      const currentIndexInRound =
        questionsInCurrentRound.indexOf(currentQuestionIndex);

      if (currentIndexInRound !== questionsInCurrentRound.length - 1) {
        // Không phải câu cuối - tự động chuyển câu tiếp theo sau 5 giây
        const timer = setTimeout(() => {
          handleNextQuestion();
        }, 5000);
        setAutoNavigateTimer(timer);
      } else {
        // Câu cuối của vòng - xử lý chuyển vòng hoặc kết thúc
        setTimeout(() => {
          console.log("Last question in round - checking for round transition");

          // Tạo state mới với câu vừa trả lời
          const updatedStates = {
            ...questionStates,
            [currentQuestionIndex]: {
              questionIndex: currentQuestionIndex,
              isAnswered: true,
              isCorrect,
              selectedAnswer,
              roundAnswered: currentRound,
            },
          };

          console.log("Updated states after last question:", updatedStates);

          // Luôn gọi moveToNextRound để xử lý logic rounds
          // Logic sẽ được xử lý trong useQuizRounds để quyết định:
          // - Chuyển vòng tiếp theo nếu còn câu cần làm lại
          // - Hoàn thành quiz nếu tất cả câu đều đúng hoặc không còn câu nào cần làm lại
          console.log("Moving to next round with updated states");
          moveToNextRound(updatedStates);
        }, 1000);
      }
    },
    [
      currentQuestionIndex,
      currentRound,
      autoNavigateTimer,
      questionsInCurrentRound,
      handleNextQuestion,
      setAutoNavigateTimer,
      questionsLength,
      questionStates,
      moveToNextRound,
    ]
  );

  // Detect khi vòng thay đổi và reset currentQuestionIndex
  useEffect(() => {
    if (currentRound !== previousRound) {
      console.log(`Round changed from ${previousRound} to ${currentRound}`);
      setPreviousRound(currentRound);

      // Reset về câu đầu tiên của vòng mới
      if (questionsInCurrentRound.length > 0) {
        console.log(
          "Resetting to first question in new round:",
          questionsInCurrentRound[0]
        );
        setCurrentQuestionIndex(questionsInCurrentRound[0]);
      }
    }
  }, [currentRound, previousRound, questionsInCurrentRound]);

  // Đảm bảo currentQuestionIndex hợp lệ khi questionsInCurrentRound thay đổi
  useEffect(() => {
    if (
      questionsInCurrentRound.length > 0 &&
      !questionsInCurrentRound.includes(currentQuestionIndex)
    ) {
      console.log(
        "Resetting currentQuestionIndex to first question in round:",
        questionsInCurrentRound[0]
      );
      setCurrentQuestionIndex(questionsInCurrentRound[0]);
    }
  }, [questionsInCurrentRound, currentQuestionIndex]);

  // Gọi onNavigationChange khi currentQuestionIndex thay đổi
  useEffect(() => {
    if (onNavigationChange) {
      onNavigationChange(currentQuestionIndex);
    }
  }, [currentQuestionIndex, onNavigationChange]);

  // Hủy bỏ bộ đếm thời gian khi component bị hủy
  useEffect(() => {
    return () => {
      if (autoNavigateTimer) {
        clearTimeout(autoNavigateTimer);
      }
    };
  }, [autoNavigateTimer]);

  return {
    currentQuestionIndex,
    autoNavigateTimer,
    setCurrentQuestionIndex,
    handlePrevQuestion,
    handleNextQuestion,
    isLastQuestionInRound,
    canMoveToNextRound,
    handleAnswerSubmit,
  };
};
