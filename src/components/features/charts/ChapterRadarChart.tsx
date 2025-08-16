"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import {
  Loader2,
  BarChart3,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { quizService } from "@/lib/services/api";
import {
  UserRadarData,
  RadarChartConfig,
  AllRadarData,
} from "@/lib/types/radar";
import { ImprovementAnalysisData } from "@/lib/types/improvement";
import { showErrorToast } from "@/lib/utils/toast-utils";
import RadarChart, { transformRadarData, colorSchemes } from "./RadarChart";

interface ChapterRadarChartProps {
  quizId: number;
  quizName?: string;
  className?: string;
}

export default function ChapterRadarChart({
  quizId,
  quizName,
  className = "",
}: ChapterRadarChartProps) {
  const [radarData, setRadarData] = useState<UserRadarData | null>(null);
  const [combinedRadarData, setCombinedRadarData] =
    useState<AllRadarData | null>(null);
  const [improvementData, setImprovementData] =
    useState<ImprovementAnalysisData | null>(null);
  const [studentPerformanceData, setStudentPerformanceData] =
    useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        setIsLoading(true);

        // Gọi 3 API đầu tiên để lấy user_id
        const [currentUserData, averageData, topPerformerData] =
          await Promise.allSettled([
            quizService.getCurrentUserRadarData(quizId),
            quizService.getAverageRadarData(quizId),
            quizService.getTopPerformerRadarData(quizId),
          ]);

        // Lưu dữ liệu người dùng hiện tại (để hiển thị thông tin chi tiết)
        let currentUserId = null;
        if (currentUserData.status === "fulfilled") {
          const userData = currentUserData.value;
          console.log("Chapter Current User Data:", userData); // Debug log

          // Xử lý wrapper nếu có
          const actualData =
            userData?.success && userData?.data ? userData.data : userData;

          if (actualData?.user_id) {
            setRadarData(actualData);
            currentUserId = actualData.user_id;
          }
        }

        // Gọi API student performance nếu có user_id
        if (currentUserId) {
          try {
            const performanceResult =
              await quizService.getStudentQuizPerformance({
                quiz_id: quizId,
                user_id: currentUserId,
              });
            if (performanceResult.success) {
              setStudentPerformanceData(performanceResult);
            }
          } catch (err) {
            console.error("Lỗi khi lấy student performance:", err);
          }
        }

        // Gọi improvement analysis (backup)
        const improvementAnalysis = await Promise.allSettled([
          quizService.getImprovementAnalysis({ quiz_id: quizId }),
        ]);

        // Lưu dữ liệu phân tích cải thiện (backup)
        if (improvementAnalysis[0].status === "fulfilled") {
          setImprovementData(improvementAnalysis[0].value.data);
        }

        // Tạo dữ liệu kết hợp cho radar chart chồng lại
        const processedData: AllRadarData = {
          quiz_id: quizId,
          quiz_name: quizName || "Bài kiểm tra",
          total_questions: 0,
          radar_data: {},
          summary: {
            total_participants: 0,
            total_answers: 0,
            average_score: 0,
            difficulty_levels: [],
            learning_outcomes: [],
          },
        };

        // Xử lý dữ liệu người dùng hiện tại
        if (currentUserData.status === "fulfilled") {
          const userData = currentUserData.value;
          const actualData =
            userData?.success && userData?.data ? userData.data : userData;

          if (actualData?.user_id && actualData?.radar_data) {
            processedData.radar_data.current_user = {
              user_id: actualData.user_id,
              data: actualData.radar_data,
            };
          }
        }

        // Xử lý dữ liệu trung bình
        if (averageData.status === "fulfilled") {
          const avgData = averageData.value;
          const actualData =
            avgData?.success && avgData?.data ? avgData.data : avgData;

          if (actualData?.radar_data) {
            processedData.radar_data.average = actualData.radar_data;
          }
        }

        // Xử lý dữ liệu top performer
        if (topPerformerData.status === "fulfilled") {
          const topData = topPerformerData.value;
          const actualData =
            topData?.success && topData?.data ? topData.data : topData;

          if (actualData?.top_performer && actualData?.radar_data) {
            processedData.radar_data.top_performer = {
              user_info: actualData.top_performer,
              data: actualData.radar_data,
            };
          }
        }

        setCombinedRadarData(processedData);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu radar chart:", err);
        setError("Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.");
        showErrorToast("Không thể tải dữ liệu phân tích");
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      fetchRadarData();
    }
  }, [quizId]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-lg font-medium text-muted-foreground">
              Đang tải dữ liệu phân tích...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !radarData) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {error || "Không có dữ liệu phân tích"}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Tạo dữ liệu cho chart chồng lại (tương tự TeacherRadarChart)
  const getComparisonChartData = (): RadarChartConfig => {
    if (!combinedRadarData) {
      // Fallback về chart đơn nếu không có dữ liệu kết hợp
      return transformRadarData(
        radarData.radar_data,
        "Kết quả của bạn",
        colorSchemes.primary
      );
    }

    const datasets = [];

    // 1. Thêm dữ liệu trung bình (vòng ngoài cùng - màu xanh dương)
    if (combinedRadarData.radar_data.average) {
      const avgData = transformRadarData(
        combinedRadarData.radar_data.average,
        "Trung bình lớp",
        colorSchemes.primary
      );
      const customizedDataset = {
        ...avgData.datasets[0],
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(59, 130, 246)",
      };
      datasets.push(customizedDataset);
    }

    // 2. Thêm dữ liệu top performer (vòng giữa - màu xanh lá)
    if (combinedRadarData.radar_data.top_performer) {
      const topData = transformRadarData(
        combinedRadarData.radar_data.top_performer.data,
        "Học viên xuất sắc",
        colorSchemes.success
      );
      const customizedDataset = {
        ...topData.datasets[0],
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        borderColor: "rgb(34, 197, 94)",
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(34, 197, 94)",
      };
      datasets.push(customizedDataset);
    }

    // 3. Thêm dữ liệu user hiện tại (vòng trong cùng - màu cam)
    if (combinedRadarData.radar_data.current_user) {
      const currentData = transformRadarData(
        combinedRadarData.radar_data.current_user.data,
        "Kết quả của bạn",
        colorSchemes.warning
      );
      const customizedDataset = {
        ...currentData.datasets[0],
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        borderColor: "rgb(249, 115, 22)",
        pointBackgroundColor: "rgb(249, 115, 22)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(249, 115, 22)",
      };
      datasets.push(customizedDataset);
    }

    // Lấy labels từ dataset đầu tiên có sẵn
    const labels = combinedRadarData.radar_data.average
      ? transformRadarData(
          combinedRadarData.radar_data.average,
          "",
          colorSchemes.primary
        ).labels
      : combinedRadarData.radar_data.current_user
      ? transformRadarData(
          combinedRadarData.radar_data.current_user.data,
          "",
          colorSchemes.warning
        ).labels
      : [];

    return { labels, datasets };
  };

  const chartData: RadarChartConfig = getComparisonChartData();

  // Tính toán dữ liệu để hiển thị
  const difficultyLevels = radarData.radar_data.difficulty_levels;
  const learningOutcomes = radarData.radar_data.learning_outcomes;

  // Helper function để map difficulty level
  const getDifficultyDisplay = (level: string) => {
    const levelLower = level.toLowerCase();
    if (
      levelLower.includes("easy") ||
      levelLower.includes("dễ") ||
      levelLower === "de"
    ) {
      return { icon: "🟢", name: "Dễ" };
    } else if (
      levelLower.includes("medium") ||
      levelLower.includes("trung") ||
      levelLower === "tb" ||
      levelLower === "medium"
    ) {
      return { icon: "🟡", name: "Trung bình" };
    } else if (
      levelLower.includes("hard") ||
      levelLower.includes("khó") ||
      levelLower === "kho"
    ) {
      return { icon: "🔴", name: "Khó" };
    } else {
      return { icon: "📝", name: level };
    }
  };

  // Format thời gian
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              So sánh kết quả
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Radar Chart */}
        <RadarChart
          data={chartData}
          title={quizName || "Bài kiểm tra"}
          height={450}
          radarData={radarData.radar_data}
          allRadarData={
            combinedRadarData
              ? {
                  average: combinedRadarData.radar_data.average,
                  top_performer:
                    combinedRadarData.radar_data.top_performer?.data,
                  current_user: combinedRadarData.radar_data.current_user?.data,
                }
              : undefined
          }
        />

        {/* Thông báo khi không có dữ liệu top performer */}
        {combinedRadarData && !combinedRadarData.radar_data.top_performer && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium">Thông tin:</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Chưa có dữ liệu học viên xuất sắc nhất. Dữ liệu sẽ được hiển thị
              khi có học viên hoàn thành bài kiểm tra.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
