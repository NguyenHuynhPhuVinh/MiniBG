"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Clock,
} from "lucide-react";
import { advancedAnalyticsService } from "@/lib/services";
import { StudentScoreAnalysisResponse } from "@/lib/types/advanced-analytics";

// Type cho data sau khi đã xử lý wrapper
type StudentScoreAnalysisData = StudentScoreAnalysisResponse["data"];
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface StudentScoreAnalysisChartProps {
  quizId?: number;
  className?: string;
}

export default function StudentScoreAnalysisChart({
  quizId,
  className = "",
}: StudentScoreAnalysisChartProps) {
  const { getUser } = useAuthStatus();
  const [data, setData] = useState<StudentScoreAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = getUser();
      if (!user) {
        setError("Vui lòng đăng nhập để xem phân tích");
        return;
      }

      const params = {
        user_id: user.user_id,
        time_period: "3m" as const,
        include_comparison: true,
      };

      if (quizId) {
        // Nếu có quizId, có thể thêm filter (tùy thuộc vào backend có hỗ trợ không)
        // params.quiz_id = quizId;
      }

      const response = await advancedAnalyticsService.getStudentScoreAnalysis(
        params
      );
      console.log("Student Score Analysis API Response:", response);

      if (response?.success && response?.data) {
        setData(response.data);
      } else {
        console.warn(
          "Unexpected student score analysis response structure:",
          response
        );
        setError("Dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu phân tích điểm số:", error);
      setError("Không thể tải dữ liệu phân tích");
      showErrorToast("Không thể tải dữ liệu phân tích");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const getPerformanceColor = (grade: string) => {
    switch (grade.toLowerCase()) {
      case "excellent":
      case "xuất sắc":
        return "text-green-600 bg-green-50";
      case "good":
      case "tốt":
        return "text-blue-600 bg-blue-50";
      case "average":
      case "trung bình":
        return "text-yellow-600 bg-yellow-50";
      case "poor":
      case "yếu":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Target className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Phân tích Điểm số Cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">
                Đang phân tích...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Phân tích Điểm số Cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">
              {error || "Không có dữ liệu"}
            </p>
            <Button onClick={fetchData} variant="outline">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const accuracyPercentage = data.overall_performance?.accuracy_rate
    ? parseFloat(data.overall_performance.accuracy_rate)
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Phân tích Điểm số Cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Tổng lượt thi
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {data.overall_performance?.total_attempts || 0}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Độ chính xác
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {accuracyPercentage.toFixed(1)}%
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Thời gian TB
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {data.overall_performance?.avg_response_time
                ? parseFloat(
                    data.overall_performance.avg_response_time
                  ).toFixed(1)
                : "0.0"}
              s
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                Xếp hạng
              </span>
            </div>
            <Badge
              className={`${getPerformanceColor(
                data.overall_performance?.performance_grade || "N/A"
              )} border-0`}
            >
              {data.overall_performance?.performance_grade || "N/A"}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Tiến độ học tập</span>
            <span className="text-sm text-muted-foreground">
              {accuracyPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={accuracyPercentage} className="h-3" />
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2 text-green-700">
              <TrendingUp className="h-4 w-4" />
              Điểm mạnh ({data.strengths_weaknesses?.strengths?.length || 0})
            </h4>
            <div className="space-y-2">
              {(data.strengths_weaknesses?.strengths || [])
                .slice(0, 3)
                .map((strength, index) => (
                  <div
                    key={index}
                    className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-green-900">
                        {strength.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        {parseFloat(strength.accuracy).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700">{strength.reason}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2 text-red-700">
              <TrendingDown className="h-4 w-4" />
              Điểm yếu ({data.strengths_weaknesses?.weaknesses?.length || 0})
            </h4>
            <div className="space-y-2">
              {(data.strengths_weaknesses?.weaknesses || [])
                .slice(0, 3)
                .map((weakness, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-red-900">
                        {weakness.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-red-600 border-red-600"
                      >
                        {parseFloat(weakness.accuracy).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-red-700">{weakness.reason}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Gợi ý cải thiện ({data.personalized_recommendations?.length || 0})
          </h4>
          <div className="space-y-3">
            {(data.personalized_recommendations || [])
              .slice(0, 3)
              .map((rec, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(rec.priority)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{rec.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Thời gian ước tính: {rec.estimated_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Peer Comparison */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-3 text-blue-900">So sánh với lớp</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-blue-700">Điểm của bạn</p>
              <p className="text-lg font-bold text-blue-900">
                {data.comparison_with_peers?.user_accuracy
                  ? parseFloat(
                      data.comparison_with_peers.user_accuracy
                    ).toFixed(1)
                  : "0.0"}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700">Trung bình lớp</p>
              <p className="text-lg font-bold text-blue-900">
                {data.comparison_with_peers?.peer_average
                  ? parseFloat(data.comparison_with_peers.peer_average).toFixed(
                      1
                    )
                  : "0.0"}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700">Xếp hạng</p>
              <p className="text-lg font-bold text-blue-900">
                Top {data.comparison_with_peers?.estimated_percentile || "N/A"}%
              </p>
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-3 text-center">
            {data.comparison_with_peers?.message || "Không có dữ liệu so sánh"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
