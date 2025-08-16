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
  Loader2,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react";
import { advancedAnalyticsService } from "@/lib/services/api";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface ImprovementSuggestion {
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  actions: string[];
  estimated_time: string;
  expected_improvement: string;
  difficulty_level: string;
}

interface StudentImprovementSuggestionsResponse {
  success: boolean;
  data: {
    user_id: number;
    suggestions: ImprovementSuggestion[];
    summary: {
      total_suggestions: number;
      high_priority_count: number;
      estimated_total_time: string;
      focus_areas: string[];
    };
  };
}

interface StudentImprovementSuggestionsChartProps {
  quizId?: number;
  className?: string;
}

export default function StudentImprovementSuggestionsChart({
  quizId,
  className = "",
}: StudentImprovementSuggestionsChartProps) {
  const { getUser } = useAuthStatus();
  const [data, setData] =
    useState<StudentImprovementSuggestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = getUser();
      if (!user) {
        setError("Vui lòng đăng nhập để xem gợi ý");
        return;
      }

      const params = {
        user_id: user.user_id,
        suggestion_depth: "detailed" as const,
      };

      const response = await advancedAnalyticsService.getImprovementSuggestions(
        params
      );
      setData(response);
    } catch (error) {
      console.error("Lỗi khi lấy gợi ý cải thiện:", error);
      setError("Không thể tải gợi ý cải thiện");
      showErrorToast("Không thể tải gợi ý cải thiện");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Target className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200 text-red-800";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "low":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Ưu tiên cao";
      case "medium":
        return "Ưu tiên trung bình";
      case "low":
        return "Ưu tiên thấp";
      default:
        return priority;
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("study") || categoryLower.includes("học")) {
      return <BookOpen className="h-4 w-4" />;
    }
    if (
      categoryLower.includes("practice") ||
      categoryLower.includes("thực hành")
    ) {
      return <Target className="h-4 w-4" />;
    }
    if (categoryLower.includes("time") || categoryLower.includes("thời gian")) {
      return <Clock className="h-4 w-4" />;
    }
    return <Star className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Gợi ý Cải thiện Cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">
                Đang tạo gợi ý...
              </span>
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
          <CardTitle>Gợi ý Cải thiện Cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">
              {error || "Không có dữ liệu"}
            </p>
            <Button onClick={fetchData} variant="outline">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data nếu backend chưa có đầy đủ
  const mockData = {
    success: true,
    data: {
      user_id: data.data.user_id,
      suggestions: [
        {
          priority: "high" as const,
          category: "Học tập",
          title: "Cải thiện kỹ năng giải toán",
          description:
            "Bạn cần tập trung vào các bài toán cơ bản để nâng cao điểm số",
          actions: [
            "Ôn tập lại các công thức cơ bản",
            "Làm thêm 10 bài tập mỗi ngày",
            "Tham gia nhóm học tập",
          ],
          estimated_time: "2 tuần",
          expected_improvement: "15-20%",
          difficulty_level: "Trung bình",
        },
        {
          priority: "medium" as const,
          category: "Thời gian",
          title: "Quản lý thời gian làm bài",
          description: "Cải thiện tốc độ làm bài để có thời gian kiểm tra lại",
          actions: [
            "Luyện tập làm bài trong thời gian giới hạn",
            "Học cách phân bổ thời gian cho từng câu",
            "Thực hành kỹ thuật đọc nhanh",
          ],
          estimated_time: "1 tuần",
          expected_improvement: "10-15%",
          difficulty_level: "Dễ",
        },
        {
          priority: "low" as const,
          category: "Thực hành",
          title: "Tăng cường luyện tập",
          description: "Thực hành thêm để củng cố kiến thức đã học",
          actions: [
            "Làm quiz ôn tập hàng ngày",
            "Tham gia các bài kiểm tra thử",
            "Xem lại các bài đã làm sai",
          ],
          estimated_time: "3 tuần",
          expected_improvement: "5-10%",
          difficulty_level: "Dễ",
        },
      ],
      summary: {
        total_suggestions: 3,
        high_priority_count: 1,
        estimated_total_time: "6 tuần",
        focus_areas: ["Toán học", "Quản lý thời gian", "Thực hành"],
      },
    },
  };

  const displayData = mockData;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Gợi ý Cải thiện Cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Lightbulb className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Tổng gợi ý</p>
            <p className="text-lg font-bold text-blue-600">
              {displayData.data.summary.total_suggestions}
            </p>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Ưu tiên cao</p>
            <p className="text-lg font-bold text-red-600">
              {displayData.data.summary.high_priority_count}
            </p>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Clock className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Thời gian ước tính</p>
            <p className="text-lg font-bold text-green-600">
              {displayData.data.summary.estimated_total_time}
            </p>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Target className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Lĩnh vực</p>
            <p className="text-lg font-bold text-purple-600">
              {displayData.data.summary.focus_areas.length}
            </p>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Lĩnh vực cần tập trung</h4>
          <div className="flex flex-wrap gap-2">
            {displayData.data.summary.focus_areas.map((area, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h4 className="font-medium mb-4">Gợi ý chi tiết</h4>
          <div className="space-y-4">
            {displayData.data.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  {getPriorityIcon(suggestion.priority)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{suggestion.title}</span>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {getPriorityLabel(suggestion.priority)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(suggestion.category)}
                      <span className="text-sm text-muted-foreground">
                        {suggestion.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">
                      {suggestion.estimated_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cải thiện:</span>
                    <span className="font-medium">
                      {suggestion.expected_improvement}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Độ khó:</span>
                    <span className="font-medium">
                      {suggestion.difficulty_level}
                    </span>
                  </div>
                </div>

                {/* Action Items */}
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Hành động cụ thể:</p>
                  <div className="space-y-1">
                    {suggestion.actions.map((action, actionIndex) => (
                      <div
                        key={actionIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Bắt đầu cải thiện ngay hôm nay!
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Hãy bắt đầu với các gợi ý ưu tiên cao để có kết quả tốt nhất.
                Thực hiện đều đặn sẽ giúp bạn cải thiện đáng kể.
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Tạo kế hoạch học tập
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
