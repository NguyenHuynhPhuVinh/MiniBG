"use client";

import React, { useState, useEffect } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Loader2, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { advancedAnalyticsService } from "@/lib/services/api";
import { TimeScoreCorrelationResponse } from "@/lib/types/advanced-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface TimeScoreCorrelationChartProps {
  quizId?: number;
  subjectId?: number;
  programId?: number;
  className?: string;
}

export default function TimeScoreCorrelationChart({
  quizId,
  subjectId,
  programId,
  className = "",
}: TimeScoreCorrelationChartProps) {
  const [data, setData] = useState<TimeScoreCorrelationResponse | null>(null);
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

      const response = await advancedAnalyticsService.getTimeScoreCorrelation(
        params
      );
      setData(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu time-score correlation:", error);
      setError("Không thể tải dữ liệu biểu đồ");
      showErrorToast("Không thể tải dữ liệu biểu đồ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId, subjectId, programId]);

  const getCorrelationStrength = (coefficient: number) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) return "mạnh";
    if (abs >= 0.5) return "trung bình";
    if (abs >= 0.3) return "yếu";
    return "rất yếu";
  };

  const getCorrelationColor = (coefficient: number) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) return "text-red-600";
    if (abs >= 0.5) return "text-orange-600";
    if (abs >= 0.3) return "text-yellow-600";
    return "text-gray-600";
  };

  const chartData = data?.data?.scatter_plot_data
    ? {
        datasets: [
          {
            label: "Điểm bình thường",
            data: data.data.scatter_plot_data
              .filter((point) => !point.is_outlier)
              .map((point) => ({ x: point.x, y: point.y })),
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgba(59, 130, 246, 1)",
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Điểm bất thường",
            data: data.data.scatter_plot_data
              .filter((point) => point.is_outlier)
              .map((point) => ({ x: point.x, y: point.y })),
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            borderColor: "rgba(239, 68, 68, 1)",
            pointRadius: 6,
            pointHoverRadius: 8,
            pointStyle: "triangle",
          },
        ],
      }
    : null;

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
        callbacks: {
          label: function (context: any) {
            const point = data?.data.scatter_plot_data[context.dataIndex];
            return [
              `Thời gian: ${context.parsed.x.toFixed(1)} giây`,
              `Điểm số: ${context.parsed.y.toFixed(1)}`,
              point?.is_outlier ? "Điểm bất thường" : "Điểm bình thường",
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Thời gian phản hồi (giây)",
        },
        min: 0,
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Điểm số",
        },
        min: 0,
        max: 10,
      },
    },
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Tương quan thời gian - điểm số
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
            <Zap className="h-5 w-5" />
            Tương quan thời gian - điểm số
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

  const correlationCoeff = data?.data?.correlation_analysis
    ?.correlation_coefficient
    ? parseFloat(data.data.correlation_analysis.correlation_coefficient)
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Tương quan thời gian - điểm số
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData && <Scatter data={chartData} options={chartOptions} />}
        </div>

        {/* Correlation Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium">Phân tích tương quan</h4>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Hệ số tương quan:
                </span>
                <span
                  className={`font-medium ${getCorrelationColor(
                    correlationCoeff
                  )}`}
                >
                  {correlationCoeff.toFixed(3)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Mức độ tương quan:
                </span>
                <span className="font-medium">
                  {getCorrelationStrength(correlationCoeff)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Kích thước mẫu:
                </span>
                <span className="font-medium">
                  {data.data.correlation_analysis?.sample_size ?? 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Mức ý nghĩa:
                </span>
                <span className="font-medium">
                  {data.data.correlation_analysis?.significance ?? "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h4 className="font-medium">Điểm bất thường</h4>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Số điểm bất thường:
                </span>
                <span className="font-medium">
                  {data.data.outliers?.score_outliers?.outlier_count ?? 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tỷ lệ bất thường:
                </span>
                <span className="font-medium">
                  {data.data.outliers?.score_outliers?.outlier_percentage
                    ? parseFloat(
                        data.data.outliers.score_outliers.outlier_percentage
                      ).toFixed(2)
                    : "0.00"}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Giải thích:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <strong>Hệ số tương quan {correlationCoeff.toFixed(3)}:</strong>{" "}
              {data.data.correlation_analysis?.interpretation ??
                "Không có dữ liệu"}
            </div>

            <div>
              <strong>Ý nghĩa:</strong>{" "}
              {correlationCoeff < -0.3
                ? "Có xu hướng nghịch: thời gian làm bài càng lâu thì điểm số càng thấp"
                : correlationCoeff > 0.3
                ? "Có xu hướng thuận: thời gian làm bài càng lâu thì điểm số càng cao"
                : "Không có mối quan hệ rõ ràng giữa thời gian và điểm số"}
            </div>

            {(data.data.outliers?.score_outliers?.outlier_count ?? 0) > 0 && (
              <div>
                <strong>Điểm bất thường:</strong> Có{" "}
                {data.data.outliers?.score_outliers?.outlier_count ?? 0} trường
                hợp có thời gian hoặc điểm số bất thường, cần xem xét kỹ hơn.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
