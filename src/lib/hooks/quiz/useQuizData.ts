import { useState, useEffect } from "react";
import { Question } from "@/lib/types/quiz";
import quizService from "@/lib/services";

// Cập nhật interface Question để bao gồm trường id
type QuestionWithId = Question & { id: number };

interface UseQuizDataProps {
  quizId: number;
  onScoreChange?: (score: number) => void;
  initialScore?: number;
}

interface UseQuizDataReturn {
  questions: QuestionWithId[];
  loading: boolean;
  error: string | null;
  currentScore: number;
  setCurrentScore: (score: number) => void;
}

export const useQuizData = ({
  quizId,
  onScoreChange,
  initialScore,
}: UseQuizDataProps): UseQuizDataReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionWithId[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(initialScore ?? 0);

  // Lấy toàn bộ câu hỏi của quiz
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizQuestions(quizId);
        console.log("Quiz Questions API Response:", response);

        if (
          response?.success &&
          response?.data &&
          Array.isArray(response.data.questions)
        ) {
          const questionsWithId = response.data.questions.map(
            (q: Question, index: number) => ({
              ...q,
              id: index,
            })
          );
          setQuestions(questionsWithId);
          setError(null);
        } else {
          console.error("Invalid questions data:", response);
          setError("Dữ liệu câu hỏi không hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi khi lấy câu hỏi:", err);
        setError("Không thể lấy danh sách câu hỏi. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId]);

  // Gọi onScoreChange khi currentScore thay đổi
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(currentScore);
    }
  }, [currentScore, onScoreChange]);

  return {
    questions,
    loading,
    error,
    currentScore,
    setCurrentScore,
  };
};
