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
  BookOpen,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Award,
  BarChart3,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { subjectService } from "@/lib/services/api/subject.service";
import { ComprehensiveAnalysisData } from "@/lib/types/chapter-analytics";
import { Subject } from "@/lib/types/quiz";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface ChapterMasteryChartProps {
  className?: string;
}

export default function ChapterMasteryChart({
  className = "",
}: ChapterMasteryChartProps) {
  const { getUser } = useAuthStatus();
  const [data, setData] = useState<ComprehensiveAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);

  // Fetch subject ID resolution logic
  const resolveSubjectId = async (): Promise<number | null> => {
    try {
      // Get available subjects
      const subjectsResponse = await subjectService.getSubjects();
      if (subjectsResponse?.subjects && subjectsResponse.subjects.length > 0) {
        // Use first available subject as fallback
        return subjectsResponse.subjects[0].subject_id;
      }
      return null;
    } catch (error) {
      console.error("Error resolving subject ID:", error);
      return null;
    }
  };

  // Fetch comprehensive analysis data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = getUser();
      if (!user) {
        setError("Vui lòng đăng nhập để xem phân tích");
        return;
      }

      // Resolve subject ID if not set
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

      console.log("=== CHAPTER MASTERY CHART API DEBUG ===");
      console.log("Full API Response:", JSON.stringify(response, null, 2));
      console.log("Response keys:", Object.keys(response));
      console.log("Overall performance:", response.overall_performance);
      console.log("Chapter analysis:", response.chapter_analysis);
      console.log("=== END DEBUG ===");

      setData(response);
    } catch (error) {
      console.error("Error fetching chapter mastery data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu phân tích";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  // Get mastery level color
  const getMasteryLevelColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-green-100 text-green-800 border-green-200";
      case "advanced":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "beginner":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get mastery level Vietnamese text
  const getMasteryLevelText = (level: string) => {
    switch (level) {
      case "expert":
        return "Chuyên gia";
      case "advanced":
        return "Nâng cao";
      case "intermediate":
        return "Trung bình";
      case "beginner":
        return "Cơ bản";
      default:
        return "Chưa xác định";
    }
  };

  // Get improvement trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get improvement trend text
  const getTrendText = (trend: string) => {
    switch (trend) {
      case "improving":
        return "Đang cải thiện";
      case "declining":
        return "Đang giảm";
      case "stable":
        return "Ổn định";
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
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Mức độ Thành thạo theo Chương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Mức độ Thành thạo theo Chương
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
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Mức độ Thành thạo theo Chương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-muted-foreground">Chưa có dữ liệu phân tích</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Mức độ Thành thạo theo Chương
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Môn học: {data.subject_info.subject_name}</span>
          <div className="flex items-center gap-1">
            <span>Mức độ: {data.overall_performance.performance_level}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.overall_performance.overall_accuracy_percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">Độ chính xác tổng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.overall_performance.average_quiz_score.toFixed(1)}
            </div>
            <div className="text-sm text-green-700">Điểm trung bình</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.subject_info.completed_quizzes}
            </div>
            <div className="text-sm text-purple-700">Quiz đã hoàn thành</div>
          </div>
        </div>

        {/* Chapter Analysis */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-600" />
            Phân tích theo Chương
          </h3>

          {/* Strengths */}
          {data.chapter_analysis.strengths.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Chương mạnh ({data.chapter_analysis.strengths.length})
              </h4>
              {data.chapter_analysis.strengths.map((chapter) => (
                <div
                  key={chapter.chapter_id}
                  className="border border-green-200 rounded-lg p-4 bg-green-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{chapter.chapter_name}</h5>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {chapter.accuracy_percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    {chapter.chapter_description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-green-600">
                    <span>
                      Câu đúng: {chapter.correct_answers}/
                      {chapter.total_questions}
                    </span>
                    <span>LO liên quan: {chapter.related_los.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weaknesses */}
          {data.chapter_analysis.weaknesses.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Chương yếu ({data.chapter_analysis.weaknesses.length})
              </h4>
              {data.chapter_analysis.weaknesses.map((chapter) => (
                <div
                  key={chapter.chapter_id}
                  className="border border-red-200 rounded-lg p-4 bg-red-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{chapter.chapter_name}</h5>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {chapter.accuracy_percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700 mb-2">
                    {chapter.chapter_description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-red-600">
                    <span>
                      Câu đúng: {chapter.correct_answers}/
                      {chapter.total_questions}
                    </span>
                    <span>LO liên quan: {chapter.related_los.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Neutral */}
          {data.chapter_analysis.neutral.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Chương trung bình ({data.chapter_analysis.neutral.length})
              </h4>
              {data.chapter_analysis.neutral.map((chapter) => (
                <div key={chapter.chapter_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{chapter.chapter_name}</h5>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {chapter.accuracy_percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {chapter.chapter_description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <span>
                      Câu đúng: {chapter.correct_answers}/
                      {chapter.total_questions}
                    </span>
                    <span>LO liên quan: {chapter.related_los.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievement Summary */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-green-600" />
            Tổng kết Thành tích
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {data.chapter_analysis.achievement_summary.achieved_chapters}
              </div>
              <div className="text-sm text-green-700">Chương đạt</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {data.chapter_analysis.achievement_summary.in_progress_chapters}
              </div>
              <div className="text-sm text-blue-700">Đang học</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-600">
                {
                  data.chapter_analysis.achievement_summary
                    .needs_attention_chapters
                }
              </div>
              <div className="text-sm text-amber-700">Cần chú ý</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-600">
                {data.chapter_analysis.achievement_summary.total_chapters}
              </div>
              <div className="text-sm text-gray-700">Tổng chương</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
