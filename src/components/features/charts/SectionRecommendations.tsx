"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import {
  BookOpen,
  Video,
  FileText,
  PenTool,
  AlertCircle,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import {
  ChapterAnalysisData,
  SectionRecommendation,
  ContentType,
} from "@/lib/types/chapter-analytics";

interface SectionRecommendationsProps {
  analysisData: ChapterAnalysisData;
  className?: string;
}

const SectionRecommendations = React.memo(function SectionRecommendations({
  analysisData,
  className = "",
}: SectionRecommendationsProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const toggleChapterExpansion = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const getContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "exercise":
        return <PenTool className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (contentType: ContentType) => {
    switch (contentType) {
      case "video":
        return "Video bài giảng";
      case "text":
        return "Tài liệu lý thuyết";
      case "exercise":
        return "Bài tập thực hành";
      default:
        return "Nội dung học tập";
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
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

  // Memoize calculations để tránh re-compute không cần thiết
  const {
    allRecommendations,
    sortedRecommendations,
    overallRecommendations,
    nextStudySuggestions,
  } = useMemo(() => {
    // Tạo recommendations từ improvement_suggestions
    const recommendations: SectionRecommendation[] = [];

    // Từ priority_areas tạo high priority recommendations
    if (analysisData.improvement_suggestions?.priority_areas) {
      analysisData.improvement_suggestions.priority_areas.forEach(
        (area, index) => {
          // Handle both string and object cases
          const areaText =
            typeof area === "string"
              ? area
              : (area as any)?.chapter_name ||
                (area as any)?.name ||
                (area as any)?.title ||
                JSON.stringify(area);
          recommendations.push({
            section_id: index,
            section_name: areaText,
            content_type: "text" as ContentType,
            mastery_level: 0.3,
            recommendation: `Cần tập trung ôn tập: ${areaText}`,
            priority: "high" as const,
            estimated_study_time: 60,
          });
        }
      );
    }

    // Từ recommended_chapters tạo medium priority recommendations
    if (analysisData.improvement_suggestions?.recommended_chapters) {
      analysisData.improvement_suggestions.recommended_chapters.forEach(
        (chapter, index) => {
          // Handle both string and object cases
          const chapterText =
            typeof chapter === "string"
              ? chapter
              : chapter?.chapter_name ||
                (chapter as any)?.name ||
                (chapter as any)?.title ||
                JSON.stringify(chapter);
          recommendations.push({
            section_id: 1000 + index,
            section_name: chapterText,
            content_type: "text" as ContentType,
            mastery_level: 0.5,
            recommendation: `Nên ôn tập chương: ${chapterText}`,
            priority: "medium" as const,
            estimated_study_time: 45,
          });
        }
      );
    }

    const sorted = [...recommendations].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return {
      allRecommendations: recommendations,
      sortedRecommendations: sorted,
      overallRecommendations: recommendations, // Sử dụng cùng data
      nextStudySuggestions:
        analysisData.improvement_suggestions?.study_plan || [],
    };
  }, [analysisData.improvement_suggestions]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Gợi ý ôn tập và cải thiện
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Các section và nội dung cụ thể cần tập trung ôn tập
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Priority Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                Ưu tiên cao
              </span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {
                sortedRecommendations.filter((r) => r.priority === "high")
                  .length
              }
            </div>
            <p className="text-xs text-red-600 mt-1">Cần ôn ngay</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">
                Ưu tiên trung bình
              </span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {
                sortedRecommendations.filter((r) => r.priority === "medium")
                  .length
              }
            </div>
            <p className="text-xs text-yellow-600 mt-1">Ôn trong tuần</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Ưu tiên thấp
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {sortedRecommendations.filter((r) => r.priority === "low").length}
            </div>
            <p className="text-xs text-blue-600 mt-1">Ôn khi có thời gian</p>
          </div>
        </div>

        {/* Overall Recommendations */}
        {overallRecommendations && overallRecommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Gợi ý tổng quan</h3>
            <div className="space-y-3">
              {overallRecommendations
                .slice(0, showAllRecommendations ? undefined : 3)
                .map((recommendation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getPriorityColor(
                      recommendation.priority
                    )}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getContentTypeIcon(recommendation.content_type)}
                          <span className="font-medium text-sm">
                            {getContentTypeLabel(recommendation.content_type)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getPriorityLabel(recommendation.priority)}
                          </Badge>
                        </div>
                        <p className="text-sm">
                          {recommendation.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {overallRecommendations.length > 3 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setShowAllRecommendations(!showAllRecommendations)
                  }
                >
                  {showAllRecommendations ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Ẩn bớt
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Xem thêm ({overallRecommendations.length - 3} gợi ý)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Next Study Suggestions */}
        {nextStudySuggestions && nextStudySuggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Kế hoạch học tập tiếp theo
            </h3>
            <div className="space-y-3">
              {nextStudySuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-blue-200 bg-blue-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{suggestion.phase}</h4>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">Tập trung: {suggestion.focus}</p>
                    {suggestion.activities &&
                      suggestion.activities.length > 0 && (
                        <ul className="list-disc list-inside space-y-1">
                          {suggestion.activities.map((activity, actIndex) => (
                            <li key={actIndex}>{activity}</li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Insights */}
        {analysisData.learning_insights && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Nhận xét học tập</h3>
            <div className="space-y-4">
              {analysisData.learning_insights.what_you_did_well && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-600 mb-2">
                    Điểm làm tốt
                  </h4>
                  <p className="text-sm text-green-700">
                    {analysisData.learning_insights.what_you_did_well}
                  </p>
                </div>
              )}

              {analysisData.learning_insights.areas_for_improvement && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-600 mb-2">
                    Cần cải thiện
                  </h4>
                  <p className="text-sm text-yellow-700">
                    {analysisData.learning_insights.areas_for_improvement}
                  </p>
                </div>
              )}

              {analysisData.learning_insights.next_steps && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-600 mb-2">
                    Bước tiếp theo
                  </h4>
                  <p className="text-sm text-blue-700">
                    {analysisData.learning_insights.next_steps}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default SectionRecommendations;
