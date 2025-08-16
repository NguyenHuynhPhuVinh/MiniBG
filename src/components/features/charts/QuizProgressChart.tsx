/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
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
import { Activity, Users, TrendingUp, Clock } from "lucide-react";
import { QuizParticipant } from "@/lib/types/quiz";

// Đăng ký các component cần thiết cho Chart.js
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

interface QuizProgressChartProps {
  participants: QuizParticipant[];
  className?: string;
}

interface ProgressDataPoint {
  time: string;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  averageProgress: number;
  averageScore: number;
}

export default function QuizProgressChart({
  participants,
  className = "",
}: QuizProgressChartProps) {
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<
    "progress" | "score" | "participants"
  >("progress");

  // Cập nhật dữ liệu tiến trình theo thời gian thực
  useEffect(() => {
    if (!participants || participants.length === 0) {
      setProgressData([]);
      return;
    }

    // Tính toán metrics hiện tại từ dữ liệu thực
    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const totalParticipants = participants.length;
    const activeParticipants = participants.filter(
      (p) => p.status === "in_progress"
    ).length;
    const completedParticipants = participants.filter(
      (p) => p.status === "completed"
    ).length;

    const averageProgress =
      totalParticipants > 0
        ? participants.reduce((sum, p) => sum + (p.progress || 0), 0) /
          totalParticipants
        : 0;

    const averageScore =
      totalParticipants > 0
        ? participants.reduce((sum, p) => sum + (p.score || 0), 0) /
          totalParticipants
        : 0;

    // Tạo điểm dữ liệu mới
    const newDataPoint: ProgressDataPoint = {
      time: timeStr,
      totalParticipants,
      activeParticipants,
      completedParticipants,
      averageProgress,
      averageScore,
    };

    // Cập nhật dữ liệu timeline (giữ tối đa 20 điểm gần nhất)
    setProgressData((prevData) => {
      const newData = [...prevData, newDataPoint];
      return newData.slice(-20); // Giữ 20 điểm gần nhất
    });
  }, [participants]);

  // Cấu hình dữ liệu cho biểu đồ
  const getChartData = () => {
    const labels = progressData.map((d) => d.time);

    const baseConfig = {
      labels,
      datasets: [] as any[],
    };

    switch (selectedMetric) {
      case "progress":
        baseConfig.datasets = [
          {
            label: "Tiến độ trung bình (%)",
            data: progressData.map((d) => d.averageProgress),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ];
        break;

      case "score":
        baseConfig.datasets = [
          {
            label: "Điểm trung bình",
            data: progressData.map((d) => d.averageScore),
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ];
        break;

      case "participants":
        baseConfig.datasets = [
          {
            label: "Đang làm bài",
            data: progressData.map((d) => d.activeParticipants),
            borderColor: "rgb(251, 191, 36)",
            backgroundColor: "rgba(251, 191, 36, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Đã hoàn thành",
            data: progressData.map((d) => d.completedParticipants),
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ];
        break;
    }

    return baseConfig;
  };

  // Cấu hình options cho biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            if (selectedMetric === "participants") {
              return `${label}: ${value} người`;
            } else {
              return `${label}: ${value.toFixed(1)}${
                selectedMetric === "progress" ? "%" : " điểm"
              }`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Thời gian",
          font: {
            size: 12,
            weight: "bold" as const,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        beginAtZero: true,
        max:
          selectedMetric === "participants"
            ? Math.max(participants.length, 10)
            : 100,
        title: {
          display: true,
          text:
            selectedMetric === "participants"
              ? "Số người"
              : selectedMetric === "progress"
              ? "Tiến độ (%)"
              : "Điểm số",
          font: {
            size: 12,
            weight: "bold" as const,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: function (value: any) {
            if (selectedMetric === "participants") {
              return value + " người";
            } else {
              return value + (selectedMetric === "progress" ? "%" : "");
            }
          },
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 2,
      },
    },
  };

  // Tính toán thống kê hiện tại
  const currentStats = {
    totalParticipants: participants.length,
    activeParticipants: participants.filter((p) => p.status === "in_progress")
      .length,
    completedParticipants: participants.filter((p) => p.status === "completed")
      .length,
    averageProgress:
      participants.length > 0
        ? participants.reduce((sum, p) => sum + (p.progress || 0), 0) /
          participants.length
        : 0,
    averageScore:
      participants.length > 0
        ? participants.reduce((sum, p) => sum + (p.score || 0), 0) /
          participants.length
        : 0,
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Activity className="h-6 w-6" />
              Theo dõi tiến trình làm bài
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Biểu đồ thời gian thực về tiến độ của người tham gia
            </p>
          </div>

          {/* Buttons chọn metric */}
          <div className="flex gap-2">
            <Button
              variant={selectedMetric === "progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric("progress")}
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-4 w-4" />
              Tiến độ
            </Button>
            <Button
              variant={selectedMetric === "score" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric("score")}
              className="flex items-center gap-1"
            >
              <Activity className="h-4 w-4" />
              Điểm số
            </Button>
            <Button
              variant={
                selectedMetric === "participants" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedMetric("participants")}
              className="flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              Người tham gia
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Tổng số</span>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {currentStats.totalParticipants}
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">
                Đang làm
              </span>
            </div>
            <div className="text-xl font-bold text-yellow-700">
              {currentStats.activeParticipants}
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Tiến độ TB
              </span>
            </div>
            <div className="text-xl font-bold text-green-700">
              {currentStats.averageProgress.toFixed(1)}%
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">
                Điểm TB
              </span>
            </div>
            <div className="text-xl font-bold text-purple-700">
              {currentStats.averageScore.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Biểu đồ */}
        <div className="h-80">
          {progressData.length > 0 ? (
            <Line data={getChartData()} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Đang tải dữ liệu tiến trình...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
