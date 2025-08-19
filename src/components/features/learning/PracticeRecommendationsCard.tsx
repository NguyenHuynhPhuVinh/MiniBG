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
import {
  AlertTriangle,
  TrendingUp,
  Target,
  BookOpen,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  practiceRecommendationService,
  type PracticeRecommendation,
  type PracticeRecommendationSummary,
} from "@/lib/services/api/practice-recommendation.service";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";

interface PracticeRecommendationsCardProps {
  className?: string;
  userId: number;
  subjectId: number;
  onStartPractice?: (recommendation: PracticeRecommendation) => void;
}

const priorityConfig = {
  urgent: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeVariant: "destructive" as const,
    label: "Khẩn cấp",
  },
  high: {
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeVariant: "secondary" as const,
    label: "Cao",
  },
  medium: {
    icon: Target,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    badgeVariant: "outline" as const,
    label: "Trung bình",
  },
  low: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeVariant: "outline" as const,
    label: "Thấp",
  },
};

const difficultyConfig = {
  easy: { label: "Dễ", color: "text-green-600" },
  medium: { label: "Trung bình", color: "text-yellow-600" },
  hard: { label: "Khó", color: "text-red-600" },
};

// Filter types
type PriorityFilter = "all" | "urgent" | "high" | "medium" | "low";
type DifficultyFilter = "all" | "easy" | "medium" | "hard";
type AccuracyFilter = "all" | "low" | "medium" | "high";

interface FilterState {
  priority: PriorityFilter;
  difficulty: DifficultyFilter;
  accuracy: AccuracyFilter;
  minAttempts: number;
  showOnlyNewQuestions: boolean;
}

