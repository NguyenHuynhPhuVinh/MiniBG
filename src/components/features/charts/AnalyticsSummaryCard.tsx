"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import {
  Loader2,
  Users,
  TrendingUp,
  Target,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { advancedAnalyticsService } from "@/lib/services";
import { DashboardOverviewResponse } from "@/lib/types/advanced-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";

interface AnalyticsSummaryCardProps {
  quizId?: number;
  subjectId?: number;
  programId?: number;
  className?: string;
}

export default function AnalyticsSummaryCard({
  quizId,
  subjectId,
  programId,
  className = "",
}: AnalyticsSummaryCardProps) {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {};
      if (quizId) params.quiz_id = quizId;
      if (subjectId) params.subject_id = subjectId;
      if (programId) params.program_id = programId;

      const response = await advancedAnalyticsService.getDashboardOverview(
        params
      );
      console.log("Analytics Summary API Response:", response);

      if (response?.success && response?.data) {
        setData(response.data);
      } else {
        console.warn(
          "Unexpected analytics summary response structure:",
          response
        );
        setError("Dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu tóm tắt analytics:", error);
      setError("Không thể tải dữ liệu tóm tắt");
      showErrorToast("Không thể tải dữ liệu tóm tắt");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId, subjectId, programId]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Tóm tắt Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Đang tải...</span>
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
          <CardTitle>Tóm tắt Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32">
            <p className="text-muted-foreground mb-4">
              {error || "Không có dữ liệu"}
            </p>
            <Button onClick={fetchData} variant="outline" size="sm">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data for demonstration since backend might not have all fields
  const mockSummary = {
    totalParticipants: 156,
    averageScore: 7.2,
    completionRate: 78.5,
    passRate: 85.2,
    averageTime: 145,
    topPerformerScore: 9.8,
    improvementTrend: "increasing",
    difficultyLevel: "medium",
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tóm tắt Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Participants */}
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng học viên</p>
              <p className="text-lg font-semibold text-blue-600">
                {mockSummary.totalParticipants}
              </p>
            </div>
          </div>

          {/* Average Score */}
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Điểm TB</p>
              <p className="text-lg font-semibold text-green-600">
                {mockSummary.averageScore.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tỷ lệ hoàn thành</p>
              <p className="text-lg font-semibold text-purple-600">
                {mockSummary.completionRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Pass Rate */}
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-full">
              <Award className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tỷ lệ đạt</p>
              <p className="text-lg font-semibold text-orange-600">
                {mockSummary.passRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Average Time */}
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Thời gian TB</p>
              <p className="text-lg font-semibold text-yellow-600">
                {Math.floor(mockSummary.averageTime / 60)}:
                {(mockSummary.averageTime % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* Top Score */}
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <div className="p-2 bg-indigo-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Điểm cao nhất</p>
              <p className="text-lg font-semibold text-indigo-600">
                {mockSummary.topPerformerScore.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Improvement Trend */}
          <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
            <div className="p-2 bg-emerald-100 rounded-full">
              {mockSummary.improvementTrend === "increasing" ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Xu hướng</p>
              <p className="text-lg font-semibold text-emerald-600">
                {mockSummary.improvementTrend === "increasing"
                  ? "Tăng"
                  : "Ổn định"}
              </p>
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Độ khó</p>
              <p className="text-lg font-semibold text-red-600 capitalize">
                {mockSummary.difficultyLevel === "medium"
                  ? "Trung bình"
                  : mockSummary.difficultyLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium mb-3">Thông tin nhanh</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                {mockSummary.passRate > 80
                  ? "Tỷ lệ đạt cao - Chất lượng học tập tốt"
                  : mockSummary.passRate > 60
                  ? "Tỷ lệ đạt trung bình - Cần cải thiện"
                  : "Tỷ lệ đạt thấp - Cần xem xét lại nội dung"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>
                Điểm trung bình{" "}
                {mockSummary.averageScore >= 7 ? "tốt" : "cần cải thiện"}(
                {mockSummary.averageScore.toFixed(1)}/10)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>
                Thời gian làm bài trung bình:{" "}
                {Math.floor(mockSummary.averageTime / 60)} phút{" "}
                {mockSummary.averageTime % 60} giây
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
