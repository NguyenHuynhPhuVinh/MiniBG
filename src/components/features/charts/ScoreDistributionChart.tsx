/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { PieChart } from "lucide-react";
import { QuizParticipant } from "@/lib/types/quiz";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ScoreDistributionChartProps {
  participants: QuizParticipant[];
  className?: string;
}

const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({
  participants,
  className,
}) => {
  // Phân loại điểm số
  const getScoreDistribution = () => {
    const distribution = {
      excellent: 0, // 90-100
      good: 0, // 70-89
      average: 0, // 50-69
      poor: 0, // 0-49
    };

    participants.forEach((participant) => {
      const score = participant.score;
      if (score >= 90) distribution.excellent++;
      else if (score >= 70) distribution.good++;
      else if (score >= 50) distribution.average++;
      else distribution.poor++;
    });

    return distribution;
  };

  const distribution = getScoreDistribution();
  const total = participants.length;

  const chartData = {
    labels: [
      "Xuất sắc (90-100)",
      "Tốt (70-89)",
      "Trung bình (50-69)",
      "Yếu (0-49)",
    ],
    datasets: [
      {
        data: [
          distribution.excellent,
          distribution.good,
          distribution.average,
          distribution.poor,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // green-500
          "rgba(59, 130, 246, 0.8)", // blue-500
          "rgba(245, 158, 11, 0.8)", // amber-500
          "rgba(239, 68, 68, 0.8)", // red-500
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
        hoverOffset: 8,
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
              total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
            return `${context.raw} học viên (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
    animation: {
      animateRotate: true,
      duration: 1000,
    },
  };

  // Tính điểm trung bình
  const averageScore =
    total > 0
      ? (participants.reduce((sum, p) => sum + p.score, 0) / total).toFixed(1)
      : "0";

  return (
    <Card
      className={`border-2 hover:border-primary transition-all ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChart className="h-5 w-5 text-purple-500" />
          Phân bố điểm số
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold">{averageScore}</p>
              <p className="text-sm text-muted-foreground">Điểm TB</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">Xuất sắc:</span>
            <span className="font-semibold">{distribution.excellent}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">Tốt:</span>
            <span className="font-semibold">{distribution.good}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-muted-foreground">Trung bình:</span>
            <span className="font-semibold">{distribution.average}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-muted-foreground">Yếu:</span>
            <span className="font-semibold">{distribution.poor}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreDistributionChart;