export function PracticeRecommendationsCard({
  className,
  userId,
  subjectId,
  onStartPractice,
}: PracticeRecommendationsCardProps) {
  const [recommendations, setRecommendations] = useState<PracticeRecommendation[]>([]);
  const [summary, setSummary] = useState<PracticeRecommendationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingPractice, setStartingPractice] = useState<number | null>(null);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priority: "all",
    difficulty: "all",
    accuracy: "all",
    minAttempts: 0,
    showOnlyNewQuestions: false,
  });

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await practiceRecommendationService.getRecommendations({
        user_id: userId,
        subject_id: subjectId,
      });

      setRecommendations(response.data.recommendations);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching practice recommendations:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải đề xuất luyện tập";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && subjectId) {
      fetchRecommendations();
    }
  }, [userId, subjectId]);

  const handleStartPractice = async (recommendation: PracticeRecommendation) => {
    try {
      setStartingPractice(recommendation.lo_id);

      if (onStartPractice) {
        onStartPractice(recommendation);
      } else {
        // Default behavior - generate practice questions
        const practiceResponse = await practiceRecommendationService.generatePractice({
          user_id: userId,
          subject_id: subjectId,
          lo_id: recommendation.lo_id,
          difficulty: recommendation.difficulty,
          total_questions: 10,
        });

        showSuccessToast(
          `Đã tạo ${practiceResponse.data.total_questions} câu hỏi luyện tập cho ${recommendation.lo_name}`
        );

        // TODO: Navigate to practice quiz page
        console.log("Generated practice:", practiceResponse.data);
      }
    } catch (error) {
      console.error("Error starting practice:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể bắt đầu luyện tập";
      showErrorToast(errorMessage);
    } finally {
      setStartingPractice(null);
    }
  };

  const handleToggleShowAll = () => {
    setShowAllRecommendations(!showAllRecommendations);
  };

  // Filter recommendations based on current filters
  const filteredRecommendations = recommendations.filter((recommendation) => {
    // Priority filter
    if (filters.priority !== "all" && recommendation.priority !== filters.priority) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty !== "all" && recommendation.difficulty !== filters.difficulty) {
      return false;
    }

    // Accuracy filter
    if (filters.accuracy !== "all") {
      const accuracy = recommendation.accuracy || 0;
      switch (filters.accuracy) {
        case "low":
          if (accuracy >= 50) return false;
          break;
        case "medium":
          if (accuracy < 50 || accuracy >= 80) return false;
          break;
        case "high":
          if (accuracy < 80) return false;
          break;
      }
    }

    // Min attempts filter
    if (recommendation.attempts < filters.minAttempts) {
      return false;
    }

    // Show only new questions filter
    if (filters.showOnlyNewQuestions && (recommendation.available_new_questions || 0) === 0) {
      return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilters({
      priority: "all",
      difficulty: "all",
      accuracy: "all",
      minAttempts: 0,
      showOnlyNewQuestions: false,
    });
  };

  const hasActiveFilters =
    filters.priority !== "all" ||
    filters.difficulty !== "all" ||
    filters.accuracy !== "all" ||
    filters.minAttempts > 0 ||
    filters.showOnlyNewQuestions;

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Đang tải đề xuất luyện tập
            </h3>
            <p className="text-muted-foreground text-center">
              Vui lòng chờ trong giây lát...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-muted-foreground mb-4 text-center">{error}</p>
            <Button onClick={fetchRecommendations} variant="outline">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations.length) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Đề xuất Luyện tập
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Chưa có đề xuất luyện tập
            </h3>
            <p className="text-muted-foreground text-center">
              Hoàn thành một số quiz để nhận được đề xuất luyện tập cá nhân hóa
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Đề xuất Luyện tập
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {filteredRecommendations.length}/{recommendations.length}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "transition-all duration-200",
                showFilters && "bg-blue-50 border-blue-200"
              )}
            >
              <Filter className="h-4 w-4" />
              <span className="ml-1">Lọc</span>
            </Button>
          </div>
        </div>

        {summary && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="destructive" className="text-xs">
              Khẩn cấp: {summary.urgent}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Cao: {summary.high}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Trung bình: {summary.medium}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Thấp: {summary.low}
            </Badge>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Bộ lọc</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority Filter */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Mức độ ưu tiên
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as PriorityFilter }))}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                >
                  <option value="all">Tất cả</option>
                  <option value="urgent">Khẩn cấp</option>
                  <option value="high">Cao</option>
                  <option value="medium">Trung bình</option>
                  <option value="low">Thấp</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Độ khó
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as DifficultyFilter }))}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                >
                  <option value="all">Tất cả</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              {/* Accuracy Filter */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Độ chính xác
                </label>
                <select
                  value={filters.accuracy}
                  onChange={(e) => setFilters(prev => ({ ...prev, accuracy: e.target.value as AccuracyFilter }))}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                >
                  <option value="all">Tất cả</option>
                  <option value="low">Thấp (&lt;50%)</option>
                  <option value="medium">Trung bình (50-80%)</option>
                  <option value="high">Cao (&gt;=80%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Min Attempts Filter */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Số lần thử tối thiểu
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minAttempts}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAttempts: parseInt(e.target.value) || 0 }))}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                />
              </div>

              {/* New Questions Only Filter */}
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="newQuestionsOnly"
                  checked={filters.showOnlyNewQuestions}
                  onChange={(e) => setFilters(prev => ({ ...prev, showOnlyNewQuestions: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="newQuestionsOnly" className="text-xs font-medium text-gray-700">
                  Chỉ hiển thị LO có câu hỏi mới
                </label>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Không tìm thấy đề xuất phù hợp
            </h3>
            <p className="text-muted-foreground mb-4">
              Thử điều chỉnh bộ lọc để xem thêm đề xuất luyện tập
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(showAllRecommendations ? filteredRecommendations : filteredRecommendations.slice(0, 5)).map((recommendation, index) => {
            const config = priorityConfig[recommendation.priority];
            const Icon = config.icon;
            // Tạo unique key bằng cách kết hợp lo_id, priority và index để tránh duplicate
            const uniqueKey = `recommendation-${recommendation.lo_id}-${recommendation.priority}-${index}`;

            return (
              <div
                key={uniqueKey}
                className={cn(
                  "p-4 rounded-lg border-l-4 transition-all duration-200",
                  config.bgColor,
                  config.borderColor
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn("h-4 w-4", config.color)} />
                      <h4 className="font-medium">{recommendation.lo_name || `LO ${recommendation.lo_id}`}</h4>
                      <Badge variant={config.badgeVariant} className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>Độ chính xác: {Math.round(recommendation.accuracy || 0)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Lần thử: {recommendation.attempts || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span className={difficultyConfig[recommendation.difficulty]?.color || "text-gray-600"}>
                          {difficultyConfig[recommendation.difficulty]?.label || recommendation.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>{recommendation.available_new_questions || 0} câu mới</span>
                      </div>
                    </div>

                    {recommendation.improvement_actions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Gợi ý cải thiện:
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {recommendation.improvement_actions.slice(0, 2).map((action, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleStartPractice(recommendation)}
                    disabled={startingPractice === recommendation.lo_id}
                    size="sm"
                    className="ml-4"
                  >
                    {startingPractice === recommendation.lo_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    <span className="ml-1">Luyện tập</span>
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {filteredRecommendations.length > 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleShowAll}
              className="transition-all duration-200 hover:scale-105"
            >
              {showAllRecommendations
                ? "Thu gọn"
                : `Xem thêm ${filteredRecommendations.length - 5} đề xuất`
              }
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
