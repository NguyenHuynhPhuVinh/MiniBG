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
import {
  Loader2,
  Lightbulb,
  Target,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Award,
  BookOpen,
  Users,
  FileText,
  Download,
  Clock,
  PenTool,
  BarChart3,
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { TeachingInsightsData } from "@/lib/types/chapter-analytics";

interface TeachingInsightsCardProps {
  quizId: number;
  className?: string;
}

export default function TeachingInsightsCard({
  quizId,
  className = "",
}: TeachingInsightsCardProps) {
  const [data, setData] = useState<TeachingInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await chapterAnalyticsService.getTeachingInsights(quizId);

      // Debug log để kiểm tra data structure
      console.log("Teaching Insights API Response:", result);

      // Validate data structure
      if (!result || typeof result !== "object") {
        throw new Error("Invalid data structure received from API");
      }

      setData(result);
    } catch (err) {
      console.error("Error fetching teaching insights:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu";
      setError(errorMessage);
      showErrorToast("Không thể tải teaching insights");
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
  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "mixed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "needs_improvement":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAssessmentLabel = (assessment: string) => {
    switch (assessment) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "mixed":
        return "Hỗn hợp";
      case "needs_improvement":
        return "Cần cải thiện";
      default:
        return assessment;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "weakness":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "opportunity":
        return <Target className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
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
      case "curriculum_revision":
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case "teaching_method":
        return <Award className="h-4 w-4 text-purple-600" />;
      case "student_support":
        return <Users className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleExportInsights = () => {
    if (!data) return;

    try {
      // Create export data
      const exportData = {
        summary: data.summary_insights,
        detailed_insights: data.detailed_insights,
        generated_at: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teaching-insights-quiz-${quizId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccessToast("Xuất insights thành công!");
    } catch (error) {
      console.error("Error exporting insights:", error);
      showErrorToast("Không thể xuất insights");
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-lg font-medium text-muted-foreground">
              Đang tải teaching insights...
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
            {error || "Không thể tải teaching insights"}
          </p>
          <Button onClick={refetch} className="mt-4" variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              Teaching Insights Summary
            </CardTitle>
            <Button
              onClick={handleExportInsights}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Xuất
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`p-4 rounded-lg border-2 ${getAssessmentColor(
              data.summary_insights.overall_assessment
            )}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                Đánh giá tổng thể:{" "}
                {getAssessmentLabel(data.summary_insights.overall_assessment)}
              </h3>
              <div className="flex items-center gap-2">
                {data.summary_insights.immediate_actions_needed > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    {data.summary_insights.immediate_actions_needed} hành động
                    cần thiết
                  </Badge>
                )}
                {data.summary_insights.long_term_improvements > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {data.summary_insights.long_term_improvements} cải thiện dài
                    hạn
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Key Strengths */}
              {data.summary_insights.key_strengths.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Điểm mạnh chính
                  </h4>
                  <ul className="space-y-1">
                    {data.summary_insights.key_strengths.map(
                      (strength: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2"
                        >
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Main Challenges */}
              {Array.isArray(data.summary_insights.main_challenges) &&
                data.summary_insights.main_challenges.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Thách thức chính
                    </h4>
                    <ul className="space-y-1">
                      {data.summary_insights.main_challenges.map(
                        (challenge: string, index: number) => (
                          <li
                            key={index}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-1">•</span>
                            {challenge}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Metrics Tổng quan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data.metrics.total_participants}
              </div>
              <div className="text-sm text-blue-700">Tổng học sinh</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data.metrics.average_score.toFixed(1)}
              </div>
              <div className="text-sm text-green-700">Điểm trung bình</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {data.metrics.completion_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700">Tỷ lệ hoàn thành</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {data.metrics.strong_los_count}/
                {data.metrics.strong_los_count + data.metrics.weak_los_count}
              </div>
              <div className="text-sm text-orange-700">LO mạnh/tổng</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {data.metrics.weak_students_count}
              </div>
              <div className="text-sm text-red-700">Học sinh yếu</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {data.metrics.excellent_students_count}
              </div>
              <div className="text-sm text-emerald-700">Học sinh xuất sắc</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Insights chi tiết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Curriculum Insights */}
            {Array.isArray(data.detailed_insights.curriculum_insights) &&
              data.detailed_insights.curriculum_insights.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Insights về Chương trình
                  </h4>
                  <div className="space-y-3">
                    {data.detailed_insights.curriculum_insights.map(
                      (insight: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {insight.type === "strength" && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {insight.type === "weakness" && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            {insight.type === "opportunity" && (
                              <Target className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm capitalize">
                                {insight.type === "strength" && "Điểm mạnh"}
                                {insight.type === "weakness" && "Điểm yếu"}
                                {insight.type === "opportunity" && "Cơ hội"}
                              </span>
                              <Badge
                                className={
                                  insight.impact === "positive"
                                    ? "bg-green-100 text-green-800"
                                    : insight.impact === "negative"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {insight.impact === "positive" && "Tích cực"}
                                {insight.impact === "negative" && "Tiêu cực"}
                                {insight.impact === "neutral" && "Trung tính"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {insight.message}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Teaching Method Insights */}
            {Array.isArray(data.detailed_insights.teaching_method_insights) &&
              data.detailed_insights.teaching_method_insights.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-green-600" />
                    Insights về Phương pháp Giảng dạy
                  </h4>
                  <div className="space-y-3">
                    {data.detailed_insights.teaching_method_insights.map(
                      (insight: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {insight.type === "time_concern" && (
                              <Clock className="h-5 w-5 text-orange-500" />
                            )}
                            {insight.type === "difficulty" && (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                            {insight.type === "engagement" && (
                              <Users className="h-5 w-5 text-blue-500" />
                            )}
                            {insight.type === "effectiveness" && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm capitalize">
                                {insight.type === "time_concern" && "Thời gian"}
                                {insight.type === "difficulty" && "Độ khó"}
                                {insight.type === "engagement" && "Tương tác"}
                                {insight.type === "effectiveness" && "Hiệu quả"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {insight.message}
                            </p>
                            {insight.suggestion && (
                              <div className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                                <strong>Gợi ý:</strong> {insight.suggestion}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Student Insights */}
            {Array.isArray(data.detailed_insights.student_insights) &&
              data.detailed_insights.student_insights.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    Insights về Học sinh
                  </h4>
                  <div className="space-y-3">
                    {data.detailed_insights.student_insights.map(
                      (insight: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {insight.type === "concern" && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            {insight.type === "strength" && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {insight.type === "opportunity" && (
                              <Target className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm capitalize">
                                {insight.type === "concern" && "Quan ngại"}
                                {insight.type === "strength" && "Điểm mạnh"}
                                {insight.type === "opportunity" && "Cơ hội"}
                              </span>
                              {insight.affected_count && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  {insight.affected_count} học sinh
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {insight.message}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Action Recommendations */}
      {Array.isArray(data.detailed_insights.action_recommendations) &&
        data.detailed_insights.action_recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Khuyến nghị hành động
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.detailed_insights.action_recommendations.map(
                  (rec: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getCategoryIcon(rec.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {rec.category === "question_improvement" &&
                              "Cải thiện câu hỏi"}
                            {rec.category === "teaching_method" &&
                              "Phương pháp giảng dạy"}
                            {rec.category === "student_support" &&
                              "Hỗ trợ học sinh"}
                            {rec.category === "curriculum_revision" &&
                              "Cải tiến chương trình"}
                            {![
                              "question_improvement",
                              "teaching_method",
                              "student_support",
                              "curriculum_revision",
                            ].includes(rec.category) && rec.category}
                          </span>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority === "high" && "Ưu tiên cao"}
                            {rec.priority === "medium" && "Ưu tiên trung bình"}
                            {rec.priority === "low" && "Ưu tiên thấp"}
                          </Badge>
                          <Badge variant="outline">
                            {rec.timeline === "immediate" && "Ngay lập tức"}
                            {rec.timeline === "next_quiz" && "Quiz tiếp theo"}
                            {rec.timeline === "short_term" && "Ngắn hạn"}
                            {rec.timeline === "long_term" && "Dài hạn"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rec.action}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Priority Actions */}
      {Array.isArray(data.detailed_insights.priority_actions) &&
        data.detailed_insights.priority_actions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Hành động Ưu tiên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.detailed_insights.priority_actions.map(
                  (action: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 border-2 border-red-200 rounded-lg bg-red-50"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={
                              action.urgency === "high"
                                ? "bg-red-100 text-red-800"
                                : action.urgency === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {action.urgency === "high" && "Khẩn cấp"}
                            {action.urgency === "medium" && "Trung bình"}
                            {action.urgency === "low" && "Thấp"}
                          </Badge>
                          <span className="text-xs text-red-700 font-medium">
                            Thời gian: {action.estimated_time}
                          </span>
                        </div>
                        <p className="text-sm text-red-800 font-medium mb-2">
                          {action.action}
                        </p>
                        <div className="p-2 bg-red-100 rounded text-sm text-red-700">
                          <strong>Kết quả mong đợi:</strong>{" "}
                          {action.expected_outcome}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
