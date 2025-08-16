import { useState, useCallback, useEffect } from "react";
import {
  Question,
  QuestionRoundState,
  QuizRound,
  QuestionWrongHistory,
} from "@/lib/types/quiz";

interface UseQuizRoundsProps {
  questions: Question[];
  onQuizComplete: (finalScore: number) => void;
  quizId: number;
  onStateChange?: (state: {
    currentRound: number;
    questionsInCurrentRound: number[];
    questionStates: Record<number, QuestionRoundState>;
    questionWrongHistory: Record<number, QuestionWrongHistory>;
    questionIncorrectCount: Record<number, number>;
    roundHistory: Array<{
      round: number;
      questionsAttempted: number[];
      correctAnswers: number;
      incorrectAnswers: number;
    }>;
    showRoundTransition: boolean;
    canNavigateBack: boolean;
  }) => void;
  initialState?: {
    currentRound?: number;
    questionsInCurrentRound?: number[];
    questionStates?: Record<number, QuestionRoundState>;
    questionWrongHistory?: Record<number, QuestionWrongHistory>;
    questionIncorrectCount?: Record<number, number>;
    roundHistory?: Array<{
      round: number;
      questionsAttempted: number[];
      correctAnswers: number;
      incorrectAnswers: number;
    }>;
    showRoundTransition?: boolean;
    canNavigateBack?: boolean;
  };
}

interface UseQuizRoundsReturn {
  // Round state
  currentRound: number;
  questionsInCurrentRound: number[];
  questionStates: Record<number, QuestionRoundState>;
  roundHistory: Array<{
    round: number;
    questionsAttempted: number[];
    correctAnswers: number;
    incorrectAnswers: number;
  }>;
  showRoundTransition: boolean;
  canNavigateBack: boolean;

  // Round management
  getRoundConfig: (round: number) => QuizRound;
  moveToNextRound: (
    updatedQuestionStates?: Record<number, QuestionRoundState>
  ) => void;
  handleMoveToNextRound: () => void;
  isCurrentRoundCompleted: () => boolean;
  checkQuizCompletion: () => boolean;

  // Question state management
  updateQuestionState: (
    questionIndex: number,
    selectedAnswer: number,
    isCorrect: boolean,
    currentRound: number
  ) => void;

  // UI state
  setShowRoundTransition: (show: boolean) => void;
}

