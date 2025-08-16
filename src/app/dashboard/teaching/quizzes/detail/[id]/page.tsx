"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import quizService from "@/lib/services";
import { QuizDetail } from "@/lib/types/quiz";
import { QuizDetailView } from "@/components/features/quiz/detail/quiz-detail";
import { EmptyState } from "@/components/ui/feedback";
import { Loader2 } from "lucide-react";
import { showErrorToast } from "@/lib/utils/toast-utils";

interface QuizDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuizDetailPage({ params }: QuizDetailPageProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sử dụng React.use() để unwrap params
  const resolvedParams = use(params);
  const quizId = parseInt(resolvedParams.id);

  // Hook lấy dữ liệu bài kiểm tra
  useEffect(() => {
    const fetchQuizDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await quizService.getQuizById(quizId);
        console.log("Quiz Detail API Response:", response); // Debug log

        if (response?.success && response?.data) {
          setQuiz(response.data.quiz);
        } else {
          console.warn("Unexpected quiz detail response structure:", response);
          throw new Error("Invalid response structure");
        }
      } catch {
        const errorMessage =
          "Không thể lấy chi tiết bài kiểm tra. Vui lòng thử lại sau.";
        showErrorToast(errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(quizId)) {
      fetchQuizDetail();
    } else {
      const errorMessage = "ID bài kiểm tra không hợp lệ";
      showErrorToast(errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [quizId]);

  // Xử lý cập nhật dữ liệu
  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await quizService.getQuizById(quizId);

      if (response?.success && response?.data) {
        setQuiz(response.data.quiz);
      } else {
        console.warn("Unexpected quiz detail response structure:", response);
        throw new Error("Invalid response structure");
      }
    } catch {
      showErrorToast("Lỗi khi cập nhật bài kiểm tra");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý xóa bài kiểm tra và chuyển hướng
  const handleDelete = () => {
    router.push("/dashboard/teaching/quizzes/list");
  };

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className="container px-6 max-w-7xl mx-auto py-10">
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-lg font-medium text-muted-foreground">
              Đang tải dữ liệu bài kiểm tra...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error || !quiz) {
    return (
      <div className="container px-6 max-w-7xl mx-auto py-10">
        <EmptyState
          title="Không tìm thấy bài kiểm tra"
          description={
            error ||
            "Không thể tìm thấy thông tin chi tiết của bài kiểm tra này."
          }
          icon="Search"
          action={
            <button
              className="text-primary hover:underline font-medium"
              onClick={() => router.push("/dashboard/teaching/quizzes/list")}
            >
              Quay lại danh sách bài kiểm tra
            </button>
          }
          className="py-16"
        />
      </div>
    );
  }

  // Hiển thị chi tiết bài kiểm tra
  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <QuizDetailView
        quiz={quiz}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
