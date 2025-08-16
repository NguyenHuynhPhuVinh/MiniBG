"use client";

import React, { useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import {
  Lightbulb,
  Target,
  Calendar,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Star,
} from "lucide-react";
import {
  ChapterAnalysisData,
  EnhancedPriorityArea,
  EnhancedImprovementSuggestions,
  LearningStrategy,
  PriorityLevel,
} from "@/lib/types/chapter-analytics";

interface StudyPlanRecommendationsProps {
  analysisData: ChapterAnalysisData;
  className?: string;
}

const StudyPlanRecommendations = React.memo(function StudyPlanRecommendations({
  analysisData,
  className = "",
}: StudyPlanRecommendationsProps) {
  // Helper function to detect if we have enhanced API data
  const isEnhancedAPI = useMemo(() => {
    const suggestions = analysisData.improvement_suggestions;
    return (
      suggestions &&
      "priority_areas" in suggestions &&
      Array.isArray(suggestions.priority_areas) &&
      suggestions.priority_areas.length > 0 &&
      typeof suggestions.priority_areas[0] === "object" &&
      "type" in suggestions.priority_areas[0]
    );
  }, [analysisData.improvement_suggestions]);

  // Helper function to get priority color for enhanced API
  const getEnhancedPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case "critical":
        return "text-red-700 bg-red-100 border-red-300";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getEnhancedPriorityIcon = (priority: PriorityLevel) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-700" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "medium":
        return <Target className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
  };

  const getEnhancedPriorityLabel = (priority: PriorityLevel) => {
    switch (priority) {
      case "critical":
        return "Nghiêm trọng";
      case "high":
        return "Ưu tiên cao";
      case "medium":
        return "Ưu tiên trung bình";
      case "low":
        return "Ưu tiên thấp";
    }
  };

  // Define unified focus area type
  type FocusArea = {
    type: string;
    id: number;
    name: string;
    current_accuracy: number;
    target_accuracy?: number;
    improvement_needed?: number;
    priority: PriorityLevel | "high" | "medium" | "low";
    note: string;
  };

  // Memoize focus areas calculation with enhanced API support
  const focusAreas = useMemo((): FocusArea[] => {
    // If we have enhanced API data, use priority areas from API
    if (isEnhancedAPI) {
      const suggestions =
        analysisData.improvement_suggestions as EnhancedImprovementSuggestions;
      return suggestions.priority_areas.map((area) => ({
        type: area.type,
        id: area.lo_id || area.level_id || 0,
        name: area.lo_name || area.level_name || "Unknown",
        current_accuracy: area.current_accuracy,
        target_accuracy: area.target_accuracy,
        improvement_needed: area.improvement_needed,
        priority: area.priority_level,
        note: `Cần cải thiện từ ${area.current_accuracy.toFixed(1)}% lên ${
          area.target_accuracy
        }% (cần cải thiện thêm ${area.improvement_needed.toFixed(1)}%)`,
      }));
    }

    // Fallback to legacy chapter analysis
    if (!analysisData.chapter_analysis) return [];

    const weakChapters = analysisData.chapter_analysis.weaknesses || [];
    const needsAttention =
      analysisData.chapter_analysis.summary?.chapters_needing_attention || [];

    // Combine weak chapters and chapters needing attention
    const allFocusAreas = [
      ...weakChapters.map((chapter) => ({
        type: "chapter" as const,
        id: chapter.chapter_id,
        name: chapter.chapter_name,
        current_accuracy: chapter.accuracy_percentage,
        target_accuracy: 70,
        improvement_needed: Math.max(0, 70 - chapter.accuracy_percentage),
        note: `Cần cải thiện từ ${chapter.accuracy_percentage.toFixed(
          1
        )}% lên ít nhất 70%`,
        priority:
          chapter.accuracy_percentage < 50
            ? ("high" as const)
            : ("medium" as const),
      })),
      ...needsAttention.map((chapter) => ({
        type: "chapter" as const,
        id: chapter.chapter_id,
        name: chapter.chapter_name,
        current_accuracy: chapter.accuracy,
        target_accuracy: 70,
        improvement_needed: chapter.gap_to_target,
        note: `Cần cải thiện thêm ${chapter.gap_to_target.toFixed(
          1
        )}% để đạt mục tiêu`,
        priority:
          chapter.gap_to_target > 20 ? ("high" as const) : ("medium" as const),
      })),
    ];

    // Deduplicate by id and sort by priority
    const uniqueFocusAreas = allFocusAreas
      .filter(
        (area, index, self) => index === self.findIndex((a) => a.id === area.id)
      )
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    return uniqueFocusAreas;
  }, [
    analysisData.chapter_analysis,
    analysisData.improvement_suggestions,
    isEnhancedAPI,
  ]);

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getPriorityIcon = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Target className="h-4 w-4" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getPriorityLabel = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "Ưu tiên cao";
      case "medium":
        return "Ưu tiên trung bình";
      case "low":
        return "Ưu tiên thấp";
    }
  };

  // Helper function to get overall performance level
  const getOverallPerformanceLevel = useCallback(() => {
    return analysisData.overall_performance?.accuracy_percentage || 0;
  }, [analysisData.overall_performance]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          Lộ trình cải thiện & Gợi ý học tập
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Kế hoạch học tập cá nhân hóa dựa trên kết quả phân tích
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Streamlined Focus Section */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            {getOverallPerformanceLevel() >= 80
              ? "Định hướng nâng cao"
              : "Trọng tâm cải thiện"}
          </h3>

          {/* Motivational Message */}
          <div className="mb-4">
            {getOverallPerformanceLevel() >= 80 ? (
              <p className="text-sm text-orange-800 leading-relaxed font-medium">
                🚀 <span className="font-medium">Định hướng nâng cao:</span> Với
                nền tảng vững chắc, bạn đã sẵn sàng cho các thử thách khó hơn.
                Hãy thử áp dụng kiến thức vào dự án thực tế hoặc tìm hiểu các
                chủ đề liên quan để trở nên xuất sắc hơn nữa!
              </p>
            ) : analysisData.learning_insights?.what_you_did_well &&
              !analysisData.learning_insights.what_you_did_well.includes(
                "Cần cải thiện"
              ) ? (
              <p className="text-sm text-orange-800 leading-relaxed">
                🎯 <span className="font-medium">Điểm mạnh:</span>{" "}
                {analysisData.learning_insights.what_you_did_well}
              </p>
            ) : (
              <p className="text-sm text-orange-800 leading-relaxed font-medium">
                🌟 Hành trình vạn dặm bắt đầu từ một bước chân. Hãy bắt đầu củng
                cố từ những kiến thức cốt lõi nhất!
              </p>
            )}
          </div>
        </div>

        {/* Priority Focus Areas - Integrated */}
        {focusAreas.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Ưu tiên hàng đầu
            </h3>
            <div className="space-y-4">
              {focusAreas.slice(0, 1).map((area) => (
                <div
                  key={area.id}
                  className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                      {area.priority === "critical" ||
                      area.priority === "high" ||
                      area.priority === "medium" ||
                      area.priority === "low"
                        ? getEnhancedPriorityIcon(
                            area.priority as PriorityLevel
                          )
                        : getPriorityIcon(
                            area.priority as "high" | "medium" | "low"
                          )}
                      {area.name}
                    </h4>
                    <Badge
                      variant={
                        area.priority === "critical" || area.priority === "high"
                          ? "destructive"
                          : area.priority === "medium"
                          ? "secondary"
                          : "default"
                      }
                      className={`text-xs ${
                        isEnhancedAPI
                          ? getEnhancedPriorityColor(
                              area.priority as PriorityLevel
                            )
                          : ""
                      }`}
                    >
                      {area.priority === "critical" ||
                      area.priority === "high" ||
                      area.priority === "medium" ||
                      area.priority === "low"
                        ? getEnhancedPriorityLabel(
                            area.priority as PriorityLevel
                          )
                        : getPriorityLabel(
                            area.priority as "high" | "medium" | "low"
                          )}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium text-gray-700">
                        Trạng thái hiện tại:
                      </span>
                      <div className="text-red-600 font-semibold">
                        {area.current_accuracy.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Mục tiêu:
                      </span>
                      <div className="text-green-600 font-semibold">
                        {isEnhancedAPI && "target_accuracy" in area
                          ? `${area.target_accuracy}%`
                          : "Cần cải thiện lên ít nhất 70%"}
                      </div>
                    </div>
                  </div>
                  {area.note && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Ghi chú:</span>{" "}
                        {area.note}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Plan */}
        {analysisData.improvement_suggestions?.study_plan && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Kế hoạch học tập đề xuất
            </h3>
            <div className="space-y-4">
              {analysisData.improvement_suggestions.study_plan.map(
                (phase, index) => (
                  <div key={index} className="relative">
                    {/* Timeline connector */}
                    {index <
                      analysisData.improvement_suggestions.study_plan.length -
                        1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300"></div>
                    )}

                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                        <span className="text-sm font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>

                      {/* Phase content */}
                      <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {phase.phase}
                          </h4>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 font-medium">
                            Tập trung: {phase.focus}
                          </p>

                          {/* Activities from API */}
                          {phase.activities && phase.activities.length > 0 && (
                            <div className="text-sm text-gray-600">
                              {phase.activities.map((activity, actIndex) => (
                                <p key={actIndex}>• {activity}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Learning Strategies - Enhanced with API data */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Chiến lược học tập hiệu quả
          </h3>

          {/* Enhanced API Learning Strategies */}
          {isEnhancedAPI &&
            (
              analysisData.improvement_suggestions as EnhancedImprovementSuggestions
            ).learning_strategies?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-gray-700">
                  Gợi ý cá nhân hóa từ phân tích
                </h4>
                <div className="space-y-3">
                  {(
                    analysisData.improvement_suggestions as EnhancedImprovementSuggestions
                  ).learning_strategies.map((strategy, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-indigo-600" />
                          <span className="font-medium text-indigo-900">
                            {strategy.difficulty_level} (Hiện tại:{" "}
                            {strategy.current_accuracy.toFixed(1)}%)
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-white">
                          <Clock className="h-3 w-3 mr-1" />
                          {strategy.recommended_practice_time}
                        </Badge>
                      </div>
                      <p className="text-sm text-indigo-800 leading-relaxed">
                        {strategy.strategy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Default Learning Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">
                  Học lý thuyết
                </span>
              </div>
              <p className="text-sm text-yellow-800">
                Đọc kỹ tài liệu, ghi chú những điểm quan trọng và tạo sơ đồ tư
                duy
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">Thực hành</span>
              </div>
              <p className="text-sm text-purple-800">
                Làm nhiều bài tập, áp dụng kiến thức vào các tình huống thực tế
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Ôn tập</span>
              </div>
              <p className="text-sm text-green-800">
                Xem lại các câu hỏi đã sai, phân tích lý do và cách giải đúng
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Kiểm tra</span>
              </div>
              <p className="text-sm text-blue-800">
                Tự kiểm tra kiến thức thường xuyên bằng quiz và bài tập
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {analysisData.learning_insights?.next_steps && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Bước tiếp theo
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed mb-3">
              {analysisData.learning_insights.next_steps}
            </p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Bắt đầu học tập
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default StudyPlanRecommendations;
