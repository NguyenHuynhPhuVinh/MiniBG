"use client";

import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Loader2, BarChart3 } from "lucide-react";
import {
  advancedAnalyticsService,
  ScoreDistributionParams,
} from "@/lib/services";
import { ScoreDistributionResponse } from "@/lib/types/advanced-analytics";

// Type cho data sau khi đã xử lý wrapper
type ScoreDistributionData = ScoreDistributionResponse["data"];
import { showErrorToast } from "@/lib/utils/toast-utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AdvancedScoreDistributionChartProps {
  quizId?: number;
  subjectId?: number;
  programId?: number;
  className?: string;
}

export default function AdvancedScoreDistributionChart({
  quizId,
  subjectId,
  programId,
  className = "",
}: AdvancedScoreDistributionChartProps) {
  const [data, setData] = useState<ScoreDistributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bins, setBins] = useState<number>(10);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>("none");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: ScoreDistributionParams = {
        bins: bins,
      };

      if (quizId) params.quiz_id = quizId;
      if (subjectId) params.subject_id = subjectId;
      if (programId) params.program_id = programId;
      if (comparisonPeriod !== "none")
        params.comparison_period = comparisonPeriod;

      const response = await advancedAnalyticsService.getScoreDistribution(
        params
      );
      console.log("Score Distribution API Response:", response);

      if (response?.success && response?.data) {
        setData(response.data);
      } else {
        console.warn(
          "Unexpected score distribution response structure:",
          response
        );
        setError("Dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu phân phối điểm:", error);
      setError("Không thể tải dữ liệu biểu đồ");
      showErrorToast("Không thể tải dữ liệu biểu đồ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId, subjectId, programId, bins, comparisonPeriod]);

  const chartData =
    data && data.current_period && data.current_period.histogram
      ? {
          labels: data.current_period.histogram.map(
            (bin) => `${bin.bin_start.toFixed(1)} - ${bin.bin_end.toFixed(1)}`
          ),
          datasets: [
            {
              label: "Số lượng học viên",
              data: data.current_period.histogram.map((bin) => bin.count),
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
            },
            ...(data.comparison_period && data.comparison_period.histogram
              ? [
                  {
                    label: "Kỳ trước",
                    data: data.comparison_period.histogram.map(
                      (bin) => bin.count
                    ),
                    backgroundColor: "rgba(156, 163, 175, 0.6)",
                    borderColor: "rgba(156, 163, 175, 1)",
                    borderWidth: 1,
                  },
                ]
              : []),
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
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            const binIndex = context.dataIndex;
            const percentage =
              data?.current_period.histogram[binIndex]?.percentage || "0";
            return `${datasetLabel}: ${value} học viên (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Khoảng điểm",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Số lượng học viên",
        },
        beginAtZero: true,
      },
    },
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Phân phối điểm số
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
            <BarChart3 className="h-5 w-5" />
            Phân phối điểm số
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Phân phối điểm số
          </CardTitle>
          <div className="flex gap-2">
            <Select
              value={bins.toString()}
              onValueChange={(value) => setBins(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 nhóm</SelectItem>
                <SelectItem value="10">10 nhóm</SelectItem>
                <SelectItem value="15">15 nhóm</SelectItem>
                <SelectItem value="20">20 nhóm</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={comparisonPeriod}
              onValueChange={setComparisonPeriod}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không so sánh</SelectItem>
                <SelectItem value="previous_month">Tháng trước</SelectItem>
                <SelectItem value="previous_quarter">Quý trước</SelectItem>
                <SelectItem value="previous_year">Năm trước</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData && <Bar data={chartData} options={chartOptions} />}
        </div>

        {/* Thống kê mô tả */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Trung bình</p>
            <p className="text-lg font-semibold">
              {data.current_period?.statistics?.mean
                ? parseFloat(data.current_period.statistics.mean).toFixed(2)
                : "N/A"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Trung vị</p>
            <p className="text-lg font-semibold">
              {data.current_period?.statistics?.median
                ? parseFloat(data.current_period.statistics.median).toFixed(2)
                : "N/A"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Độ lệch chuẩn</p>
            <p className="text-lg font-semibold">
              {data.current_period?.statistics?.std_dev
                ? parseFloat(data.current_period.statistics.std_dev).toFixed(2)
                : "N/A"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Độ xiên</p>
            <p className="text-lg font-semibold">
              {data.current_period?.statistics?.skewness
                ? parseFloat(data.current_period.statistics.skewness).toFixed(3)
                : "N/A"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Độ nhọn</p>
            <p className="text-lg font-semibold">
              {data.current_period?.statistics?.kurtosis
                ? parseFloat(data.current_period.statistics.kurtosis).toFixed(3)
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Giải thích thống kê */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Giải thích thống kê:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>
              <strong>Độ xiên:</strong>{" "}
              {data.current_period?.statistics?.skewness
                ? parseFloat(data.current_period.statistics.skewness) > 0
                  ? "Phân phối lệch phải (nhiều điểm thấp)"
                  : parseFloat(data.current_period.statistics.skewness) < 0
                  ? "Phân phối lệch trái (nhiều điểm cao)"
                  : "Phân phối đối xứng"
                : "Không có dữ liệu"}
            </div>
            <div>
              <strong>Độ nhọn:</strong>{" "}
              {data.current_period?.statistics?.kurtosis
                ? parseFloat(data.current_period.statistics.kurtosis) > 0
                  ? "Phân phối nhọn (tập trung)"
                  : "Phân phối tù (phân tán)"
                : "Không có dữ liệu"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
