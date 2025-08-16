"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
// import { Bar } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { BookOpen, BarChart3 } from "lucide-react";
import { ChapterAnalysisData } from "@/lib/types/chapter-analytics";
import LearningOutcomeBubbleChart from "./LearningOutcomeBubbleChart";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChapterAnalysisTabsProps {
  analysisData: ChapterAnalysisData;
  className?: string;
}

const ChapterAnalysisTabs = React.memo(function ChapterAnalysisTabs({
  analysisData,
  className = "",
}: ChapterAnalysisTabsProps) {
  // Helper to detect if we have NEW API data
  const hasNewAPIData = useMemo(() => {
    return !!(
      analysisData.learning_outcome_analysis?.strengths?.length ||
      analysisData.learning_outcome_analysis?.weaknesses?.length
    );
  }, [analysisData.learning_outcome_analysis]);

  // Unified mapping data combining Learning Outcomes, Difficulty, and Chapter
  const unifiedMappingData = useMemo(() => {
    const mappings: Array<{
      id: string;
      type: "learning_outcome" | "difficulty" | "chapter";
      name: string;
      full_name?: string;
      accuracy: number;
      performance_level: string;
      total_questions: number;
      correct_answers: number;
      related_info?: any;
    }> = [];

    // Add Learning Outcomes
    if (hasNewAPIData && analysisData.learning_outcome_analysis) {
      const allLOs = [
        ...(analysisData.learning_outcome_analysis.strengths || []),
        ...(analysisData.learning_outcome_analysis.weaknesses || []),
      ];
      allLOs.forEach((lo) => {
        mappings.push({
          id: `lo_${lo.lo_id}`,
          type: "learning_outcome",
          name: lo.lo_name || `LO${lo.lo_id}`,
          full_name: `${lo.lo_name || `LO${lo.lo_id}`} - ${
            lo.lo_description || lo.lo_name || "Learning Outcome"
          }`,
          accuracy: lo.accuracy_percentage,
          performance_level: lo.performance_level,
          total_questions: lo.total_questions,
          correct_answers: lo.correct_answers,
          related_info: lo,
        });
      });
    }

    // Add Difficulty Levels
    if (hasNewAPIData && analysisData.difficulty_analysis) {
      const allDifficulties = [
        ...(analysisData.difficulty_analysis.strengths || []),
        ...(analysisData.difficulty_analysis.weaknesses || []),
      ];
      allDifficulties.forEach((diff) => {
        mappings.push({
          id: `diff_${diff.level_id}`,
          type: "difficulty",
          name: `Độ khó: ${diff.level_name}`,
          accuracy: diff.accuracy_percentage,
          performance_level: diff.performance_level,
          total_questions: diff.total_questions,
          correct_answers: diff.correct_answers,
          related_info: diff,
        });
      });
    }

    // Add Chapters (fallback or additional)
    if (analysisData.chapter_analysis) {
      const allChapters = [
        ...(analysisData.chapter_analysis.strengths || []),
        ...(analysisData.chapter_analysis.weaknesses || []),
      ];
      allChapters.forEach((chapter) => {
        mappings.push({
          id: `chapter_${chapter.chapter_id}`,
          type: "chapter",
          name: `Chương: ${chapter.chapter_name}`,
          accuracy: chapter.accuracy_percentage,
          performance_level: chapter.performance_level || "average",
          total_questions: chapter.total_questions,
          correct_answers: chapter.correct_answers,
          related_info: chapter,
        });
      });
    }

    return mappings.sort((a, b) => b.accuracy - a.accuracy);
  }, [hasNewAPIData, analysisData]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Phân tích chi tiết
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Xem chi tiết hiệu suất theo từng khía cạnh
        </p>
      </CardHeader>

      <CardContent>
        <div className="w-full space-y-6">
          {/* Bubble Chart - Advanced 4D Visualization */}
          <LearningOutcomeBubbleChart
            analysisData={analysisData}
            className="mb-6"
          />

          {/* No data message */}
          {unifiedMappingData.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có dữ liệu phân tích
              </h3>
              <p className="text-gray-600">
                Chưa có dữ liệu Learning Outcomes, Độ khó hoặc Chương để hiển
                thị.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default ChapterAnalysisTabs;
