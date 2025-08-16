/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { QuizDetail } from "@/lib/types/quiz";
import { QuizInfo } from "./quiz-info";
import { QuestionList } from "./question-list";
import { quizService } from "@/lib/services/api";
import { Button } from "@/components/ui/forms";
import { ChevronLeft, Loader2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback";

interface QuizDetailViewProps {
  quiz: QuizDetail;
  onUpdate: () => void;
  onDelete: () => void;
}

export function QuizDetailView({
  quiz,
  onUpdate,
  onDelete,
}: QuizDetailViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isReshuffleLoading, setIsReshuffleLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Xử lý trộn lại câu hỏi
  const handleReshuffle = async () => {
    try {
      setIsReshuffleLoading(true);
      await quizService.reshuffleQuestions(quiz.quiz_id);
      showSuccessToast("Trộn lại câu hỏi thành công, đang tải dữ liệu mới...");

      // Cập nhật lại trang hiện tại để hiển thị câu hỏi đã trộn
      onUpdate();
    } catch (error) {
      showErrorToast("Lỗi khi trộn lại câu hỏi");
      setIsReshuffleLoading(false);
    }
  };

  // Xử lý xóa bài kiểm tra
  const handleDeleteQuiz = async () => {
    try {
      setIsLoading(true);
      await quizService.deleteQuiz(quiz.quiz_id);
      showSuccessToast("Xóa bài kiểm tra thành công");
      setIsDeleteDialogOpen(false);
      onDelete();
    } catch (error) {
      showErrorToast("Lỗi khi xóa bài kiểm tra");
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Quay lại trang danh sách
  const handleBack = () => {
    router.push("/dashboard/teaching/quizzes/list");
  };

  return (
    <div className="w-full mx-auto">
      <div className="mb-4 sm:mb-6 md:mb-8 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
        <h2 className="text-xl sm:text-2xl font-bold">Chi tiết bài kiểm tra</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isLoading}
                className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer self-end sm:self-auto"
              >
                <Trash className="h-4 w-4 mr-1.5" />
                Xóa bài kiểm tra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Xác nhận xóa bài kiểm tra
                </DialogTitle>
                <DialogDescription className="pt-2">
                  Bạn có chắc chắn muốn xóa bài kiểm tra &quot;{quiz.name}
                  &quot;? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteQuiz}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : null}
                  Xóa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        <QuizInfo quiz={quiz} />
        <QuestionList
          questions={quiz.questions}
          onReshuffle={handleReshuffle}
          isReshuffleLoading={isReshuffleLoading}
        />
      </div>
    </div>
  );
}
