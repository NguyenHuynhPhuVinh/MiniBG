"use client";

import { useState, useEffect } from "react";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { quizService } from "@/lib/services/api";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { Card, CardContent, CardFooter } from "@/components/ui/layout";
import { Input } from "@/components/ui/forms";
import { Skeleton } from "@/components/ui/feedback";
import { Calendar, Clock, Activity, Search, BarChart } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";

type QuizResult = {
  result_id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  status: string;
  completion_time: number | null;
  update_time: string;
  Quiz: {
    quiz_id: number;
    name: string;
  };
  Student: {
    user_id: number;
    name: string;
  };
};

export default function CompletedQuizzesPage() {
  const { getUser } = useAuthStatus();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        setIsLoading(true);
        const user = getUser();

        if (!user) {
          setError("Không thể xác định người dùng hiện tại");
          setIsLoading(false);
          return;
        }

        const response = await quizService.getCurrentUserQuizResults(
          Number(user.user_id)
        );
        console.log("Completed Quiz Results API Response:", response);

        // Xử lý wrapper nếu có, fallback cho cấu trúc cũ
        if (
          response?.success &&
          response?.data &&
          Array.isArray(response.data)
        ) {
          // Cấu trúc mới với wrapper
          const completedResults = response.data.filter(
            (result: QuizResult) => result.status === "completed"
          );
          setQuizResults(completedResults);
        } else if (Array.isArray(response)) {
          // Cấu trúc cũ - array trực tiếp
          const completedResults = response.filter(
            (result: QuizResult) => result.status === "completed"
          );
          setQuizResults(completedResults);
        } else {
          console.warn(
            "Unexpected completed quiz results response structure:",
            response
          );
          setQuizResults([]);
        }
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách kết quả bài kiểm tra:", err);
        setError("Đã xảy ra lỗi khi tải danh sách kết quả bài kiểm tra");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizResults();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  const formatCompletionTime = (time: number | null) => {
    if (time === null) return "Chưa hoàn thành";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const formatScore = (score: number) => {
    return `${score}/10`;
  };

  const filteredResults = quizResults.filter((result) => {
    const quizName = result.Quiz.name.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return quizName.includes(searchLower);
  });

  const QuizStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 text-white whitespace-nowrap text-xs py-1 px-2">
            Đã hoàn thành
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="whitespace-nowrap text-xs py-1 px-2"
          >
            {status}
          </Badge>
        );
    }
  };

  const QuizResultCard = ({ result }: { result: QuizResult }) => {
    return (
      <Card className="h-full border-2 border-border hover:border-primary transition-all overflow-hidden">
        <CardContent>
          <div className="flex flex-col h-full space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1 truncate">
                <h3
                  className="font-semibold text-base sm:text-lg truncate"
                  title={result.Quiz.name}
                >
                  {truncateText(result.Quiz.name, 25)}
                </h3>
              </div>
              <QuizStatusBadge status={result.status} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Điểm số:</span>
                </div>
                <span className="text-xs sm:text-sm font-medium">
                  {formatScore(result.score)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Thời gian:</span>
                </div>
                <span className="text-xs sm:text-sm">
                  {formatCompletionTime(result.completion_time)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Ngày làm:</span>
                </div>
                <span className="text-xs sm:text-sm">
                  {formatDate(result.update_time)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-3 sm:pt-4 px-4 flex justify-center">
          <Button
            className="w-full h-8 sm:h-10 text-xs sm:text-sm cursor-pointer"
            onClick={() =>
              router.push(
                `/dashboard/student/quizzes/result/${result.result_id}`
              )
            }
          >
            <BarChart className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            Xem chi tiết kết quả
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const QuizEmptyState = () => {
    return (
      <Card className="border bg-muted/5 sm:border-2">
        <div className="py-8 sm:py-10 md:py-12 text-center">
          <div className="mx-auto max-w-sm sm:max-w-md">
            <div className="mb-4 flex justify-center">
              <BarChart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              {searchTerm
                ? "Không tìm thấy kết quả bài kiểm tra"
                : "Chưa có kết quả bài kiểm tra nào"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Không có kết quả bài kiểm tra nào phù hợp với từ khóa tìm kiếm"
                : "Hãy hoàn thành bài kiểm tra để xem kết quả tại đây"}
            </p>
            <Button onClick={() => router.push("/dashboard/student/quizzes")}>
              Đi đến danh sách bài kiểm tra
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-4 sm:py-6">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">
            Kết Quả Bài Kiểm Tra
          </h1>
          <p className="text-base font-medium">
            Tổng cộng có{" "}
            <span className="text-primary font-semibold">
              {quizResults.length}
            </span>{" "}
            kết quả
          </p>
        </div>

        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 sm:left-4 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên bài kiểm tra..."
            className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-2 rounded-full focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-2">
              <CardContent className="pb-0 pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/5" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/6" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-2/5" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-4">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <div className="text-2xl text-red-500 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </div>
      ) : filteredResults.length === 0 ? (
        <QuizEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {filteredResults.map((result) => (
            <QuizResultCard key={result.result_id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
