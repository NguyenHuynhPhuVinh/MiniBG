"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import {
  Target,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  BarChart3,
} from "lucide-react";
import { ChapterAnalysisData } from "@/lib/types/chapter-analytics";

interface PerformanceOverviewProps {
  analysisData: ChapterAnalysisData;
  className?: string;
}

const PerformanceOverview = React.memo(function PerformanceOverview({
  analysisData,
  className = "",
}: PerformanceOverviewProps) {
  // Memoize calculations
  const performanceMetrics = useMemo(() => {
    const performance = analysisData.overall_performance;
    if (!performance) return null;

    // Calculate performance level and color
    const getPerformanceLevel = (score: number) => {
      if (score >= 9)
        return {
          label: "Xuất sắc",
          color: "bg-green-500",
          textColor: "text-green-600",
        };
      if (score >= 8)
        return {
          label: "Giỏi",
          color: "bg-blue-500",
          textColor: "text-blue-600",
        };
      if (score >= 6.5)
        return {
          label: "Khá",
          color: "bg-yellow-500",
          textColor: "text-yellow-600",
        };
      if (score >= 5)
        return {
          label: "Trung bình",
          color: "bg-orange-500",
          textColor: "text-orange-600",
        };
      return {
        label: "Cần cải thiện",
        color: "bg-red-500",
        textColor: "text-red-600",
      };
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

    // Get motivational message based on performance
    const getMotivationalMessage = (accuracy: number): string => {
      if (accuracy >= 90) {
        return "🎉 Xuất sắc! Bạn đã thể hiện sự hiểu biết sâu sắc về kiến thức. Hãy tiếp tục duy trì phong độ này!";
      } else if (accuracy >= 70) {
        return "👍 Tốt lắm! Bạn đã nắm vững phần lớn kiến thức. Hãy tập trung vào những điểm còn thiếu để đạt kết quả hoàn hảo!";
      } else if (accuracy >= 50) {
        return "💪 Bạn đã có nền tảng tốt! Hãy ôn tập thêm những phần còn yếu để nâng cao kết quả.";
      } else {
        return "🌟 Hành trình vạn dặm bắt đầu từ một bước chân. Hãy bắt đầu củng cố từ những kiến thức cốt lõi nhất!";
      }
    };

    const formatAvgTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      }
      return `${secs}s`;
    };

    const level = getPerformanceLevel(performance.final_score);
    const progressPercentage = (performance.final_score / 10) * 100;

    return {
      score: performance.final_score,
      accuracy: performance.accuracy_percentage,
      correctAnswers: performance.correct_answers,
      totalQuestions: performance.total_questions_answered,
      totalTime: formatTime(performance.total_time_spent_seconds),
      avgTime: formatAvgTime(performance.average_time_per_question_seconds),
      level,
      progressPercentage,
      getMotivationalMessage,
    };
  }, [analysisData.overall_performance]);

  if (!performanceMetrics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Không có dữ liệu hiệu suất</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Tổng quan kết quả
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Hiệu suất tổng thể của bạn trong bài kiểm tra
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Circular Progress Score */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg
              className="w-32 h-32 transform -rotate-90"
              viewBox="0 0 120 120"
            >
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${
                  2 *
                  Math.PI *
                  50 *
                  (1 - performanceMetrics.progressPercentage / 100)
                }`}
                className={performanceMetrics.level.textColor}
                strokeLinecap="round"
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">
                {performanceMetrics.score.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">/10</span>
            </div>
          </div>

          {/* Performance Details */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`px-3 py-1 text-sm font-medium ${performanceMetrics.level.textColor} border-current`}
              >
                {performanceMetrics.level.label}
              </Badge>
              <span className="text-lg font-semibold">
                {performanceMetrics.accuracy}% độ chính xác
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <span className="font-medium">
                    {performanceMetrics.correctAnswers}
                  </span>
                  /{performanceMetrics.totalQuestions} câu đúng
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  Thời gian:{" "}
                  <span className="font-medium">
                    {performanceMetrics.totalTime}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="text-sm">
                  Tốc độ TB:{" "}
                  <span className="font-medium">
                    {performanceMetrics.avgTime}/câu
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            {performanceMetrics?.getMotivationalMessage(
              performanceMetrics.accuracy
            ) || "Hãy tiếp tục cố gắng!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export default PerformanceOverview;
