"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  AlertCircle,
  BookOpen,
  User,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { ChapterAnalysisData } from "@/lib/types/chapter-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

// Import new components
import PerformanceOverview from "./PerformanceOverview";
import ChapterAnalysisTabs from "./ChapterAnalysisTabs";
import StudyPlanRecommendations from "./StudyPlanRecommendations";
import ChapterRadarChart from "./ChapterRadarChart";

interface ChapterAnalysisChartProps {
  quizId: number;
  quizName?: string;
  className?: string;
}

export default function ChapterAnalysisChart({
  quizId,
  quizName,
  className = "",
}: ChapterAnalysisChartProps) {
  const { getUser } = useAuthStatus();
  const [analysisData, setAnalysisData] = useState<ChapterAnalysisData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize user để tránh re-render không cần thiết
  const user = useMemo(() => getUser(), [getUser]);

  // Memoize fetch function để tránh re-create không cần thiết
  const fetchAnalysisData = useCallback(async () => {
    if (!quizId || !user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Calling Chapter Analytics API with params:", {
        quiz_id: quizId,
        user_id: user.user_id,
      });

      const data = await chapterAnalyticsService.getDetailedAnalysis({
        quiz_id: quizId,
        user_id: user.user_id,
      });

      console.log("=== FULL API RESPONSE DEBUG ===");
      console.log("Complete API Response:", JSON.stringify(data, null, 2));
      console.log("=== END FULL API RESPONSE ===");

      console.log("Chapter Analytics API Response:", data);
      console.log("Data structure:", {
        hasQuizInfo: !!data.quiz_info,
        hasStudentInfo: !!data.student_info,
        hasChapterAnalysis: !!data.chapter_analysis,
        hasChapters: !!(
          data.chapter_analysis?.strengths || data.chapter_analysis?.weaknesses
        ),
        dataKeys: Object.keys(data),
      });

      setAnalysisData(data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu phân tích theo chương:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tải dữ liệu phân tích";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [quizId, user]);

  useEffect(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  // Early return nếu không có user để tránh flickering
  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Đang xác thực người dùng...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <Loader2 className="h-16 w-16 text-muted-foreground animate-spin mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Đang tải phân tích theo chương...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysisData) {
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header: Thông tin bài kiểm tra */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                Kết quả phân tích bài kiểm tra:{" "}
                {quizName || analysisData.quiz_info?.quiz_name}
              </CardTitle>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>
                      Môn học:{" "}
                      <span className="font-medium">
                        {analysisData.quiz_info?.subject?.name || "N/A"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      Sinh viên:{" "}
                      <span className="font-medium">
                        {analysisData.student_info?.name || "N/A"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Ngày hoàn thành:{" "}
                      <span className="font-medium">
                        {analysisData.quiz_info?.completion_date
                          ? new Date(
                              analysisData.quiz_info.completion_date
                            ).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Phần 1: Tổng quan kết quả (At a Glance) */}
      <PerformanceOverview analysisData={analysisData} />

      {/* Phần 2: Radar Chart - Phân tích trực quan với 3 lớp lồng nhau */}
      <ChapterRadarChart quizId={quizId} quizName={quizName} />

      {/* Phần 3: Phân tích chi tiết (Detailed Breakdown) */}
      <ChapterAnalysisTabs analysisData={analysisData} />

      {/* Phần 4: Gợi ý và Lộ trình cải thiện (Actionable Insights) */}
      <StudyPlanRecommendations analysisData={analysisData} />
    </div>
  );
}