export const useQuizRounds = ({
  questions,
  onQuizComplete,
  onStateChange,
  initialState,
}: UseQuizRoundsProps): UseQuizRoundsReturn => {
  // State cho hệ thống vòng với khả năng khôi phục từ initialState
  const [currentRound, setCurrentRound] = useState<number>(
    initialState?.currentRound ?? 1
  );
  const [questionsInCurrentRound, setQuestionsInCurrentRound] = useState<
    number[]
  >(initialState?.questionsInCurrentRound ?? []);

  // State mới: theo dõi lịch sử lựa chọn sai của từng câu hỏi
  const [questionWrongHistory, setQuestionWrongHistory] = useState<
    Record<number, QuestionWrongHistory>
  >(initialState?.questionWrongHistory ?? {});

  // State theo dõi số lần trả lời sai của từng câu hỏi
  const [questionIncorrectCount, setQuestionIncorrectCount] = useState<
    Record<number, number>
  >(initialState?.questionIncorrectCount ?? {});

  const [questionStates, setQuestionStates] = useState<
    Record<number, QuestionRoundState>
  >(initialState?.questionStates ?? {});
  const [roundHistory, setRoundHistory] = useState<
    Array<{
      round: number;
      questionsAttempted: number[];
      correctAnswers: number;
      incorrectAnswers: number;
    }>
  >(initialState?.roundHistory ?? []);
  const [showRoundTransition, setShowRoundTransition] = useState<boolean>(
    initialState?.showRoundTransition ?? false
  );
  const [canNavigateBack, setCanNavigateBack] = useState<boolean>(
    initialState?.canNavigateBack ?? true
  );

  // Helper functions cho round system
  const getRoundConfig = useCallback((round: number): QuizRound => {
    if (round === 1) {
      return {
        round: 1,
        name: "Vòng 1",
        description: "Làm tất cả câu hỏi, không thể quay lại",
        allowBackNavigation: false,
        trackIncorrectAnswers: true,
      };
    } else if (round === 2) {
      return {
        round: 2,
        name: "Vòng 2",
        description: "Làm lại câu sai và câu chưa làm (reset trạng thái)",
        allowBackNavigation: false,
        trackIncorrectAnswers: false,
      };
    } else {
      return {
        round,
        name: `Vòng ${round}`,
        description: "Làm lại câu chưa làm (reset trạng thái)",
        allowBackNavigation: false,
        trackIncorrectAnswers: false,
      };
    }
  }, []);

  const moveToNextRound = useCallback(
    (updatedQuestionStates?: Record<number, QuestionRoundState>) => {
      const stateToUse = updatedQuestionStates || questionStates;
      if (updatedQuestionStates) {
        setQuestionStates(updatedQuestionStates);
      }

      // Ghi lại lịch sử vòng (không đổi)
      const correctCount = questionsInCurrentRound.filter(
        (index) => stateToUse[index]?.isCorrect === true
      ).length;
      setRoundHistory((prev) => [
        ...prev,
        {
          round: currentRound,
          questionsAttempted: questionsInCurrentRound,
          correctAnswers: correctCount,
          incorrectAnswers: questionsInCurrentRound.length - correctCount,
        },
      ]);

      // Bước 1: Cập nhật bộ đếm số lần sai
      const newIncorrectCounts = { ...questionIncorrectCount };
      questionsInCurrentRound.forEach((qIndex) => {
        const state = stateToUse[qIndex];
        if (
          state?.isCorrect === false &&
          state.roundAnswered === currentRound
        ) {
          newIncorrectCounts[qIndex] = (newIncorrectCounts[qIndex] || 0) + 1;
        }
      });
      setQuestionIncorrectCount(newIncorrectCounts);

      // Bước 2: Lọc câu hỏi cho vòng sau
      const questionsForNewRound = questions
        .map((_, index) => index)
        .filter((qIndex) => {
          const state = stateToUse[qIndex];
          const incorrectCount = newIncorrectCounts[qIndex] || 0;

          const isCompleted = state?.isCorrect === true || incorrectCount >= 2;

          return !isCompleted;
        });

      // Bước 3: Hoàn thành quiz hoặc chuyển vòng
      if (questionsForNewRound.length === 0) {
        const totalCorrect = Object.values(stateToUse).filter(
          (s) => s.isCorrect === true
        ).length;
        const finalScore = Math.round((totalCorrect / questions.length) * 100);
        onQuizComplete(finalScore);
        return;
      }

      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      setShowRoundTransition(true);

      setTimeout(() => {
        setQuestionsInCurrentRound(questionsForNewRound);
        setCanNavigateBack(false);

        // Reset trạng thái một cách AN TOÀN và CHÍNH XÁC
        setQuestionStates((prev) => {
          const newStates = { ...prev };
          questionsForNewRound.forEach((index) => {
            // KHÔNG dùng spread operator ở đây để tránh giữ lại state cũ
            newStates[index] = {
              questionIndex: index,
              isAnswered: false,
              isCorrect: null,
              selectedAnswer: null,
              roundAnswered: 0, // Reset hoàn toàn
            };
          });
          return newStates;
        });

        setShowRoundTransition(false);
      }, 2000);
    },
    [
      currentRound,
      questions,
      questionStates,
      questionIncorrectCount,
      questionsInCurrentRound,
      onQuizComplete,
    ]
  );

  // Kiểm tra hoàn thành toàn bộ quiz
  const checkQuizCompletion = useCallback(() => {
    if (questions.length === 0) return false;

    // Kiểm tra xem tất cả câu hỏi đã được trả lời ĐÚNG chưa
    const allQuestionsCorrect = questions.every(
      (_, index) => questionStates[index]?.isCorrect === true
    );

    console.log("Checking quiz completion:");
    console.log("All questions correct:", allQuestionsCorrect);
    console.log(
      "Question states:",
      Object.fromEntries(
        Object.entries(questionStates).map(([key, value]) => [
          key,
          { isAnswered: value.isAnswered, isCorrect: value.isCorrect },
        ])
      )
    );

    if (allQuestionsCorrect) {
      const totalCorrectAnswers = Object.values(questionStates).filter(
        (state) => state.isCorrect === true
      ).length;
      const finalScorePercent = Math.round(
        (totalCorrectAnswers / questions.length) * 100
      );
      console.log(
        "Quiz completed! All questions correct. Final score:",
        finalScorePercent
      );
      onQuizComplete(finalScorePercent);
      return true;
    }

    return false;
  }, [questions, questionStates, onQuizComplete]);

  // Kiểm tra xem vòng hiện tại đã hoàn thành chưa
  const isCurrentRoundCompleted = useCallback(() => {
    if (questionsInCurrentRound.length === 0) return false;

    return questionsInCurrentRound.every(
      (index) => questionStates[index]?.isAnswered === true
    );
  }, [questionsInCurrentRound, questionStates]);

  // Xử lý chuyển vòng - đơn giản hóa với logic mới
  const handleMoveToNextRound = useCallback(() => {
    // Kiểm tra xem có thể hoàn thành quiz không
    if (checkQuizCompletion()) {
      return;
    }

    // Chuyển sang vòng tiếp theo với logic mới trong moveToNextRound
    moveToNextRound();
  }, [checkQuizCompletion, moveToNextRound]);

  // Cập nhật trạng thái câu hỏi (không cập nhật lịch sử ở đây nữa)
  const updateQuestionState = useCallback(
    (
      questionIndex: number,
      selectedAnswer: number,
      isCorrect: boolean,
      currentRound: number
    ) => {
      // Chỉ cập nhật trạng thái câu hỏi
      setQuestionStates((prev) => ({
        ...prev,
        [questionIndex]: {
          questionIndex,
          isAnswered: true,
          isCorrect,
          selectedAnswer,
          roundAnswered: currentRound,
        },
      }));

      console.log(
        `Question ${questionIndex}: Updated state - answer: ${selectedAnswer}, correct: ${isCorrect}`
      );
    },
    []
  );

  // Gọi onStateChange khi state thay đổi để lưu vào localStorage
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        currentRound,
        questionsInCurrentRound,
        questionStates,
        questionWrongHistory,
        questionIncorrectCount,
        roundHistory,
        showRoundTransition,
        canNavigateBack,
      });
    }
  }, [
    currentRound,
    questionsInCurrentRound,
    questionStates,
    questionWrongHistory,
    questionIncorrectCount,
    roundHistory,
    showRoundTransition,
    canNavigateBack,
    onStateChange,
  ]);

  // Khởi tạo vòng 1 khi questions được load (chỉ khi chưa có initialState)
  useEffect(() => {
    if (
      questions.length > 0 &&
      currentRound === 1 &&
      questionsInCurrentRound.length === 0 &&
      !initialState?.questionsInCurrentRound?.length
    ) {
      console.log("Initializing round 1 with", questions.length, "questions");

      // Vòng 1: tất cả câu hỏi
      const allQuestions = Array.from(
        { length: questions.length },
        (_, i) => i
      );
      setQuestionsInCurrentRound(allQuestions);

      // Khởi tạo question states
      const initialStates: Record<number, QuestionRoundState> = {};
      allQuestions.forEach((index) => {
        initialStates[index] = {
          questionIndex: index,
          isAnswered: false,
          isCorrect: null,
          selectedAnswer: null,
          roundAnswered: 0,
        };
      });
      setQuestionStates(initialStates);

      // Khởi tạo lịch sử lựa chọn sai rỗng
      setQuestionWrongHistory({});

      // Khởi tạo bộ đếm số lần sai rỗng
      setQuestionIncorrectCount({});

      setCanNavigateBack(false); // Vòng 1 không cho phép quay lại
    }
  }, [
    questions.length,
    currentRound,
    questionsInCurrentRound.length,
    initialState,
  ]);

  return {
    // Round state
    currentRound,
    questionsInCurrentRound,
    questionStates,
    roundHistory,
    showRoundTransition,
    canNavigateBack,

    // Round management
    getRoundConfig,
    moveToNextRound,
    handleMoveToNextRound,
    isCurrentRoundCompleted,
    checkQuizCompletion,

    // Question state management
    updateQuestionState,

    // UI state
    setShowRoundTransition,
  };
};
