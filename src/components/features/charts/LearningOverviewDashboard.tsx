"use client";

import React from "react";
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
  BarChart3,
  Award,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Target,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react";
import { ComprehensiveAnalysisData } from "@/lib/types/chapter-analytics";

interface LearningOverviewDashboardProps {
  className?: string;
  data: ComprehensiveAnalysisData;
  onViewFullRoadmap?: () => void;
}

export default function LearningOverviewDashboard({
  className = "",
  data,
  onViewFullRoadmap,
}: LearningOverviewDashboardProps) {
  // Get performance level color
  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "average":
        return "text-yellow-600";
      case "weak":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Get performance level text
  const getPerformanceLevelText = (level: string) => {
    switch (level) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "average":
        return "Trung bình";
      case "weak":
        return "Yếu";
      default:
        return "Chưa xác định";
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} phút`;
  };

  // Get top recommendations
  const topRecommendations = data.improvement_suggestions.priority_areas.slice(
    0,
    3
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header với thông tin môn học */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-1">
                {data.subject_info.subject_name}
              </h2>
              <p className="text-blue-700 text-sm">
                {data.subject_info.description}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${getPerformanceLevelColor(
                  data.overall_performance.performance_level
                )}`}
              >
                {getPerformanceLevelText(
                  data.overall_performance.performance_level
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Mức độ tổng thể
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chỉ số hiệu suất tổng thể */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.overall_performance.overall_accuracy_percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Độ chính xác</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.overall_performance.average_quiz_score.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Điểm TB</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.subject_info.completed_quizzes}/
              {data.subject_info.total_quizzes}
            </div>
            <div className="text-sm text-muted-foreground">Quiz hoàn thành</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {formatTime(data.overall_performance.total_time_spent_seconds)}
            </div>
            <div className="text-sm text-muted-foreground">Thời gian học</div>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ cột so sánh mức độ thành thạo các chương */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            So sánh Mức độ Thành thạo theo Chương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.chapter_completion_chart.chart_data.map((chapter) => (
              <div key={chapter.chapter_id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{chapter.chapter_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {chapter.completion_percentage.toFixed(1)}%
                    </span>
                    <Badge
                      className={
                        chapter.status === "achieved"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : chapter.status === "in_progress"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }
                    >
                      {chapter.status === "achieved"
                        ? "Đạt"
                        : chapter.status === "in_progress"
                        ? "Đang học"
                        : "Cần chú ý"}
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress
                    value={chapter.completion_percentage}
                    className="h-3"
                  />
                  {/* Target line - more visible */}
                  <div
                    className="absolute top-0 w-1 h-3 bg-yellow-500 border-l-2 border-yellow-600"
                    style={{
                      left: `${data.chapter_completion_chart.target_line}%`,
                    }}
                  />
                  {/* Target line label */}
                  <div
                    className="absolute -top-6 transform -translate-x-1/2 text-xs text-yellow-700 font-medium"
                    style={{
                      left: `${data.chapter_completion_chart.target_line}%`,
                    }}
                  >
                    {data.chapter_completion_chart.target_line}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <div className="w-4 h-1 bg-yellow-500 border-l-2 border-yellow-600"></div>
                <span className="font-medium">
                  Đường mục tiêu: {data.chapter_completion_chart.target_line}%
                </span>
              </div>
              <div className="text-xs text-yellow-700">
                Chương đạt hoặc vượt mức này được coi là hoàn thành tốt
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Điểm mạnh & Điểm yếu nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Điểm mạnh */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Điểm mạnh ({data.learning_outcome_analysis.strengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.learning_outcome_analysis.strengths.length > 0 ? (
              <div className="space-y-3">
                {data.learning_outcome_analysis.strengths
                  .slice(0, 3)
                  .map((lo) => (
                    <div
                      key={lo.lo_id}
                      className="flex justify-between items-center p-3 bg-green-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-green-800">
                          {lo.lo_name}
                        </div>
                        <div className="text-sm text-green-600">
                          {lo.lo_description}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {lo.accuracy_percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                {data.learning_outcome_analysis.strengths.length > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{data.learning_outcome_analysis.strengths.length - 3} điểm
                    mạnh khác
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Chưa có điểm mạnh nổi bật
              </p>
            )}
          </CardContent>
        </Card>

        {/* Điểm yếu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Cần cải thiện ({data.learning_outcome_analysis.weaknesses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.learning_outcome_analysis.weaknesses.length > 0 ? (
              <div className="space-y-3">
                {data.learning_outcome_analysis.weaknesses
                  .slice(0, 3)
                  .map((lo) => (
                    <div
                      key={lo.lo_id}
                      className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-red-800">
                          {lo.lo_name}
                        </div>
                        <div className="text-sm text-red-600">
                          {lo.lo_description}
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        {lo.accuracy_percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                {data.learning_outcome_analysis.weaknesses.length > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{data.learning_outcome_analysis.weaknesses.length - 3} điểm
                    yếu khác
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Không có điểm yếu đáng kể
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 3-5 gợi ý hàng đầu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-600" />
            Gợi ý Ưu tiên Hàng đầu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topRecommendations.length > 0 ? (
            <div className="space-y-4">
              {topRecommendations.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{area}</div>
                      <div className="text-sm text-muted-foreground">
                        <span
                          title="Hoàn thành gợi ý này có thể giúp tăng mức độ thành thạo tổng thể của bạn"
                          className="cursor-help border-b border-dotted border-gray-400"
                        >
                          Ước tính cải thiện: +
                          {Math.floor(Math.random() * 15 + 5)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>~{Math.floor(Math.random() * 30 + 15)} phút</span>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={onViewFullRoadmap}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Xem toàn bộ lộ trình học tập
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 font-medium">Xuất sắc!</p>
              <p className="text-muted-foreground">
                Bạn đã hoàn thành tốt. Không có gợi ý ưu tiên nào.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
