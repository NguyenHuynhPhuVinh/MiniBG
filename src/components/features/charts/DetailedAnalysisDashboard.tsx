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
  Target,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Users,
  Award,
  Clock,
  FileText,
  PlayCircle,
  PenTool,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { subjectService } from "@/lib/services/api/subject.service";
import { ComprehensiveAnalysisData } from "@/lib/types/chapter-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface DetailedAnalysisDashboardProps {
  className?: string;
  data: ComprehensiveAnalysisData;
}

export default function DetailedAnalysisDashboard({
  className = "",
  data,
}: DetailedAnalysisDashboardProps) {
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

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} phút`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chi tiết theo chương - Gộp thành thạo + tiến độ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Chi tiết theo Chương - Thành thạo & Tiến độ
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Kết hợp mức độ thành thạo (từ kết quả quiz) và tiến độ hoàn thành
            (so với mục tiêu)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.chapter_completion_chart.chart_data.map((chapter) => {
              // Tìm chapter analysis tương ứng
              const chapterAnalysis = [
                ...data.chapter_analysis.strengths,
                ...data.chapter_analysis.weaknesses,
                ...data.chapter_analysis.neutral,
              ].find((c) => c.chapter_id === chapter.chapter_id);

              return (
                <div
                  key={chapter.chapter_id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {chapter.chapter_name}
                    </h3>
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
                        ? "Đạt mục tiêu"
                        : chapter.status === "in_progress"
                        ? "Đang tiến bộ"
                        : "Cần chú ý"}
                    </Badge>
                  </div>

                  {/* Dual Progress Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tiến độ hoàn thành */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-blue-700">
                          Tiến độ hoàn thành (so với mục tiêu{" "}
                          {data.chapter_completion_chart.target_line}%)
                        </span>
                        <span className="font-medium">
                          {chapter.completion_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={chapter.completion_percentage}
                        className="h-3"
                      />
                      <div className="text-xs text-muted-foreground">
                        {chapter.gap_to_target > 0 ? (
                          <span className="text-red-600">
                            Còn thiếu {chapter.gap_to_target.toFixed(1)}% để đạt
                            mục tiêu
                          </span>
                        ) : (
                          <span className="text-green-600">
                            Đã vượt mục tiêu{" "}
                            {Math.abs(chapter.gap_to_target).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mức độ thành thạo từ quiz */}
                    {chapterAnalysis && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-green-700">
                            Mức độ thành thạo (kết quả quiz)
                          </span>
                          <span className="font-medium">
                            {chapterAnalysis.accuracy_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={chapterAnalysis.accuracy_percentage}
                          className="h-3"
                        />
                        <div className="text-xs text-muted-foreground">
                          {chapterAnalysis.correct_answers}/
                          {chapterAnalysis.total_questions} câu đúng • Thời gian
                          TB:{" "}
                          {formatTime(
                            chapterAnalysis.average_time_per_question
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sections và LO liên quan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sections */}
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="text-sm font-medium mb-2">
                        Nội dung có sẵn:
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
                            <span>{section.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="text-sm font-medium mb-2">
                        Learning Outcomes liên quan:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {chapter.related_los.map((lo, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {lo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* So sánh với lớp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Thống kê Tổng quan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.chapter_analysis.achievement_summary.achieved_chapters}
              </div>
              <div className="text-sm text-blue-700">Chương đạt mục tiêu</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.chapter_analysis.achievement_summary.in_progress_chapters}
              </div>
              <div className="text-sm text-green-700">Chương đang học</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {
                  data.chapter_analysis.achievement_summary
                    .needs_attention_chapters
                }
              </div>
              <div className="text-sm text-amber-700">Chương cần chú ý</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {data.chapter_analysis.achievement_summary.total_chapters}
              </div>
              <div className="text-sm text-gray-700">Tổng số chương</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lịch sử Quiz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Lịch sử Quiz đã làm
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.quiz_breakdown.length > 0 ? (
            <div className="space-y-3">
              {data.quiz_breakdown.map((quiz) => (
                <div
                  key={quiz.quiz_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{quiz.quiz_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(quiz.completion_date).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {typeof quiz.score === "number"
                        ? quiz.score.toFixed(1)
                        : quiz.score}
                    </div>
                    <Badge
                      className={
                        quiz.status === "completed"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {quiz.status === "completed" ? "Hoàn thành" : "Đang làm"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Chưa có quiz nào được hoàn thành
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
