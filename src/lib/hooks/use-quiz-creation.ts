"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateQuizFormData } from "@/lib/types/quiz";
import { quizService } from "@/lib/services/api";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";

/**
 * Hook xử lý tạo bài kiểm tra
 */
export const useQuizCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Tạo bài kiểm tra mới
   * @param formData Dữ liệu form tạo bài kiểm tra
   * @returns true nếu tạo thành công, false nếu thất bại
   */
  const createQuiz = async (formData: CreateQuizFormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Kiểm tra tỷ lệ khó dễ
      const { easy, medium, hard } = formData.question_criteria.difficultyRatio;
      if (easy + medium + hard !== 100) {
        setError("Tổng tỷ lệ độ khó phải bằng 100%");
        return false;
      }

      // Gọi API tạo bài kiểm tra
      await quizService.createQuiz(formData);

      // Hiển thị thông báo thành công
      showSuccessToast("Tạo bài kiểm tra thành công");

      // Làm mới dữ liệu
      router.refresh();

      return true;
    } catch (err: Error | unknown) {
      // Xử lý lỗi
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tạo bài kiểm tra";
      setError(errorMessage);
      showErrorToast(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createQuiz,
    isLoading,
    error,
  };
};
