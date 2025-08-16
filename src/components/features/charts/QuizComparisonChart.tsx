"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  Loader2,
  BarChart3,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  Award,
  Zap,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { showErrorToast } from "@/lib/utils/toast-utils";

interface QuizComparisonChartProps {
  quizId: number;
  className?: string;
}

export default function QuizComparisonChart({
  quizId,
  className = "",
}: QuizComparisonChartProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Tạm thời disable benchmark comparison
      const result = null; // await chapterAnalyticsService.getQuizBenchmark(quizId, options);

      // Tạm thời set empty data để không crash UI
      setData({
        message: "Tính năng so sánh benchmark đang được phát triển",
        disabled: true,
      });
    } catch (err) {
      console.error("Error fetching quiz benchmark:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu";
      setError(errorMessage);
      showErrorToast("Không thể tải dữ liệu so sánh quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchData();
    }
  }, [quizId]);

  const refetch = () => {
    fetchData();
  };

  // Helper functions
  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      case "neutral":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "negative":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "neutral":
        return <Target className="h-4 w-4 text-blue-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "improvement":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "maintenance":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "investigation":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDifference = (value: number, isPercentage: boolean = false) => {
    const sign = value >= 0 ? "+" : "";
    const suffix = isPercentage ? "%" : "";
    return `${sign}${value.toFixed(1)}${suffix}`;
  };

  const getDifferenceColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-lg font-medium text-muted-foreground">
              Đang tải dữ liệu so sánh...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-600 mb-2">
            Lỗi tải dữ liệu
          </p>
          <p className="text-muted-foreground text-center">
            {error || "Không thể tải dữ liệu so sánh"}
          </p>
          <Button onClick={refetch} className="mt-4" variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Hiển thị message khi tính năng bị disabled
  if (data.disabled) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <BarChart3 className="h-16 w-16 text-blue-500 mb-4" />
          <p className="text-lg font-medium text-blue-600 mb-2">
            Tính năng đang phát triển
          </p>
          <p className="text-muted-foreground text-center">{data.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Quiz Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Metrics Quiz hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="font-semibold text-lg">{data.current_quiz.name}</h3>
            <p className="text-sm text-muted-foreground">
              Quiz ID: {data.current_quiz.quiz_id}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data.current_quiz.metrics.average_score.toFixed(1)}
              </div>
              <div className="text-sm text-blue-700">Điểm TB</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data.current_quiz.metrics.completion_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-green-700">Tỷ lệ hoàn thành</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {data.current_quiz.metrics.pass_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-yellow-700">Tỷ lệ đạt</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {data.current_quiz.metrics.excellence_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700">Tỷ lệ xuất sắc</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Benchmark Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            So sánh với Subject Benchmark
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {data.comparisons.subject_benchmark.comparison_base}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Điểm trung bình</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold">
                      {data.current_quiz.metrics.average_score.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">vs</span>
                    <span className="text-lg">
                      {data.comparisons.subject_benchmark.subject_average.average_score.toFixed(
                        1
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${getDifferenceColor(
                      data.comparisons.subject_benchmark.current_vs_average
                        .score_difference
                    )}`}
                  >
                    {formatDifference(
                      data.comparisons.subject_benchmark.current_vs_average
                        .score_difference
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Chênh lệch
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Tỷ lệ hoàn thành</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold">
                      {data.current_quiz.metrics.completion_rate.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">vs</span>
                    <span className="text-lg">
                      {data.comparisons.subject_benchmark.subject_average.completion_rate.toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${getDifferenceColor(
                      data.comparisons.subject_benchmark.current_vs_average
                        .completion_difference
                    )}`}
                  >
                    {formatDifference(
                      data.comparisons.subject_benchmark.current_vs_average
                        .completion_difference,
                      true
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Chênh lệch
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Xếp hạng hiệu suất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  #{data.performance_ranking.current_rank}
                </div>
                <div className="text-sm text-muted-foreground">Xếp hạng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {data.performance_ranking.percentile.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Percentile</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Trong tổng số {data.performance_ranking.total_quizzes} quiz
            </p>
            <Badge className="bg-blue-100 text-blue-800">
              {data.performance_ranking.ranking_insights}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {data.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Insights so sánh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.insights.map((insight: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getInsightTypeColor(
                    insight.type
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getInsightTypeIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm capitalize">
                          {insight.category === "performance" && "Hiệu suất"}
                          {insight.category === "participation" && "Tham gia"}
                          {insight.category === "improvement" && "Cải thiện"}
                        </span>
                        <Badge variant="outline">
                          {insight.type === "positive" && "Tích cực"}
                          {insight.type === "negative" && "Tiêu cực"}
                          {insight.type === "neutral" && "Trung tính"}
                        </Badge>
                      </div>
                      <p className="text-sm">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Khuyến nghị cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {rec.category === "improvement" && "Cải thiện"}
                        {rec.category === "maintenance" && "Duy trì"}
                        {rec.category === "investigation" && "Điều tra"}
                      </span>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority === "high" && "Ưu tiên cao"}
                        {rec.priority === "medium" && "Ưu tiên trung bình"}
                        {rec.priority === "low" && "Ưu tiên thấp"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rec.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
