"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Loader2, Filter, Users, CheckCircle, Trophy } from "lucide-react";
import { advancedAnalyticsService } from "@/lib/services";
import { CompletionFunnelResponse } from "@/lib/types/advanced-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";

interface CompletionFunnelChartProps {
  quizId?: number;
  subjectId?: number;
  programId?: number;
  className?: string;
}

export default function CompletionFunnelChart({
  quizId,
  subjectId,
  programId,
  className = "",
}: CompletionFunnelChartProps) {
  const [data, setData] = useState<CompletionFunnelResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {};
      if (quizId) params.quiz_id = quizId;
      if (subjectId) params.subject_id = subjectId;
      if (programId) params.program_id = programId;

      const response = await advancedAnalyticsService.getCompletionFunnel(
        params
      );
      setData(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu completion funnel:", error);
      setError("Không thể tải dữ liệu biểu đồ");
      showErrorToast("Không thể tải dữ liệu biểu đồ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId, subjectId, programId]);

  const getStageIcon = (stage: string) => {
    const stageLower = stage.toLowerCase();
    if (stageLower.includes("registered") || stageLower.includes("đăng ký")) {
      return <Users className="h-5 w-5" />;
    }
    if (stageLower.includes("started") || stageLower.includes("bắt đầu")) {
      return <Filter className="h-5 w-5" />;
    }
    if (stageLower.includes("completed") || stageLower.includes("hoàn thành")) {
      return <CheckCircle className="h-5 w-5" />;
    }
    if (stageLower.includes("passed") || stageLower.includes("đạt")) {
      return <Trophy className="h-5 w-5" />;
    }
    return <Filter className="h-5 w-5" />;
  };

  const getStageColor = (index: number, total: number) => {
    const intensity = 1 - (index / total) * 0.6; // Giảm dần từ 1 xuống 0.4
    return {
      backgroundColor: `rgba(59, 130, 246, ${intensity})`,
      borderColor: "rgba(59, 130, 246, 1)",
    };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Phễu chuyển đổi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">
                Đang tải dữ liệu...
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
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Phễu chuyển đổi
          </CardTitle>
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Phễu chuyển đổi
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Funnel Visualization */}
        <div className="space-y-4">
          {data.data.funnel_stages.map((stage, index) => {
            const colors = getStageColor(index, data.data.funnel_stages.length);
            const percentage =
              typeof stage.percentage === "number"
                ? stage.percentage
                : parseFloat(stage.percentage || "0");
            const width = Math.max(20, percentage); // Minimum width 20%

            return (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStageIcon(stage.stage)}
                    <span className="font-medium">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">{stage.count}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      (
                      {typeof stage.percentage === "number"
                        ? stage.percentage.toFixed(1)
                        : parseFloat(stage.percentage || "0").toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>

                {/* Funnel Bar */}
                <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out flex items-center justify-center text-white font-medium"
                    style={{
                      width: `${width}%`,
                      backgroundColor: colors.backgroundColor,
                      borderLeft: `3px solid ${colors.borderColor}`,
                    }}
                  >
                    {stage.conversion_rate !== "100.00" && (
                      <span className="text-sm">
                        Tỷ lệ chuyển đổi: {stage.conversion_rate}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Drop-off indicator */}
                {index < data.data.funnel_stages.length - 1 && (
                  <div className="flex justify-center mt-2">
                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      ↓{" "}
                      {(() => {
                        const currentPercentage =
                          data.data.funnel_stages[index].percentage || 0;
                        const nextPercentage =
                          data.data.funnel_stages[index + 1].percentage || 0;
                        return (currentPercentage - nextPercentage).toFixed(1);
                      })()}
                      % rời bỏ
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
            <p className="text-2xl font-bold text-blue-600">
              {parseFloat(data.data.summary.completion_rate).toFixed(1)}%
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Tỷ lệ đạt</p>
            <p className="text-2xl font-bold text-green-600">
              {parseFloat(data.data.summary.pass_rate).toFixed(1)}%
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground">Tỷ lệ xuất sắc</p>
            <p className="text-2xl font-bold text-purple-600">
              {parseFloat(data.data.summary.excellence_rate).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Phân tích:</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            {data.data.funnel_stages.length > 1 && (
              <>
                <div>
                  • Tỷ lệ chuyển đổi tổng thể:{" "}
                  {
                    data.data.funnel_stages[data.data.funnel_stages.length - 1]
                      .conversion_rate
                  }
                  %
                </div>
                <div>
                  • Giai đoạn có tỷ lệ rời bỏ cao nhất:{" "}
                  {(() => {
                    let maxDropOff = 0;
                    let maxDropOffStage = "";
                    for (
                      let i = 0;
                      i < data.data.funnel_stages.length - 1;
                      i++
                    ) {
                      const currentPercentage =
                        data.data.funnel_stages[i].percentage || 0;
                      const nextPercentage =
                        data.data.funnel_stages[i + 1].percentage || 0;
                      const dropOff = currentPercentage - nextPercentage;
                      if (dropOff > maxDropOff) {
                        maxDropOff = dropOff;
                        maxDropOffStage = `${
                          data.data.funnel_stages[i].stage
                        } → ${data.data.funnel_stages[i + 1].stage}`;
                      }
                    }
                    return `${maxDropOffStage} (${maxDropOff.toFixed(1)}%)`;
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
