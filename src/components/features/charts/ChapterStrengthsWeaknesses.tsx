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
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Target,
  BookOpen,
} from "lucide-react";
import { ChapterAnalysisData } from "@/lib/types/chapter-analytics";

interface ChapterStrengthsWeaknessesProps {
  analysisData: ChapterAnalysisData;
  className?: string;
}

const ChapterStrengthsWeaknesses = React.memo(
  function ChapterStrengthsWeaknesses({
    analysisData,
    className = "",
  }: ChapterStrengthsWeaknessesProps) {
    // Memoize calculations để tránh re-compute không cần thiết
    const {
      overallStrengths,
      overallWeaknesses,
      uniqueStrengths,
      uniqueWeaknesses,
      strongChapters,
      weakChapters,
      averageChapters,
    } = useMemo(() => {
      if (!analysisData.chapter_analysis) {
        return {
          overallStrengths: [],
          overallWeaknesses: [],
          uniqueStrengths: [],
          uniqueWeaknesses: [],
          strongChapters: [],
          weakChapters: [],
          averageChapters: [],
        };
      }

      // Strengths từ chapter_analysis.strengths
      const strengthChapters = analysisData.chapter_analysis.strengths || [];
      const weaknessChapters = analysisData.chapter_analysis.weaknesses || [];

      // Tạo unique strengths và weaknesses từ chapter names
      const strengths = strengthChapters.map(
        (ch) =>
          `Thành thạo ${ch.chapter_name} (${ch.accuracy_percentage.toFixed(
            1
          )}%)`
      );
      const weaknesses = weaknessChapters.map(
        (ch) =>
          `Cần cải thiện ${ch.chapter_name} (${ch.accuracy_percentage.toFixed(
            1
          )}%)`
      );

      return {
        overallStrengths: strengths,
        overallWeaknesses: weaknesses,
        uniqueStrengths: strengths.slice(0, 5),
        uniqueWeaknesses: weaknesses.slice(0, 5),
        strongChapters: strengthChapters,
        weakChapters: weaknessChapters,
        averageChapters: [], // API không có data này
      };
    }, [analysisData.chapter_analysis]);

    const getPerformanceColor = (score: number) => {
      if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
      if (score >= 6.5) return "text-blue-600 bg-blue-50 border-blue-200";
      return "text-red-600 bg-red-50 border-red-200";
    };

    const getPerformanceIcon = (score: number) => {
      if (score >= 8) return <TrendingUp className="h-4 w-4" />;
      if (score >= 6.5) return <Target className="h-4 w-4" />;
      return <TrendingDown className="h-4 w-4" />;
    };

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Phân tích điểm mạnh và điểm yếu theo chương
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tổng quan về hiệu suất học tập của bạn qua các chương
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Chương mạnh
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {strongChapters.length}
              </div>
              <p className="text-xs text-green-600 mt-1">≥ 80% độ chính xác</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  Chương khá
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {averageChapters.length}
              </div>
              <p className="text-xs text-blue-600 mt-1">60-79% độ chính xác</p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  Cần cải thiện
                </span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {weakChapters.length}
              </div>
              <p className="text-xs text-red-600 mt-1">&lt; 60% độ chính xác</p>
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Điểm mạnh
              </h3>
              {uniqueStrengths.length > 0 ? (
                <div className="space-y-3">
                  {uniqueStrengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-700">{strength}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Chưa có dữ liệu điểm mạnh cụ thể
                </p>
              )}
            </div>

            {/* Weaknesses */}
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Điểm yếu cần cải thiện
              </h3>
              {uniqueWeaknesses.length > 0 ? (
                <div className="space-y-3">
                  {uniqueWeaknesses.map((weakness, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-700">{weakness}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Chưa có dữ liệu điểm yếu cụ thể
                </p>
              )}
            </div>
          </div>

          {/* Chapter Performance Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Chi tiết hiệu suất theo chương
            </h3>
            <div className="space-y-3">
              {[
                ...(analysisData.chapter_analysis?.strengths || []),
                ...(analysisData.chapter_analysis?.weaknesses || []),
              ].map((chapter) => (
                <div
                  key={chapter.chapter_id}
                  className={`p-4 rounded-lg border ${getPerformanceColor(
                    chapter.accuracy_percentage / 10
                  )}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getPerformanceIcon(chapter.accuracy_percentage / 10)}
                      <h4 className="font-medium">{chapter.chapter_name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {chapter.accuracy_percentage.toFixed(1)}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {chapter.related_los?.length || 0} LOs
                      </Badge>
                    </div>
                  </div>

                  {/* Related LOs */}
                  {chapter.related_los && chapter.related_los.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-blue-600 mb-2">
                        Learning Outcomes liên quan:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(chapter.related_los || [])
                          .slice(0, 3)
                          .map((lo, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                            >
                              {lo}
                            </span>
                          ))}
                        {(chapter.related_los || []).length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            +{(chapter.related_los || []).length - 3} khác
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

export default ChapterStrengthsWeaknesses;
