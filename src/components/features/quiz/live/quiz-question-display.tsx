import React, { useState, useEffect } from "react";
import { Question } from "@/lib/types/quiz";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { quizService } from "@/lib/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface QuizQuestionDisplayProps {
  question: Question;
  quizId: number;
  questionIndex?: number;
  totalQuestions?: number;
  answered: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean;
  onAnswer: (selectedAnswer: number, isCorrect: boolean) => void;
  // Thêm props cho round system
  currentRound?: number;
  roundAnswered?: number;
}

export const QuizQuestionDisplay: React.FC<QuizQuestionDisplayProps> = ({
  question,
  quizId,
  answered,
  selectedAnswer,
  isCorrect,
  onAnswer,
  currentRound = 1,
  roundAnswered = 0,
}) => {
  const { user } = useAuthStatus();
  const [startTime] = useState<number>(Date.now());
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    // Nếu câu hỏi đã được trả lời, hiển thị kết quả
    if (answered) {
      setShowFooter(true);
    }
  }, [question, answered]);

  // Xử lý khi hết thời gian
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTimeOut = async () => {
    if (answered) return;
    onAnswer(question.answers[0]?.answer_id ?? 0, false); // Mặc định là sai khi hết thời gian

    // Gửi câu trả lời mặc định tới server khi hết thời gian
    try {
      const defaultAnswer = question.answers[0]?.answer_id; // Chọn đáp án đầu tiên làm mặc định
      if (defaultAnswer) {
        // Gửi câu trả lời với userId
        await quizService.submitRealtimeAnswer(
          quizId,
          question.question_id,
          defaultAnswer,
          startTime,
          user?.user_id, // Cung cấp userId cho server
          true // showLeaderboardImmediately
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi câu trả lời timeout:", error);
    }

    setShowFooter(true);
  };

  const handleSelectAnswer = async (answerId: number) => {
    if (answered) return;

    onAnswer(
      answerId,
      question.answers.find((a) => a.answer_id === answerId)?.iscorrect ?? false
    );

    try {
      const answer = question.answers.find((a) => a.answer_id === answerId);
      if (!answer) return;

      // Hiện footer sau khi trả lời
      setShowFooter(true);

      // Gửi câu trả lời với tham số userId để server biết người dùng nào
      await quizService.submitRealtimeAnswer(
        quizId,
        question.question_id,
        answerId,
        startTime,
        user?.user_id, // Thêm userId của người dùng
        true // showLeaderboardImmediately
      );
    } catch (error) {
      console.error("Lỗi khi gửi câu trả lời:", error);
      toast.error("Không thể gửi câu trả lời");
    }
  };

  return (
    <div className="h-screen flex flex-col relative">
      {/* Nội dung câu hỏi */}
      <AnimatePresence>
        (
        <motion.div
          className="flex flex-col h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-5xl mx-auto">
            {/* Câu hỏi */}
            <motion.div
              className="px-8 pt-16 pb-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Hiển thị thông tin vòng nếu câu hỏi đã được trả lời ở vòng khác và chưa reset */}
              {roundAnswered > 0 &&
                roundAnswered !== currentRound &&
                answered && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-600">
                      <span className="font-medium">
                        Đã trả lời ở Vòng {roundAnswered}
                      </span>
                      {isCorrect ? (
                        <span className="ml-2 text-green-600">✓ Đúng</span>
                      ) : (
                        <span className="ml-2 text-red-600">✗ Sai</span>
                      )}
                    </div>
                  </div>
                )}

              <h2
                className={cn(
                  "font-normal mb-6 normal-case whitespace-pre-line",
                  question.question_text.length > 100
                    ? "text-xl md:text-2xl"
                    : "text-2xl md:text-3xl"
                )}
              >
                {question.question_text}
              </h2>
            </motion.div>

            {/* Danh sách đáp án */}
            <div className="px-8 py-8">
              <div className="space-y-6">
                {question.answers.map((answer, index) => (
                  <motion.div
                    key={answer.answer_id}
                    onClick={() => handleSelectAnswer(answer.answer_id)}
                    className={cn(
                      "p-6 rounded-xl border-2 cursor-pointer transition-all flex items-center transform -translate-y-0 hover:-translate-y-1 group",
                      selectedAnswer === answer.answer_id &&
                        answered &&
                        isCorrect
                        ? "border-green-500 bg-green-50 shadow-[0_5px_0_0_rgb(34,197,94)]"
                        : selectedAnswer === answer.answer_id &&
                          answered &&
                          !isCorrect
                        ? "border-red-500 bg-red-50 shadow-[0_5px_0_0_rgb(239,68,68)]"
                        : selectedAnswer === answer.answer_id
                        ? "border-primary bg-primary/5 shadow-[0_5px_0_0_oklch(0.51_0.19_258)] hover:shadow-[0_5px_0_0_oklch(0.6_0.21_258)]"
                        : "border-gray-200 shadow-[0_5px_0_0_rgb(203,213,225)] hover:border-primary hover:shadow-[0_5px_0_0_oklch(0.51_0.19_258)]",
                      answered && selectedAnswer !== answer.answer_id
                        ? "opacity-70"
                        : "opacity-100"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {/* Icon tròn hiển thị chữ cái A, B, C, D */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full mr-4 flex-shrink-0 transition-all",
                        selectedAnswer === answer.answer_id &&
                          answered &&
                          isCorrect
                          ? "bg-green-500 text-white"
                          : selectedAnswer === answer.answer_id &&
                            answered &&
                            !isCorrect
                          ? "bg-red-500 text-white"
                          : selectedAnswer === answer.answer_id
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-700"
                      )}
                    >
                      {selectedAnswer === answer.answer_id &&
                      answered &&
                      isCorrect ? (
                        <Check className="h-5 w-5" />
                      ) : selectedAnswer === answer.answer_id &&
                        answered &&
                        !isCorrect ? (
                        <X className="h-5 w-5" />
                      ) : (
                        <span className="font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-lg md:text-xl font-normal normal-case whitespace-pre-line">
                        {answer.answer_text}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer có animation */}
          <AnimatePresence>
            {showFooter && (
              <motion.div
                className="w-full mt-auto z-20 fixed bottom-0 left-0 right-0 shadow-lg"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              >
                <div
                  className={cn(
                    "px-8 py-8 border-t-4 w-full",
                    isCorrect
                      ? "bg-green-50 border-green-500"
                      : "bg-red-50 border-red-500"
                  )}
                >
                  <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center justify-center">
                      <div
                        className={cn(
                          "font-bold text-3xl px-8 py-5 rounded-xl transition-all",
                          isCorrect
                            ? "text-green-700 bg-green-100 border-2 border-green-300"
                            : "text-red-700 bg-red-100 border-2 border-red-300"
                        )}
                      >
                        {isCorrect
                          ? "ĐÁP ÁN CHÍNH XÁC!"
                          : "ĐÁP ÁN KHÔNG CHÍNH XÁC!"}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        )
      </AnimatePresence>
    </div>
  );
};

export default QuizQuestionDisplay;
