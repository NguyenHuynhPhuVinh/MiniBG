"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { advancedAnalyticsService, TimeSeriesParams } from "@/lib/services";
import { TimeSeriesResponse } from "@/lib/types/advanced-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimeSeriesChartProps {
  quizId?: number;
  subjectId?: number;
  programId?: number;
  className?: string;
}

export default function TimeSeriesChart({
  quizId,
  subjectId,
  programId,
  className = "",
}: TimeSeriesChartProps) {
  const [data, setData] = useState<TimeSeriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<"7d" | "30d" | "3m" | "6m" | "1y">("30d");
  const [aggregation, setAggregation] = useState<"daily" | "weekly" | "monthly">("daily");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: TimeSeriesParams = {
        time_period: timePeriod,
        aggregation: aggregation,
      };

      if (quizId) params.quiz_id = quizId;
      if (subjectId) params.subject_id = subjectId;
      if (programId) params.program_id = programId;

      const response = await advancedAnalyticsService.getTimeSeriesPerformance(params);
      setData(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu time series:", error);
      setError("Không thể tải dữ liệu biểu đồ");
      showErrorToast("Không thể tải dữ liệu biểu đồ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId, subjectId, programId, timePeriod, aggregation]);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "improving":
        return "text-green-600";
      case "declining":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const chartData = data ? {
    labels: data.data.time_series.map(point => {
      const date = new Date(point.period);
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        label: "Điểm trung bình",
        data: data.data.time_series.map(point => parseFloat(point.avg_score)),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Tỷ lệ điểm cao (%)",
        data: data.data.time_series.map(point => parseFloat(point.high_score_rate)),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: false,
        tension: 0.4,
        yAxisID: "y1",
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
            if (datasetLabel === "Tỷ lệ điểm cao (%)") {
              return `${datasetLabel}: ${value.toFixed(1)}%`;
            }
            return `${datasetLabel}: ${value.toFixed(2)}`;
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
          text: "Điểm trung bình",
        },
        min: 0,
        max: 10,
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Tỷ lệ điểm cao (%)",
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Xu hướng điểm số theo thời gian</CardTitle>
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
          <CardTitle>Xu hướng điểm số theo thời gian</CardTitle>
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Xu hướng điểm số theo thời gian</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(data.data.trend_analysis.trend_direction)}
              <span className={`text-sm font-medium ${getTrendColor(data.data.trend_analysis.trend_direction)}`}>
                {data.data.trend_analysis.trend_direction === "improving" && "Xu hướng tăng"}
                {data.data.trend_analysis.trend_direction === "declining" && "Xu hướng giảm"}
                {data.data.trend_analysis.trend_direction === "stable" && "Xu hướng ổn định"}
              </span>
              <span className="text-sm text-muted-foreground">
                (Độ tin cậy: {data.data.trend_analysis.confidence})
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 ngày</SelectItem>
                <SelectItem value="30d">30 ngày</SelectItem>
                <SelectItem value="3m">3 tháng</SelectItem>
                <SelectItem value="6m">6 tháng</SelectItem>
                <SelectItem value="1y">1 năm</SelectItem>
              </SelectContent>
            </Select>
            <Select value={aggregation} onValueChange={(value: any) => setAggregation(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Theo ngày</SelectItem>
                <SelectItem value="weekly">Theo tuần</SelectItem>
                <SelectItem value="monthly">Theo tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData && <Line data={chartData} options={chartOptions} />}
        </div>
        
        {/* Thống kê bổ sung */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Hệ số tương quan</p>
            <p className="text-lg font-semibold">{parseFloat(data.data.trend_analysis.r_squared).toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Độ dốc</p>
            <p className="text-lg font-semibold">{parseFloat(data.data.trend_analysis.slope).toFixed(4)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Tổng lượt thi</p>
            <p className="text-lg font-semibold">
              {data.data.time_series.reduce((sum, point) => sum + point.total_attempts, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Độ lệch chuẩn TB</p>
            <p className="text-lg font-semibold">
              {(data.data.time_series.reduce((sum, point) => sum + parseFloat(point.score_stddev), 0) / data.data.time_series.length).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
