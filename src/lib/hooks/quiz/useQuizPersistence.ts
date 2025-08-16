import { useCallback, useEffect } from "react";
import { QuestionRoundState, QuestionWrongHistory } from "@/lib/types/quiz";

interface QuizState {
  quizId: number;
  currentRound: number;
  questionsInCurrentRound: number[];
  questionStates: Record<number, QuestionRoundState>;
  questionWrongHistory: Record<number, QuestionWrongHistory>; // Thêm lịch sử lựa chọn sai
  questionIncorrectCount: Record<number, number>; // Thêm bộ đếm số lần sai
  roundHistory: Array<{
    round: number;
    questionsAttempted: number[];
    correctAnswers: number;
    incorrectAnswers: number;
  }>;
  currentQuestionIndex: number;
  currentScore: number;
  quizTimeLeft: number;
  quizCompleted: boolean;
  finalScore: number | null;
  showRoundTransition: boolean;
  canNavigateBack: boolean;
  timestamp: number; // Thời gian lưu state
}

interface UseQuizPersistenceProps {
  quizId: number;
  enabled?: boolean; // Cho phép bật/tắt persistence
}

interface UseQuizPersistenceReturn {
  saveQuizState: (state: Partial<QuizState>) => void;
  loadQuizState: () => QuizState | null;
  clearQuizState: () => void;
  clearAllQuizStates: () => void;
  hasPersistedState: () => boolean;
}

export const useQuizPersistence = ({
  quizId,
  enabled = true,
}: UseQuizPersistenceProps): UseQuizPersistenceReturn => {
  const STORAGE_KEY = `quiz_state_${quizId}`;
  const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 giờ

  // Xóa trạng thái quiz hiện tại khỏi localStorage
  const clearQuizState = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log(`Quiz state cleared from localStorage: ${STORAGE_KEY}`);
    } catch (error) {
      console.error("Error clearing quiz state:", error);
    }
  }, [STORAGE_KEY]);

  // Xóa tất cả quiz states khỏi localStorage
  const clearAllQuizStates = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const keysToRemove: string[] = [];

      // Tìm tất cả keys có pattern quiz_state_*
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("quiz_state_")) {
          keysToRemove.push(key);
        }
      }

      // Xóa tất cả quiz states
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`Removed quiz state: ${key}`);
      });

      console.log(
        `Cleared ${keysToRemove.length} quiz states from localStorage`
      );
    } catch (error) {
      console.error("Error clearing all quiz states:", error);
    }
  }, []);

  // Tải trạng thái quiz từ localStorage
  const loadQuizState = useCallback((): QuizState | null => {
    if (!enabled || typeof window === "undefined") return null;

    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (!savedState) return null;

      const state: QuizState = JSON.parse(savedState);

      // Kiểm tra xem state có hết hạn không
      if (Date.now() - state.timestamp > STORAGE_EXPIRY) {
        console.log("Quiz state expired, clearing...");
        clearQuizState();
        return null;
      }

      // Kiểm tra xem có phải cùng quiz không
      if (state.quizId !== quizId) {
        console.log("Different quiz ID, clearing old state...");
        clearQuizState();
        return null;
      }

      // Xử lý deserialize questionWrongHistory (chuyển Array thành Set)
      const deserializedState = {
        ...state,
        questionWrongHistory: Object.fromEntries(
          Object.entries(state.questionWrongHistory || {}).map(
            ([key, value]) => [
              key,
              {
                ...value,
                wrongAnswers: new Set(value.wrongAnswers || []), // Chuyển Array thành Set
              },
            ]
          )
        ),
      };

      console.log("Quiz state loaded from localStorage:", deserializedState);
      return deserializedState;
    } catch (error) {
      console.error("Error loading quiz state:", error);
      clearQuizState();
      return null;
    }
  }, [quizId, enabled, STORAGE_KEY, STORAGE_EXPIRY, clearQuizState]);

  // Lưu trạng thái quiz vào localStorage
  const saveQuizState = useCallback(
    (state: Partial<QuizState>) => {
      if (!enabled || typeof window === "undefined") return;

      try {
        const currentState = loadQuizState();
        const newState: QuizState = {
          quizId,
          currentRound: 1,
          questionsInCurrentRound: [],
          questionStates: {},
          questionWrongHistory: {}, // Thêm default value
          questionIncorrectCount: {}, // Thêm default value cho bộ đếm
          roundHistory: [],
          currentQuestionIndex: 0,
          currentScore: 0,
          quizTimeLeft: 3600,
          quizCompleted: false,
          finalScore: null,
          showRoundTransition: false,
          canNavigateBack: true,
          timestamp: Date.now(),
          ...currentState,
          ...state,
        };

        // Xử lý serialize questionWrongHistory (chuyển Set thành Array)
        const serializedState = {
          ...newState,
          questionWrongHistory: Object.fromEntries(
            Object.entries(newState.questionWrongHistory).map(
              ([key, value]) => [
                key,
                {
                  ...value,
                  wrongAnswers: Array.from(value.wrongAnswers), // Chuyển Set thành Array
                },
              ]
            )
          ),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedState));
        console.log("Quiz state saved to localStorage:", serializedState);
      } catch (error) {
        console.error("Error saving quiz state:", error);
      }
    },
    [quizId, enabled, STORAGE_KEY, loadQuizState]
  );

  // Kiểm tra xem có trạng thái đã lưu không
  const hasPersistedState = useCallback((): boolean => {
    return loadQuizState() !== null;
  }, [loadQuizState]);

  // Tự động xóa state khi quiz hoàn thành
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Không xóa state khi user rời trang, để có thể khôi phục lại
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return {
    saveQuizState,
    loadQuizState,
    clearQuizState,
    clearAllQuizStates,
    hasPersistedState,
  };
};
