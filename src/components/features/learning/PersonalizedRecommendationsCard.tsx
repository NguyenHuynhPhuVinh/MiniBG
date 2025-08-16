"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import { Badge, Progress } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import {
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonalizedRecommendationsProps } from "@/lib/types/lo-completion-analysis";

export function PersonalizedRecommendationsCard({
  className,
  recommendations,
  onActionClick,
  onPhaseSelect,
}: PersonalizedRecommendationsProps) {
  // Log recommendations for debugging (can be removed in production)
  React.useEffect(() => {
    if (recommendations) {
      console.log(
        "PersonalizedRecommendationsCard received data:",
        recommendations
      );
    }
  }, [recommendations]);

  const [activeTab, setActiveTab] = useState("immediate");

  const renderImmediateFocus = () => (
    <div className="space-y-6">
      {recommendations.immediate_focus &&
      recommendations.immediate_focus.length > 0 ? (
        <div className="space-y-4">
          {recommendations.immediate_focus.map((action, index) => (
            <div
              key={index}
              className="p-4 border border-red-200 rounded-lg bg-red-50/30"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {(action as any).lo_name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {(action as any).reason}
                  </p>
                  <p className="text-sm font-medium text-red-700 mb-3">
                    {(action as any).action}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => onActionClick?.((action as any).action)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Thực hiện ngay
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Target className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">Không có hành động ưu tiên</p>
          <p className="text-sm">Tất cả LO đều đạt mức thành thạo tốt</p>
        </div>
      )}
    </div>
  );

  const renderNextPhase = () => (
    <div className="space-y-6">
      {recommendations.next_phase && recommendations.next_phase.length > 0 ? (
        <div className="space-y-4">
          {recommendations.next_phase.map((phase, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {phase.lo_name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {phase.type === "advancement" ? "Nâng cao" : "Cơ bản"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{phase.reason}</p>
                  <p className="text-sm text-gray-700 mb-3">{phase.action}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPhaseSelect?.(phase.lo_name)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Bắt đầu học
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">Chưa có giai đoạn tiếp theo</p>
          <p className="text-sm">Hoàn thành các hành động ưu tiên trước</p>
        </div>
      )}
    </div>
  );

  const renderStudySchedule = () => (
    <div className="space-y-6">
      {recommendations.study_schedule &&
      Object.keys(recommendations.study_schedule).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(recommendations.study_schedule).map(
            ([weekKey, weekData], index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {weekKey.replace("_", " ").toUpperCase()}
                    </h4>

                    {typeof weekData === "object" && weekData !== null && (
                      <div className="space-y-2">
                        {weekData.focus && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Tập trung:</span>{" "}
                            {weekData.focus}
                          </div>
                        )}

                        {weekData.chapters &&
                          Array.isArray(weekData.chapters) && (
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">Chương:</span>{" "}
                              {weekData.chapters.join(", ")}
                            </div>
                          )}

                        {weekData.target_completion && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Mục tiêu:</span>{" "}
                            {weekData.target_completion}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">Chưa có lịch học cụ thể</p>
          <p className="text-sm">
            Hệ thống sẽ tạo lịch học dựa trên tiến độ hiện tại
          </p>
        </div>
      )}
    </div>
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          Gợi ý học tập cá nhân hóa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Kế hoạch học tập được tùy chỉnh dựa trên phân tích LO completion của
          bạn
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="immediate" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Ngay lập tức</span>
              <span className="sm:hidden">Ngay</span>
            </TabsTrigger>
            <TabsTrigger value="next-phase" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Giai đoạn tiếp theo</span>
              <span className="sm:hidden">Tiếp theo</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Lịch học</span>
              <span className="sm:hidden">Lịch</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="immediate">{renderImmediateFocus()}</TabsContent>

          <TabsContent value="next-phase">{renderNextPhase()}</TabsContent>

          <TabsContent value="schedule">{renderStudySchedule()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
