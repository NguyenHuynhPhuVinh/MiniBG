"use client";

import React from "react";
import {
  TrendingUp,
  Thermometer,
  Activity,
  Zap,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import {
  TimeSeriesChart,
  AdvancedScoreDistributionChart,
  CompletionFunnelChart,
  DifficultyHeatmapChart,
  TimeScoreCorrelationChart,
  ActivityTimelineChart,
  AnalyticsSummaryCard,
} from "@/components/features/charts";

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <AnalyticsSummaryCard className="w-full" />

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="performance"
            className="flex items-center gap-1 text-xs lg:text-sm"
          >
            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Hiệu suất</span>
            <span className="sm:hidden">HS</span>
          </TabsTrigger>
          <TabsTrigger
            value="difficulty"
            className="flex items-center gap-1 text-xs lg:text-sm"
          >
            <Thermometer className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Độ khó</span>
            <span className="sm:hidden">ĐK</span>
          </TabsTrigger>
          <TabsTrigger
            value="behavior"
            className="flex items-center gap-1 text-xs lg:text-sm"
          >
            <Activity className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Hành vi</span>
            <span className="sm:hidden">HV</span>
          </TabsTrigger>
          <TabsTrigger
            value="correlation"
            className="flex items-center gap-1 text-xs lg:text-sm"
          >
            <Zap className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Tương quan</span>
            <span className="sm:hidden">TQ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="mb-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h3 className="font-medium text-green-900 mb-1">
              Dashboard Analytics & Hiệu suất
            </h3>
            <p className="text-sm text-green-700">
              Tổng quan về hiệu suất học tập, xu hướng điểm số và phân tích chi
              tiết các chỉ số quan trọng.
            </p>
          </div>
          <TimeSeriesChart className="w-full" />
          <CompletionFunnelChart className="w-full" />
          <AdvancedScoreDistributionChart className="w-full" />
        </TabsContent>

        <TabsContent value="difficulty" className="space-y-6 mt-6">
          <div className="mb-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <h3 className="font-medium text-orange-900 mb-1">
              Phân tích Độ khó
            </h3>
            <p className="text-sm text-orange-700">
              Bản đồ nhiệt độ khó của các câu hỏi theo chương và mức độ, giúp xác
              định nội dung cần cải thiện.
            </p>
          </div>
          <DifficultyHeatmapChart className="w-full" />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6 mt-6">
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h3 className="font-medium text-purple-900 mb-1">
              Phân tích Hành vi
            </h3>
            <p className="text-sm text-purple-700">
              Dòng thời gian hoạt động của học viên, mẫu hình học tập và xu hướng
              tham gia.
            </p>
          </div>
          <ActivityTimelineChart className="w-full" />
        </TabsContent>

        <TabsContent value="correlation" className="space-y-6 mt-6">
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <h3 className="font-medium text-yellow-900 mb-1">
              Phân tích Tương quan
            </h3>
            <p className="text-sm text-yellow-700">
              Mối quan hệ giữa thời gian làm bài và điểm số, phát hiện các mẫu
              hình bất thường.
            </p>
          </div>
          <TimeScoreCorrelationChart className="w-full" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
