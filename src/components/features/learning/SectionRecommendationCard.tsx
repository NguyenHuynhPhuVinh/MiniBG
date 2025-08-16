"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  Lightbulb,
  BookOpen,
  PlayCircle,
  PenTool,
  Target,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { subjectService } from "@/lib/services/api/subject.service";
import { ComprehensiveAnalysisData } from "@/lib/types/chapter-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface SectionRecommendationCardProps {
  className?: string;
  data: ComprehensiveAnalysisData;
}

// Define recommendation data structure
interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  content_type: "text" | "video" | "exercise";
  priority: "high" | "medium" | "low";
  estimated_improvement: number;
  estimated_time: number; // in minutes
  chapter_name: string;
  reason: string;
}

export default function SectionRecommendationCard({
  className = "",
  data,
}: SectionRecommendationCardProps) {
  const [expandedReasons, setExpandedReasons] = useState<Set<string>>(
    new Set()
  );

  const toggleReason = (id: string) => {
    setExpandedReasons((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  };
  // Transform comprehensive analysis data to recommendations
  const transformToRecommendations = (
    analysisData: ComprehensiveAnalysisData
  ): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = [];

    // Generate recommendations from improvement suggestions
    analysisData.improvement_suggestions.priority_areas.forEach(
      (area, index) => {
        const contentTypes: Array<"text" | "video" | "exercise"> = [
          "text",
          "video",
          "exercise",
        ];

        contentTypes.forEach((contentType, typeIndex) => {
          const priority =
            index === 0 ? "high" : index === 1 ? "medium" : "low";

          recommendations.push({
            id: `priority-${index}-${typeIndex}`, // Stable ID
            title: getRecommendationTitle(contentType, area),
            description: getRecommendationDescription(contentType, area),
            content_type: contentType,
            priority: priority as "high" | "medium" | "low",
            estimated_improvement: 10 + index * 3 + typeIndex, // Stable improvement percentage
            estimated_time: getEstimatedTime(contentType),
            chapter_name: area,
            reason: area,
          });
        });
      }
    );

    // Add recommendations from study recommendations
    analysisData.learning_insights.study_recommendations.forEach(
      (rec, index) => {
        if (rec.priority !== "none") {
          recommendations.push({
            id: `study-rec-${index}`, // Stable ID
            title: `Ôn tập: ${rec.chapter_name}`,
            description: rec.note,
            content_type: "text",
            priority: rec.priority as "high" | "medium" | "low",
            estimated_improvement:
              rec.current_accuracy > 0 ? 100 - rec.current_accuracy : 15,
            estimated_time: 25,
            chapter_name: rec.chapter_name,
            reason: rec.note,
          });
        }
      }
    );

    // Sort by priority and estimated improvement
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.estimated_improvement - a.estimated_improvement;
      })
      .slice(0, 6); // Limit to top 6 recommendations
  };

  // Helper functions
  const getRecommendationTitle = (
    contentType: string,
    chapterName: string
  ): string => {
    switch (contentType) {
      case "text":
        return `Đọc lý thuyết: ${chapterName}`;
      case "video":
        return `Xem video: ${chapterName}`;
      case "exercise":
        return `Làm bài tập: ${chapterName}`;
      default:
        return `Học: ${chapterName}`;
    }
  };

  const getRecommendationDescription = (
    contentType: string,
    reason: string
  ): string => {
    const baseDesc = reason || "Cải thiện hiểu biết về chương này";
    switch (contentType) {
      case "text":
        return `Đọc kỹ tài liệu lý thuyết để ${baseDesc.toLowerCase()}`;
      case "video":
        return `Xem video hướng dẫn để ${baseDesc.toLowerCase()}`;
      case "exercise":
        return `Thực hành bài tập để ${baseDesc.toLowerCase()}`;
      default:
        return baseDesc;
    }
  };

  const getEstimatedTime = (contentType: string): number => {
    switch (contentType) {
      case "text":
        return 15;
      case "video":
        return 20;
      case "exercise":
        return 30;
      default:
        return 20;
    }
  };

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

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get priority text
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Ưu tiên cao";
      case "medium":
        return "Ưu tiên trung bình";
      case "low":
        return "Ưu tiên thấp";
      default:
        return "Không xác định";
    }
  };

  // No data state
  if (
    !data ||
    (!data.improvement_suggestions.priority_areas.length &&
      !data.learning_insights.study_recommendations.some(
        (rec) => rec.priority !== "none"
      ))
  ) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-600" />
            Gợi ý Cải thiện
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-green-600 font-medium mb-2">Xuất sắc!</p>
            <p className="text-muted-foreground">
              Bạn đã hoàn thành tốt tất cả các chương. Không có gợi ý cải thiện
              nào.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data - memoized to prevent re-calculation on every render
  const recommendations = useMemo(
    () => transformToRecommendations(data),
    [data]
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-amber-600" />
          Gợi ý Cải thiện
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Các hoạt động được đề xuất để nâng cao kết quả học tập
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              {recommendations.length} gợi ý được tạo
            </span>
          </div>
          <p className="text-sm text-amber-700">
            Thực hiện theo thứ tự ưu tiên để đạt hiệu quả tối ưu.
          </p>
        </div>

        {/* Recommendations List */}
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div
              key={recommendation.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  <h4 className="font-medium text-base">
                    {recommendation.title}
                  </h4>
                </div>
                <Badge className={getPriorityColor(recommendation.priority)}>
                  {getPriorityText(recommendation.priority)}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {recommendation.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    {getContentTypeIcon(recommendation.content_type)}
                    <span>
                      {getContentTypeLabel(recommendation.content_type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{recommendation.estimated_time} phút</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>+{recommendation.estimated_improvement}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Bắt đầu
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`text-xs p-1 h-6 w-6 ${
                      expandedReasons.has(recommendation.id)
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => toggleReason(recommendation.id)}
                    title={
                      expandedReasons.has(recommendation.id)
                        ? "Ẩn lý do"
                        : "Xem lý do"
                    }
                  >
                    {expandedReasons.has(recommendation.id) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <HelpCircle className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Reason - Collapsible */}
              {expandedReasons.has(recommendation.id) && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <strong>Lý do:</strong> {recommendation.reason}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Study Plan Summary */}
        {data.improvement_suggestions.study_plan.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
              <Star className="h-5 w-5 text-blue-600" />
              Kế hoạch Học tập
            </h3>
            <div className="space-y-2">
              {data.improvement_suggestions.study_plan
                .slice(0, 3)
                .map((phase, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-blue-700 mb-1">
                      {phase.phase}
                    </div>
                    <div className="text-blue-600 text-xs">
                      {phase.focus}: {phase.activities.slice(0, 2).join(", ")}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
