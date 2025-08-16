"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import { 
  Loader2, 
  Target, 
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Award
} from "lucide-react";
import { advancedAnalyticsService } from "@/lib/services";
import { LearningOutcomeMasteryResponse } from "@/lib/types/advanced-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface StudentLearningOutcomeMasteryChartProps {
  quizId?: number;
  className?: string;
}

export default function StudentLearningOutcomeMasteryChart({
  quizId,
  className = "",
}: StudentLearningOutcomeMasteryChartProps) {
  const { getUser } = useAuthStatus();
  const [data, setData] = useState<LearningOutcomeMasteryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = getUser();
      if (!user) {
        setError("Vui lòng đăng nhập để xem phân tích");
        return;
      }

      const params = {
        user_id: user.user_id,
        mastery_threshold: 0.7,
      };

      const response = await advancedAnalyticsService.getLearningOutcomeMastery(params);
      setData(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu mastery:", error);
      setError("Không thể tải dữ liệu phân tích");
      showErrorToast("Không thể tải dữ liệu phân tích");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const getMasteryColor = (level: string) => {
    switch (level) {
      case "mastered":
        return "bg-green-100 text-green-800 border-green-200";
      case "developing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "needs_improvement":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "not_started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMasteryLabel = (level: string) => {
    switch (level) {
      case "mastered":
        return "Đã thành thạo";
      case "developing":
        return "Đang phát triển";
      case "needs_improvement":
        return "Cần cải thiện";
      case "not_started":
        return "Chưa bắt đầu";
      default:
        return level;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

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

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Mức độ Thành thạo Learning Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Đang phân tích...</span>
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
          <CardTitle>Mức độ Thành thạo Learning Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">{error || "Không có dữ liệu"}</p>
            <Button onClick={fetchData} variant="outline">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const masteryRate = parseFloat(data.data.summary.overall_mastery_rate);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Mức độ Thành thạo Learning Outcomes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Đã thành thạo</p>
            <p className="text-lg font-bold text-green-600">
              {data.data.summary.mastered_count}
            </p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Đang phát triển</p>
            <p className="text-lg font-bold text-blue-600">
              {data.data.summary.developing_count}
            </p>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Cần cải thiện</p>
            <p className="text-lg font-bold text-yellow-600">
              {data.data.summary.needs_improvement_count}
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <BookOpen className="h-6 w-6 text-gray-600 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Chưa bắt đầu</p>
            <p className="text-lg font-bold text-gray-600">
              {data.data.summary.not_started_count}
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Target className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Tổng cộng</p>
            <p className="text-lg font-bold text-purple-600">
              {data.data.summary.total_los}
            </p>
          </div>
        </div>

        {/* Overall Mastery Progress */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Tỷ lệ thành thạo tổng thể</span>
            <span className="text-lg font-bold text-primary">{masteryRate.toFixed(1)}%</span>
          </div>
          <Progress value={masteryRate} className="h-3" />
        </div>

        {/* Learning Outcomes List */}
        <div>
          <h4 className="font-medium mb-4">Chi tiết Learning Outcomes</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.data.learning_outcomes.map((lo, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{lo.lo_name}</span>
                      <Badge className={getMasteryColor(lo.mastery_level)}>
                        {getMasteryLabel(lo.mastery_level)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{lo.chapter}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(lo.improvement_trend)}
                    <span className="text-sm font-medium">
                      {(lo.accuracy_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tổng lượt:</span>
                    <span className="ml-1 font-medium">{lo.total_attempts}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Đúng:</span>
                    <span className="ml-1 font-medium">{lo.correct_attempts}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Độ chính xác:</span>
                    <span className="ml-1 font-medium">{(lo.accuracy_rate * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Difficulty Distribution */}
                {Object.keys(lo.difficulty_distribution).length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Phân bố theo độ khó:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {Object.entries(lo.difficulty_distribution).map(([difficulty, stats]) => (
                        <div key={difficulty} className="text-center p-2 bg-muted/30 rounded">
                          <p className="font-medium capitalize">{difficulty}</p>
                          <p className="text-muted-foreground">
                            {stats.correct}/{stats.total} ({((stats.correct/stats.total)*100).toFixed(0)}%)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {data.data.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Gợi ý cải thiện ({data.data.recommendations.length})
            </h4>
            <div className="space-y-3">
              {data.data.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(rec.priority)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{rec.lo_name}</span>
                        <Badge variant="outline" className="text-xs">
                          Hiện tại: {parseFloat(rec.current_accuracy).toFixed(1)}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Mục tiêu: {parseFloat(rec.target_accuracy).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.recommendation}</p>
                      <div className="space-y-1">
                        {rec.specific_actions.slice(0, 2).map((action, actionIndex) => (
                          <p key={actionIndex} className="text-xs text-muted-foreground">
                            • {action}
                          </p>
                        ))}
                      </div>
                    </div>
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
