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
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  TrendingUp,
  TrendingDown,
  PlayCircle,
  FileText,
  PenTool,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { subjectService } from "@/lib/services/api/subject.service";
import { ComprehensiveAnalysisData } from "@/lib/types/chapter-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface ChapterCompletionChartProps {
  className?: string;
}

// Use the actual API data structure
type ChapterCompletionData =
  ComprehensiveAnalysisData["chapter_completion_chart"];

export default function ChapterCompletionChart({
  className = "",
}: ChapterCompletionChartProps) {
  const { getUser } = useAuthStatus();
  const [data, setData] = useState<ComprehensiveAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);

  // Target completion percentage (can be configurable)
  const TARGET_COMPLETION = 80;

  // Resolve subject ID logic
  const resolveSubjectId = async (): Promise<number | null> => {
    try {
      const subjectsResponse = await subjectService.getSubjects();
      if (subjectsResponse?.subjects && subjectsResponse.subjects.length > 0) {
        return subjectsResponse.subjects[0].subject_id;
      }
      return null;
    } catch (error) {
      console.error("Error resolving subject ID:", error);
      return null;
    }
  };

  // Use actual completion chart data from API
  const getCompletionData = (
    analysisData: ComprehensiveAnalysisData
  ): ChapterCompletionData => {
    return analysisData.chapter_completion_chart;
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = getUser();
      if (!user) {
        setError("Vui lòng đăng nhập để xem phân tích");
        return;
      }

      let currentSubjectId = subjectId;
      if (!currentSubjectId) {
        currentSubjectId = await resolveSubjectId();
        if (!currentSubjectId) {
          setError("Không tìm thấy môn học nào");
          return;
        }
        setSubjectId(currentSubjectId);
      }

      const response = await chapterAnalyticsService.getComprehensiveAnalysis({
        subject_id: currentSubjectId,
        user_id: user.user_id,
      });

      setData(response);
    } catch (error) {
      console.error("Error fetching chapter completion data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu tiến độ";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <PlayCircle className="h-4 w-4" />;
      case "exercise":
        return <PenTool className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  // Get content type label
  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Lý thuyết";
      case "video":
        return "Video";
      case "exercise":
        return "Bài tập";
      default:
        return "Nội dung";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "needs_attention":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "achieved":
        return "Đạt mục tiêu";
      case "in_progress":
        return "Đang tiến bộ";
      case "needs_attention":
        return "Cần chú ý";
      default:
        return "Chưa xác định";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
            Tiến độ Hoàn thành theo Chương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-muted-foreground">
              Đang tải dữ liệu...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
            Tiến độ Hoàn thành theo Chương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 font-medium mb-2">Lỗi tải dữ liệu</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline" size="sm">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
            Tiến độ Hoàn thành theo Chương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-muted-foreground">Chưa có dữ liệu tiến độ</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use actual data
  const completionData = getCompletionData(data);
  const averageCompletion =
    completionData.completion_percentages.reduce((a, b) => a + b, 0) /
    completionData.completion_percentages.length;
  const chaptersAchieved = completionData.chart_data.filter(
    (item) => item.status === "achieved"
  ).length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          Tiến độ Hoàn thành theo Chương
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Môn học: {data.subject_info.subject_name}</span>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Mục tiêu: {data.chapter_completion_chart.target_line}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {averageCompletion.toFixed(1)}%
            </div>
            <div className="text-sm text-green-700">Tiến độ trung bình</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {chaptersAchieved}/{completionData.chart_data.length}
            </div>
            <div className="text-sm text-blue-700">Chương đạt mục tiêu</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {TARGET_COMPLETION}%
            </div>
            <div className="text-sm text-purple-700">Mục tiêu hoàn thành</div>
          </div>
        </div>

        {/* Target Line Indicator */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              Đường mục tiêu: {TARGET_COMPLETION}%
            </span>
          </div>
          <p className="text-sm text-yellow-700">
            Các chương đạt hoặc vượt mức này được coi là hoàn thành tốt.
          </p>
        </div>

        {/* Chapter Progress Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Chi tiết Tiến độ
          </h3>

          {completionData.chart_data.map((chapter) => (
            <div
              key={chapter.chapter_id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-base">
                  {chapter.chapter_name}
                </h4>
                <Badge className={getStatusColor(chapter.status)}>
                  {getStatusText(chapter.status)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiến độ hoàn thành</span>
                  <span className="font-medium">
                    {chapter.completion_percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={chapter.completion_percentage}
                  className="h-3"
                />

                {/* Target line visualization */}
                <div className="relative">
                  <div
                    className="absolute top-0 w-0.5 h-3 bg-yellow-500"
                    style={{ left: `${TARGET_COMPLETION}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {(chapter.status === "needs_attention" ||
                      chapter.status === "in_progress") && (
                      <span className="text-red-600">
                        Còn thiếu {chapter.gap_to_target.toFixed(1)}% để đạt mục
                        tiêu
                      </span>
                    )}
                    {chapter.status === "achieved" && (
                      <span className="text-green-600">
                        Đã vượt mục tiêu{" "}
                        {(
                          chapter.completion_percentage -
                          completionData.target_line
                        ).toFixed(1)}
                        %
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Types */}
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="text-sm font-medium mb-2">
                  Loại nội dung có sẵn:
                </div>
                <div className="flex flex-wrap gap-2">
                  {chapter.sections.map((section) => (
                    <div
                      key={section.section_id}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        section.has_content
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {getContentTypeIcon(section.content_type)}
                      <span>{getContentTypeLabel(section.content_type)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gap Analysis Summary */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Phân tích Khoảng cách
          </h3>
          <div className="space-y-2 text-sm">
            {completionData.chart_data
              .filter(
                (chapter) =>
                  chapter.status === "needs_attention" ||
                  chapter.status === "in_progress"
              )
              .sort((a, b) => b.gap_to_target - a.gap_to_target)
              .slice(0, 3)
              .map((chapter) => (
                <div key={chapter.chapter_id} className="flex justify-between">
                  <span className="text-blue-700">{chapter.chapter_name}</span>
                  <span className="font-medium text-red-600">
                    -{chapter.gap_to_target.toFixed(1)}%
                  </span>
                </div>
              ))}
            {completionData.chart_data.every(
              (chapter) => chapter.status === "achieved"
            ) && (
              <div className="text-center text-green-600 font-medium">
                <CheckCircle className="h-5 w-5 inline mr-2" />
                Tất cả chương đã đạt mục tiêu!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
