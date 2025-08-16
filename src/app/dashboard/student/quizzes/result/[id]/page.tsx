"use client";

import { useState, useEffect, use } from "react";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { quizService } from "@/lib/services/api";
import { Card, CardContent } from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { Skeleton } from "@/components/ui/feedback";
import {
  ChevronLeft,
  Clock,
  Calendar,
  Target,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Progress } from "@/components/ui/feedback";
import { QuizResultStudent } from "@/lib/types/quiz";
import { useRouter } from "next/navigation";
import ChapterAnalysisChart from "@/components/features/charts/ChapterAnalysisChart";

interface QuizResultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuizResultDetailPage({ params }: QuizResultPageProps) {
  const { getUser } = useAuthStatus();
  const [resultDetail, setResultDetail] = useState<QuizResultStudent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sử dụng React.use() để unwrap params
  const resolvedParams = use(params);
  const resultId = Number(resolvedParams.id);

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        setIsLoading(true);

        if (isNaN(resultId)) {
          setError("ID kết quả không hợp lệ");
          setIsLoading(false);
          return;
        }

        const result = await quizService.getQuizResultById(resultId);
        console.log(result);
        // Kiểm tra quyền truy cập (chỉ được xem kết quả của chính mình)
        const user = getUser();
        if (!user || String(user.user_id) !== String(result.user_id)) {
          console.log(
            "Debug - user.user_id:",
            user?.user_id,
            "result.user_id:",
            result.user_id
          );
          setError("Bạn không có quyền xem kết quả này");
          setIsLoading(false);
          return;
        }

        setResultDetail(result);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết kết quả bài kiểm tra:", err);
        setError("Đã xảy ra lỗi khi tải chi tiết kết quả bài kiểm tra");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizResult();
  }, [resultId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  const formatCompletionTime = (time: number | null) => {
    if (!time) return "N/A";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes} phút ${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleBack = () => {
    router.push("/dashboard/student/quizzes/completed");
  };

  if (isLoading) {
    return (
      <div className="w-full mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8 flex items-center">
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="mb-6 sm:mb-8 md:mb-10">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        <div className="space-y-6 sm:space-y-8 md:space-y-10">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto">
        <div className="text-center py-10">
          <div className="text-2xl text-red-500 mb-4">{error}</div>
          <Button onClick={handleBack}>Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  if (!resultDetail) {
    return (
      <div className="w-full mx-auto">
        <div className="text-center py-10">
          <div className="text-2xl mb-4">
            Không tìm thấy kết quả bài kiểm tra
          </div>
          <Button onClick={handleBack}>Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  const scorePercentage = (resultDetail.score / 10) * 100;

  // Phân loại kết quả
  const getScoreStatus = () => {
    if (resultDetail.score >= 8)
      return { label: "Xuất sắc", color: "text-green-600" };
    if (resultDetail.score >= 6.5)
      return { label: "Khá", color: "text-blue-600" };
    if (resultDetail.score >= 5)
      return { label: "Trung bình", color: "text-yellow-600" };
    return { label: "Chưa đạt", color: "text-red-600" };
  };

  const scoreStatus = getScoreStatus();

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

      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {/* Chapter Analysis Chart */}
        <ChapterAnalysisChart
          quizId={resultDetail.quiz_id}
          quizName={resultDetail.Quiz.name}
          className="w-full"
        />
      </div>
    </div>
  );
}
