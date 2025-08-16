/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { Activity } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface QuizStatusChartProps {
  data: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  className?: string;
}

const QuizStatusChart: React.FC<QuizStatusChartProps> = ({
  data,
  className,
}) => {
  const chartData = {
    labels: ["Hoàn thành", "Đang làm", "Chờ bắt đầu"],
    datasets: [
      {
        label: "Số lượng học viên",
        data: [data.completed, data.inProgress, data.pending],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // green-500
          "rgba(59, 130, 246, 0.8)", // blue-500
          "rgba(249, 115, 22, 0.8)", // orange-500
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(249, 115, 22, 1)",
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const percentage =
              data.total > 0
                ? ((context.raw / data.total) * 100).toFixed(1)
                : 0;
            return `${context.raw} học viên (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "rgba(107, 114, 128, 0.8)",
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
      },
      x: {
        ticks: {
          color: "rgba(107, 114, 128, 0.8)",
        },
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: 750,
      easing: "easeInOutQuart" as const,
    },
  };

  return (
    <Card
      className={`border-2 hover:border-primary transition-all ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-blue-500" />
          Trạng thái học viên
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
            <p className="text-muted-foreground">Hoàn thành</p>
            <p className="font-semibold">{data.completed}</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
            <p className="text-muted-foreground">Đang làm</p>
            <p className="font-semibold">{data.inProgress}</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1"></div>
            <p className="text-muted-foreground">Chờ bắt đầu</p>
            <p className="font-semibold">{data.pending}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizStatusChart;
