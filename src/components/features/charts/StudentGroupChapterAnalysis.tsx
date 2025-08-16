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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  Loader2,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Award,
  BarChart3,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { StudentGroupAnalysisData } from "@/lib/types/chapter-analytics";

interface StudentGroupChapterAnalysisProps {
  quizId: number;
  className?: string;
}

export default function StudentGroupChapterAnalysis({
  quizId,
  className = "",
}: StudentGroupChapterAnalysisProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("excellent");
  const [expandedStudents, setExpandedStudents] = useState(false);
  const [data, setData] = useState<StudentGroupAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await chapterAnalyticsService.getStudentGroupAnalysis(
        quizId,
        selectedGroup
      );

      // Debug log để kiểm tra data structure
      console.log("Student Group Analysis API Response:", result);

      // Validate data structure
      if (!result || typeof result !== "object") {
        throw new Error("Invalid data structure received from API");
      }

      setData(result);
    } catch (err) {
      console.error("Error fetching student group analysis:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu";
      setError(errorMessage);
      showErrorToast("Không thể tải dữ liệu phân tích nhóm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId && selectedGroup) {
      fetchData();
    }
  }, [quizId, selectedGroup]);

  const refetch = () => {
    fetchData();
  };

  // Helper functions
  const getGroupColor = (groupName: string) => {
    switch (groupName) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "average":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "weak":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getGroupLabel = (groupName: string) => {
    switch (groupName) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Giỏi";
      case "average":
        return "Trung bình";
      case "weak":
        return "Yếu";
      default:
        return groupName;
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "immediate_action":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "long_term":
        return <Target className="h-4 w-4 text-blue-600" />;
      case "monitoring":
        return <Eye className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Group Selection - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Phân tích nhóm học sinh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Chọn nhóm:</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn nhóm học sinh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Xuất sắc</SelectItem>
                <SelectItem value="good">Giỏi</SelectItem>
                <SelectItem value="average">Trung bình</SelectItem>
                <SelectItem value="weak">Yếu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display - Show when there's an error */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-lg font-medium text-red-600 mb-2">
              Lỗi tải dữ liệu
            </p>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Group Overview - Only show when no error */}
      {!error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Tổng quan nhóm {getGroupLabel(selectedGroup)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`p-4 rounded-lg border-2 ${getGroupColor(
                data?.group_overview?.group_name || selectedGroup
              )}`}
            >
              {data ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Nhóm{" "}
                        {getGroupLabel(
                          data?.group_overview?.group_name || selectedGroup
                        )}
                      </h3>
                      <p className="text-sm opacity-80">
                        {data?.group_overview?.student_count || 0} học sinh
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {data?.group_overview?.score_range?.average?.toFixed(
                          1
                        ) || "0.0"}
                      </div>
                      <div className="text-sm opacity-80">
                        Điểm TB (
                        {data?.group_overview?.score_range?.min?.toFixed(1) ||
                          "0.0"}{" "}
                        -{" "}
                        {data?.group_overview?.score_range?.max?.toFixed(1) ||
                          "0.0"}
                        )
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {data?.group_overview?.completion_stats
                          ?.total_questions || 0}
                      </div>
                      <div className="text-xs opacity-80">Tổng câu hỏi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {data?.group_overview?.completion_stats
                          ?.average_correct || 0}
                      </div>
                      <div className="text-xs opacity-80">TB câu đúng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {(
                          (data?.group_overview?.completion_stats
                            ?.average_time_per_question || 0) / 1000
                        ).toFixed(1)}
                        s
                      </div>
                      <div className="text-xs opacity-80">TB thời gian/câu</div>
                    </div>
                  </div>
                </>
              ) : loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3 mx-auto" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nhóm {getGroupLabel(selectedGroup)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Đang tải dữ liệu...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Nhóm {getGroupLabel(selectedGroup)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Không có dữ liệu cho nhóm này
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show other cards when no error */}
      {!error && (
        <>
          {/* Students List - Show at position 2 when no error */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Danh sách học sinh ({data?.students?.length || 0})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedStudents(!expandedStudents)}
                  className="flex items-center gap-2"
                >
                  {expandedStudents ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Xem chi tiết
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {expandedStudents && (
              <CardContent>
                {data?.students && data.students.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Array.isArray(data?.students) ? (
                      data.students.map((student: any, index: number) => (
                        <div
                          key={student.user_id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">
                                {student?.name || "Không có tên"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ID: {student?.user_id || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {student?.score?.toFixed(1) || "0.0"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student?.correct_answers || 0} câu đúng
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          {loading
                            ? "Đang tải danh sách sinh viên..."
                            : "Không có sinh viên trong nhóm này"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      {loading
                        ? "Đang tải danh sách sinh viên..."
                        : "Không có sinh viên trong nhóm này"}
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {data && (
            <>
              {/* Group Insights */}
              {data.group_overview.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6 text-primary" />
                      Insights về nhóm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.isArray(data?.group_overview?.insights) ? (
                        data.group_overview.insights.map(
                          (insight: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                            >
                              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-800">{insight}</p>
                            </div>
                          )
                        )
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground text-sm">
                            Không có insights để hiển thị
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {Array.isArray(data?.group_overview?.recommendations) &&
                data.group_overview.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-6 w-6 text-primary" />
                        Khuyến nghị cho nhóm
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data.group_overview.recommendations.map(
                          (rec: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-4 border rounded-lg"
                            >
                              <div className="flex-shrink-0 mt-1">
                                <Target className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                    {rec.type}
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
                    </CardContent>
                  </Card>
                )}

              {/* Learning Outcome Analysis */}
              {data.learning_outcome_analysis.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                      Phân tích Learning Outcomes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.learning_outcome_analysis.map(
                        (lo: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold">{lo.lo_name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-muted-foreground">
                                    Độ chính xác:{" "}
                                    {lo.accuracy?.toFixed(1) || "0.0"}%
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    • {lo.total_questions || 0} câu hỏi
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    • {lo.students_attempted || 0} học sinh
                                  </span>
                                  <Badge
                                    className={getGroupColor(
                                      lo.performance_level
                                    )}
                                  >
                                    {getGroupLabel(lo.performance_level)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <Progress
                                  value={lo.accuracy || 0}
                                  className="w-24 h-2"
                                />
                              </div>
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
                              <div className="text-center">
                                <div className="text-lg font-semibold text-blue-600">
                                  {lo.correct_attempts || 0}/
                                  {lo.total_attempts || 0}
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

                            {/* Insights và Recommendations */}
                            <div className="mt-3 space-y-2">
                              {Array.isArray(lo.insights) &&
                                lo.insights.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">
                                      Insights:
                                    </h5>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {lo.insights.map(
                                        (insight: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="text-blue-500 mt-1">
                                              •
                                            </span>
                                            {insight}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {Array.isArray(lo.recommendations) &&
                                lo.recommendations.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">
                                      Khuyến nghị:
                                    </h5>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {lo.recommendations.map(
                                        (rec: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="text-green-500 mt-1">
                                              →
                                            </span>
                                            {rec}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Difficulty Level Analysis */}
              {data.difficulty_level_analysis.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-primary" />
                      Phân tích theo độ khó
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.difficulty_level_analysis.map(
                        (level: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {level.level_name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-muted-foreground">
                                    Độ chính xác:{" "}
                                    {level.accuracy?.toFixed(1) || "0.0"}%
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    • {level.total_questions || 0} câu hỏi
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    • {level.students_attempted || 0} học sinh
                                  </span>
                                  <Badge
                                    className={getGroupColor(
                                      level.performance_level
                                    )}
                                  >
                                    {getGroupLabel(level.performance_level)}
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
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
                                  {((level.average_time || 0) / 1000).toFixed(
                                    1
                                  )}
                                  s
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

                            {/* Insights và Recommendations */}
                            <div className="mt-3 space-y-2">
                              {Array.isArray(level.insights) &&
                                level.insights.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">
                                      Insights:
                                    </h5>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {level.insights.map(
                                        (insight: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="text-blue-500 mt-1">
                                              •
                                            </span>
                                            {insight}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {Array.isArray(level.recommendations) &&
                                level.recommendations.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">
                                      Khuyến nghị:
                                    </h5>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {level.recommendations.map(
                                        (rec: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="text-green-500 mt-1">
                                              →
                                            </span>
                                            {rec}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>

                            {Array.isArray(level.insights) &&
                              level.insights.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">
                                    Insights:
                                  </h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {level.insights.map(
                                      (insight: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="flex items-start gap-2"
                                        >
                                          <span className="text-orange-500 mt-1">
                                            •
                                          </span>
                                          {insight}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
