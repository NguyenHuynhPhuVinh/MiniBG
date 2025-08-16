"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Loader2, BarChart3, Users, Trophy, TrendingUp } from "lucide-react";
import { quizService } from "@/lib/services/api";
import { AllRadarData, RadarChartConfig } from "@/lib/types/radar";
import { showErrorToast } from "@/lib/utils/toast-utils";
import RadarChart, { transformRadarData, colorSchemes } from "./RadarChart";

interface TeacherRadarChartProps {
  quizId: number;
  quizName?: string;
  className?: string;
}

export default function TeacherRadarChart({
  quizId,
  quizName,
  className = "",
}: TeacherRadarChartProps) {
  const [radarData, setRadarData] = useState<AllRadarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bỏ activeView vì chỉ hiển thị comparison view

  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        setIsLoading(true);

        // Gọi 3 API song song thay vì 1 API tổng hợp
        const [currentUserData, averageData, topPerformerData] =
          await Promise.allSettled([
            quizService.getCurrentUserRadarData(quizId),
            quizService.getAverageRadarData(quizId),
            quizService.getTopPerformerRadarData(quizId),
          ]);

        // Xử lý kết quả từ các API
        const processedData: AllRadarData = {
          quiz_id: quizId,
          quiz_name: quizName || "Bài kiểm tra", // Sử dụng quizName từ props
          total_questions: 0, // Sẽ được tính từ dữ liệu radar nếu có
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
          console.log("Current User Data:", userData); // Debug log

          // Xử lý wrapper nếu có
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
          console.log("Average Data:", avgData); // Debug log

          // Xử lý wrapper nếu có
          const actualData =
            avgData?.success && avgData?.data ? avgData.data : avgData;

          if (actualData?.radar_data) {
            processedData.radar_data.average = actualData.radar_data;
          }
        }

        // Xử lý dữ liệu top performer
        if (topPerformerData.status === "fulfilled") {
          const topData = topPerformerData.value;
          console.log("Top Performer Data:", topData); // Debug log

          // Xử lý wrapper nếu có
          const actualData =
            topData?.success && topData?.data ? topData.data : topData;

          if (actualData?.top_performer && actualData?.radar_data) {
            processedData.radar_data.top_performer = {
              user_info: actualData.top_performer,
              data: actualData.radar_data,
            };
          }
        }

        // Tính toán thông tin summary từ dữ liệu có sẵn
        if (processedData.radar_data.average?.learning_outcomes) {
          const learningOutcomes = Object.entries(
            processedData.radar_data.average.learning_outcomes
          ).map(([name, data]) => ({
            name: data.description ? `${name} - ${data.description}` : name,
            description: data.description || "",
          }));
          processedData.summary.learning_outcomes = learningOutcomes;
          processedData.total_questions = Object.values(
            processedData.radar_data.average.learning_outcomes
          ).reduce((total, lo) => total + (lo.questions_count || 0), 0);
        }

        // Thêm xử lý difficulty_levels - lấy từ bất kỳ nguồn nào có sẵn
        let difficultyLevels: string[] = [];
        if (processedData.radar_data.average?.difficulty_levels) {
          difficultyLevels = Object.keys(
            processedData.radar_data.average.difficulty_levels
          );
        } else if (
          processedData.radar_data.current_user?.data?.difficulty_levels
        ) {
          difficultyLevels = Object.keys(
            processedData.radar_data.current_user.data.difficulty_levels
          );
        } else if (
          processedData.radar_data.top_performer?.data?.difficulty_levels
        ) {
          difficultyLevels = Object.keys(
            processedData.radar_data.top_performer.data.difficulty_levels
          );
        }
        processedData.summary.difficulty_levels = difficultyLevels;

        // Ước tính số lượng participants từ việc có dữ liệu current_user và top_performer
        let participantCount = 0;
        if (processedData.radar_data.current_user) participantCount++;
        if (processedData.radar_data.top_performer) participantCount++;
        processedData.summary.total_participants = Math.max(
          participantCount,
          1
        );

        setRadarData(processedData);
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

  // Tạo dữ liệu cho chart so sánh với 3 vòng chồng lên nhau
  const getComparisonChartData = (): RadarChartConfig => {
    const datasets = [];

    // 1. Thêm dữ liệu trung bình (vòng ngoài cùng - màu xanh dương)
    if (radarData.radar_data.average) {
      const avgData = transformRadarData(
        radarData.radar_data.average,
        "Trung bình lớp",
        colorSchemes.primary
      );
      // Tùy chỉnh thêm các thuộc tính cho dataset
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
    if (radarData.radar_data.top_performer) {
      const topData = transformRadarData(
        radarData.radar_data.top_performer.data,
        "Học viên xuất sắc",
        colorSchemes.success
      );
      // Tùy chỉnh thêm các thuộc tính cho dataset
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
    if (radarData.radar_data.current_user) {
      const currentData = transformRadarData(
        radarData.radar_data.current_user.data,
        "Kết quả của tôi",
        colorSchemes.warning
      );
      // Tùy chỉnh thêm các thuộc tính cho dataset
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
    const labels = radarData.radar_data.average
      ? transformRadarData(
          radarData.radar_data.average,
          "",
          colorSchemes.primary
        ).labels
      : radarData.radar_data.top_performer
      ? transformRadarData(
          radarData.radar_data.top_performer.data,
          "",
          colorSchemes.success
        ).labels
      : [];

    return { labels, datasets };
  };

  const renderChart = () => {
    // Luôn hiển thị comparison chart với 3 vòng chồng lên nhau
    const chartData = getComparisonChartData();

    if (!chartData || chartData.datasets.length === 0) {
      return (
        <div className="flex flex-col items-center py-20">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Chưa có dữ liệu để hiển thị
          </p>
        </div>
      );
    }

    return (
      <RadarChart
        data={chartData}
        title={quizName || radarData.quiz_name}
        height={500}
        radarData={
          radarData.radar_data.average ||
          radarData.radar_data.current_user?.data ||
          radarData.radar_data.top_performer?.data
        }
        allRadarData={{
          average: radarData.radar_data.average,
          top_performer: radarData.radar_data.top_performer?.data,
          current_user: radarData.radar_data.current_user?.data,
        }}
      />
    );
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

          {/* Bỏ phần chú thích nhỏ theo yêu cầu */}
        </div>
      </CardHeader>

      <CardContent>
        {renderChart()}

        {/* Thông báo khi không có dữ liệu top performer */}
        {!radarData.radar_data.top_performer && (
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
