import { useState } from "react";
import { useRouter } from "next/navigation";
import quizService from "@/lib/services";
import { toast } from "sonner";

export const useJoinQuiz = () => {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const joinQuiz = async (quizId: number | null, pin: string) => {
    try {
      setIsJoining(true);
      setError(null);

      let finalQuizId = quizId;

      // Nếu không có quizId, sử dụng PIN để lấy quizId
      if (!finalQuizId) {
        const response = await quizService.getQuizIdByPin(pin);
        finalQuizId = response.quiz.quiz_id;

        if (!finalQuizId) {
          setError("Không tìm thấy bài kiểm tra với mã PIN này");
          return false;
        }
      }

      // Tham gia bài kiểm tra với quizId đã có
      const joinResponse = await quizService.joinQuiz(finalQuizId, { pin });

      // Kiểm tra thông tin trong joinResponse để xác định trạng thái bài kiểm tra
      if (joinResponse.quiz && joinResponse.quiz.status === "active") {
        // Nếu có thông tin về session trong response
        if (joinResponse.session && joinResponse.session.session_id) {
          // Nếu bài kiểm tra đang diễn ra ở câu hỏi nào đó
          if (joinResponse.progress && joinResponse.progress.current_question_id) {
            toast.success("Bài kiểm tra đang diễn ra, đang chuyển đến bài làm...");
            router.push(`/quiz-live/${finalQuizId}`);
            return true;
          }
        }
      }

      // Nếu chưa active hoặc không có thông tin session, chuyển đến waiting room
      router.push(`/quiz-waiting-room/${finalQuizId}`);
      return true;
    } catch (error: unknown) {
      console.error("Lỗi khi tham gia bài kiểm tra:", error);
      const errorResponse = error as {
        response?: { data?: { error?: string } };
      };
      setError(
        errorResponse.response?.data?.error ||
        "Không thể tham gia bài kiểm tra. Vui lòng thử lại sau."
      );
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return { joinQuiz, isJoining, error };
};

export default useJoinQuiz;
