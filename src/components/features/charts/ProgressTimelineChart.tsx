"use client";

import React, { useState, useEffect } from "react";
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
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { TrendingUp, Clock, RefreshCw } from "lucide-react";
import { QuizParticipant } from "@/lib/types/quiz";

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

interface ProgressTimelineChartProps {
  participants: QuizParticipant[];
  className?: string;
}

interface TimelineData {
  timestamp: string;
  completed: number;
  inProgress: number;
  averageScore: number;
}

const ProgressTimelineChart: React.FC<ProgressTimelineChartProps> = ({
  participants,
  className,
}) => {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [viewMode, setViewMode] = useState<"completion" | "score">(
    "completion"
  );

  // Cập nhật dữ liệu timeline khi participants thay đổi
  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const completed = participants.filter(
      (p) => p.status === "completed"
    ).length;
    const inProgress = participants.filter(
      (p) => p.status === "in_progress"
    ).length;
    const averageScore =
      participants.length > 0
        ? participants.reduce((sum, p) => sum + p.score, 0) /
          participants.length
        : 0;

    const newDataPoint: TimelineData = {
      timestamp: timeString,
      completed,
      inProgress,
      averageScore: Math.round(averageScore * 10) / 10,
    };

    setTimelineData((prev) => {
      const updated = [...prev, newDataPoint];
      // Giữ tối đa 20 điểm dữ liệu
      return updated.slice(-20);
    });
  }, [participants]);

  const getChartData = () => {
    if (viewMode === "completion") {
      return {
        labels: timelineData.map((d) => d.timestamp),
        datasets: [
          {
            label: "Hoàn thành",
            data: timelineData.map((d) => d.completed),
            borderColor: "rgba(34, 197, 94, 1)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Đang làm",
            data: timelineData.map((d) => d.inProgress),
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    } else {
      return {
        labels: timelineData.map((d) => d.timestamp),
        datasets: [
          {
            label: "Điểm trung bình",
            data: timelineData.map((d) => d.averageScore),
            borderColor: "rgba(168, 85, 247, 1)",
            backgroundColor: "rgba(168, 85, 247, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Thời gian",
          color: "rgba(107, 114, 128, 0.8)",
        },
        ticks: {
          color: "rgba(107, 114, 128, 0.8)",
          maxTicksLimit: 8,
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: viewMode === "completion" ? "Số lượng học viên" : "Điểm số",
          color: "rgba(107, 114, 128, 0.8)",
        },
        ticks: {
          color: "rgba(107, 114, 128, 0.8)",
          stepSize: viewMode === "completion" ? 1 : 10,
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    animation: {
      duration: 750,
      easing: "easeInOutQuart" as const,
    },
  };

  const clearData = () => {
    setTimelineData([]);
  };

  return (
    <Card
      className={`border-2 hover:border-primary transition-all ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Tiến độ theo thời gian
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "completion" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("completion")}
            >
              <Clock className="h-4 w-4 mr-1" />
              Hoàn thành
            </Button>
            <Button
              variant={viewMode === "score" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("score")}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Điểm số
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearData}
              title="Xóa dữ liệu"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {timelineData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Đang thu thập dữ liệu timeline...</p>
          </div>
        ) : (
          <div className="h-64">
            <Line data={getChartData()} options={options} />
          </div>
        )}

        {/* Thống kê nhanh */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-muted-foreground">Điểm dữ liệu</p>
            <p className="font-semibold">{timelineData.length}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-muted-foreground">Cập nhật cuối</p>
            <p className="font-semibold">
              {timelineData.length > 0
                ? timelineData[timelineData.length - 1].timestamp
                : "N/A"}
            </p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-muted-foreground">Xu hướng</p>
            <p className="font-semibold">
              {timelineData.length >= 2
                ? timelineData[timelineData.length - 1].completed >
                  timelineData[timelineData.length - 2].completed
                  ? "📈 Tăng"
                  : "📊 Ổn định"
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTimelineChart;
