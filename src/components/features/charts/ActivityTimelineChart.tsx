"use client";

import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { Loader2, Activity, Users, Clock, TrendingUp } from "lucide-react";
import { advancedAnalyticsService, ActivityTimelineParams } from "@/lib/services";
import { ActivityTimelineResponse } from "@/lib/types/advanced-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ActivityTimelineChartProps {
  quizId?: number;
  subjectId?: number;
  programId?: number;
  userId?: number;
  className?: string;
}

export default function ActivityTimelineChart({
  quizId,
  subjectId,
  programId,
  userId,
  className = "",
}: ActivityTimelineChartProps) {
  const [data, setData] = useState<ActivityTimelineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<string>("30d");
  const [granularity, setGranularity] = useState<"hourly" | "daily" | "weekly">("daily");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: ActivityTimelineParams = {
        time_period: timePeriod,
        granularity: granularity,
      };

      if (quizId) params.quiz_id = quizId;
      if (subjectId) params.subject_id = subjectId;
      if (programId) params.program_id = programId;
      if (userId) params.user_id = userId;

      const response = await advancedAnalyticsService.getActivityTimeline(params);
      setData(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu activity timeline:", error);
      setError("Không thể tải dữ liệu biểu đồ");
      showErrorToast("Không thể tải dữ liệu biểu đồ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId, subjectId, programId, userId, timePeriod, granularity]);

  const getActivityIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "high":
        return "rgba(239, 68, 68, 0.8)";
      case "medium":
        return "rgba(245, 158, 11, 0.8)";
      case "low":
        return "rgba(34, 197, 94, 0.8)";
      default:
        return "rgba(156, 163, 175, 0.8)";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "decreasing":
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600 rotate-90" />;
    }
  };

  const chartData = data ? {
    labels: data.data.timeline.map(point => {
      const date = new Date(point.time_period);
      if (granularity === "hourly") {
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      } else if (granularity === "daily") {
        return date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
      } else {
        return date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
      }
    }),
    datasets: [
      {
        label: "Số lượt thi",
        data: data.data.timeline.map(point => point.total_attempts),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: chartType === "bar" ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.1)",
        fill: chartType === "line",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Độ chính xác (%)",
        data: data.data.timeline.map(point => parseFloat(point.accuracy_rate)),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: chartType === "bar" ? "rgba(16, 185, 129, 0.8)" : "rgba(16, 185, 129, 0.1)",
        fill: false,
        tension: 0.4,
        yAxisID: "y1",
      },
      {
        label: "Người dùng hoạt động",
        data: data.data.timeline.map(point => point.active_users),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: chartType === "bar" ? "rgba(245, 158, 11, 0.8)" : "rgba(245, 158, 11, 0.1)",
        fill: false,
        tension: 0.4,
        yAxisID: "y2",
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            if (datasetLabel === "Độ chính xác (%)") {
              return `${datasetLabel}: ${value.toFixed(1)}%`;
            }
            return `${datasetLabel}: ${value}`;
          },
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Thời gian",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Số lượt thi",
        },
        beginAtZero: true,
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Độ chính xác (%)",
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: "linear" as const,
        display: false,
        position: "right" as const,
        beginAtZero: true,
      },
    },
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Dòng thời gian hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Đang tải dữ liệu...</span>
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
            <Activity className="h-5 w-5" />
            Dòng thời gian hoạt động
          </CardTitle>
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

  const ChartComponent = chartType === "line" ? Line : Bar;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Dòng thời gian hoạt động
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(data.data.patterns.activity_trend)}
              <span className="text-sm text-muted-foreground">
                Xu hướng: {data.data.patterns.activity_trend === "increasing" ? "Tăng" : 
                          data.data.patterns.activity_trend === "decreasing" ? "Giảm" : "Ổn định"}
              </span>
              <span className="text-sm text-muted-foreground">
                | Độ nhất quán: {parseFloat(data.data.patterns.consistency_score).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Đường</SelectItem>
                <SelectItem value="bar">Cột</SelectItem>
              </SelectContent>
            </Select>
            <Select value={granularity} onValueChange={(value: any) => setGranularity(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Theo giờ</SelectItem>
                <SelectItem value="daily">Theo ngày</SelectItem>
                <SelectItem value="weekly">Theo tuần</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 ngày</SelectItem>
                <SelectItem value="30d">30 ngày</SelectItem>
                <SelectItem value="3m">3 tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData && <ChartComponent data={chartData} options={chartOptions} />}
        </div>

        {/* Peak Periods */}
        {data.data.patterns.peak_periods.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Thời điểm cao điểm
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.data.patterns.peak_periods.slice(0, 3).map((peak, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">
                    {new Date(peak.period).toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                      hour: granularity === "hourly" ? "2-digit" : undefined,
                      minute: granularity === "hourly" ? "2-digit" : undefined,
                    })}
                  </p>
                  <p className="text-lg font-semibold text-blue-600">{peak.attempts} lượt thi</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Intensity Distribution */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium mb-3">Phân bố cường độ hoạt động</h4>
          <div className="grid grid-cols-3 gap-4">
            {["high", "medium", "low"].map((intensity) => {
              const count = data.data.timeline.filter(point => point.activity_intensity === intensity).length;
              const percentage = (count / data.data.timeline.length) * 100;
              
              return (
                <div key={intensity} className="text-center p-3 rounded-lg" style={{
                  backgroundColor: getActivityIntensityColor(intensity).replace('0.8', '0.1'),
                  border: `2px solid ${getActivityIntensityColor(intensity)}`,
                }}>
                  <p className="text-sm text-muted-foreground capitalize">
                    {intensity === "high" ? "Cao" : intensity === "medium" ? "Trung bình" : "Thấp"}
                  </p>
                  <p className="text-lg font-semibold">{count}</p>
                  <p className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
