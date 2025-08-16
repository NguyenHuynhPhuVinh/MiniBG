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
  BarChart3,
  Users,
  Trophy,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle,
  Award,
  FileText,
  PenTool,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { TeacherAnalyticsData } from "@/lib/types/chapter-analytics";

interface TeacherChapterAnalyticsChartProps {
  quizId: number;
  quizName?: string;
  className?: string;
}

export default function TeacherChapterAnalyticsChart({
  quizId,
  className = "",
}: TeacherChapterAnalyticsChartProps) {
  const [data, setData] = useState<TeacherAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await chapterAnalyticsService.getTeacherAnalytics({
        quiz_id: quizId,
        include_student_details: true,
        include_recommendations: true,
      });

      // Debug log để kiểm tra data structure
      console.log("Teacher Analytics API Response:", result);

      // Validate data structure
      if (!result || typeof result !== "object") {
        throw new Error("Invalid data structure received from API");
      }

      setData(result);
    } catch (err) {
      console.error("Error fetching teacher analytics:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu";
      setError(errorMessage);
      showErrorToast("Không thể tải dữ liệu phân tích");
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
  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "weak":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
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

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-600 mb-2">
            Lỗi tải dữ liệu
          </p>
          <p className="text-muted-foreground text-center">
            {error || "Không thể tải dữ liệu phân tích"}
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
      {/* Overall Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Tổng quan hiệu suất: {data?.quiz_info?.name || "Quiz"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {data?.participant_stats?.total_participants || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Tổng số học sinh</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {data?.participant_stats?.completed_participants || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-600">
                  {data?.participant_stats?.average_score?.toFixed(1) || "0.0"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Điểm trung bình</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">
                  {data?.participant_stats?.completion_rate?.toFixed(1) ||
                    "0.0"}
                  %
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Groups Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Phân bố nhóm học sinh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data?.student_performance_groups?.excellent?.students
                  ?.length || 0}
              </div>
              <div className="text-sm text-green-700 mb-2">
                (≥{data?.student_performance_groups?.excellent?.threshold || 85}
                %)
              </div>
              <Badge className="bg-green-100 text-green-800">Xuất sắc</Badge>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data?.student_performance_groups?.good?.students?.length || 0}
              </div>
              <div className="text-sm text-blue-700 mb-2">
                (≥{data?.student_performance_groups?.good?.threshold || 70}%)
              </div>
              <Badge className="bg-blue-100 text-blue-800">Tốt</Badge>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {data?.student_performance_groups?.average?.students?.length ||
                  0}
              </div>
              <div className="text-sm text-yellow-700 mb-2">
                (≥{data?.student_performance_groups?.average?.threshold || 50}%)
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Trung bình
              </Badge>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {data?.student_performance_groups?.weak?.students?.length || 0}
              </div>
              <div className="text-sm text-red-700 mb-2">
                (&lt;
                {data?.student_performance_groups?.average?.threshold || 50}%)
              </div>
              <Badge className="bg-red-100 text-red-800">Yếu</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Outcome Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Phân tích Learning Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(data?.learning_outcome_analysis) ? (
              data.learning_outcome_analysis.map((lo: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{lo.lo_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Độ chính xác: {lo.accuracy?.toFixed(1) || "0.0"}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • {lo.total_questions || 0} câu hỏi
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • {lo.students_attempted || 0} học sinh
                        </span>
                        <Badge
                          className={getPerformanceLevelColor(
                            lo.performance_level
                          )}
                        >
                          {lo.performance_level === "excellent" && "Xuất sắc"}
                          {lo.performance_level === "good" && "Tốt"}
                          {lo.performance_level === "average" && "Trung bình"}
                          {lo.performance_level === "weak" && "Yếu"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Progress value={lo.accuracy || 0} className="w-24 h-2" />
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {lo.correct_attempts || 0}/{lo.total_attempts || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Đúng/Tổng
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {((lo.average_time || 0) / 1000).toFixed(1)}s
                      </div>
                      <div className="text-xs text-muted-foreground">
                        TB thời gian
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {((lo.total_time || 0) / 1000).toFixed(0)}s
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tổng thời gian
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        {lo.students_attempted || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Học sinh
                      </div>
                    </div>
                  </div>

                  {lo.insights.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Insights:
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {lo.insights.map((insight: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lo.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <PenTool className="h-4 w-4" />
                        Khuyến nghị:
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {lo.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Không có learning outcome analysis để hiển thị
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Level Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Phân tích theo độ khó
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(data?.difficulty_level_analysis) ? (
              data.difficulty_level_analysis.map(
                (level: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {level.level_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            Độ chính xác: {level.accuracy?.toFixed(1) || "0.0"}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • {level.total_questions || 0} câu hỏi
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • {level.students_attempted || 0} học sinh
                          </span>
                          <Badge
                            className={getPerformanceLevelColor(
                              level.performance_level
                            )}
                          >
                            {level.performance_level === "excellent" &&
                              "Xuất sắc"}
                            {level.performance_level === "good" && "Tốt"}
                            {level.performance_level === "average" &&
                              "Trung bình"}
                            {level.performance_level === "weak" && "Yếu"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Progress
                          value={level.accuracy || 0}
                          className="w-24 h-2"
                        />
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {level.correct_attempts || 0}/
                          {level.total_attempts || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Đúng/Tổng
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {((level.average_time || 0) / 1000).toFixed(1)}s
                        </div>
                        <div className="text-xs text-muted-foreground">
                          TB thời gian
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {((level.total_time || 0) / 1000).toFixed(0)}s
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tổng thời gian
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600">
                          {level.students_attempted || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Học sinh
                        </div>
                      </div>
                    </div>

                    {/* Insights */}
                    {Array.isArray(level.insights) &&
                      level.insights.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Insights:
                          </h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {level.insights.map(
                              (insight: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-blue-500 mt-1">•</span>
                                  {insight}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Recommendations */}
                    {Array.isArray(level.recommendations) &&
                      level.recommendations.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <PenTool className="h-4 w-4" />
                            Khuyến nghị:
                          </h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {level.recommendations.map(
                              (rec: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-green-500 mt-1">•</span>
                                  {rec}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                )
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Không có dữ liệu phân tích độ khó
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Teacher Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Insights Section */}
            {Array.isArray(data?.teacher_insights?.insights) &&
              data.teacher_insights.insights.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Insights
                  </h3>
                  <div className="space-y-3">
                    {data.teacher_insights.insights.map(
                      (insight: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 border rounded-lg"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {insight.type === "warning" && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            {insight.type === "info" && (
                              <FileText className="h-5 w-5 text-blue-500" />
                            )}
                            {insight.type === "success" && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium capitalize">
                                {insight.category}
                              </span>
                              <Badge
                                className={
                                  insight.priority === "high"
                                    ? "bg-red-100 text-red-800"
                                    : insight.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {insight.priority === "high" && "Cao"}
                                {insight.priority === "medium" && "Trung bình"}
                                {insight.priority === "low" && "Thấp"}
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

            {/* Recommendations Section */}
            {Array.isArray(data?.teacher_insights?.recommendations) &&
              data.teacher_insights.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Khuyến nghị
                  </h3>
                  <div className="space-y-3">
                    {data.teacher_insights.recommendations.map(
                      (rec: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 border rounded-lg"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <PenTool className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium capitalize">
                                {rec.category}
                              </span>
                              <Badge
                                className={
                                  rec.priority === "high"
                                    ? "bg-red-100 text-red-800"
                                    : rec.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {rec.priority === "high" && "Cao"}
                                {rec.priority === "medium" && "Trung bình"}
                                {rec.priority === "low" && "Thấp"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {rec.suggestion}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* No data fallback */}
            {(!data?.teacher_insights?.insights ||
              data.teacher_insights.insights.length === 0) &&
              (!data?.teacher_insights?.recommendations ||
                data.teacher_insights.recommendations.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Không có insights và khuyến nghị từ hệ thống
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
