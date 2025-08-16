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
import { Trophy, Medal, Award } from "lucide-react";
import { QuizParticipant } from "@/lib/types/quiz";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RealtimeLeaderboardProps {
  participants: QuizParticipant[];
  className?: string;
  maxDisplay?: number;
}

const RealtimeLeaderboard: React.FC<RealtimeLeaderboardProps> = ({
  participants,
  className,
  maxDisplay = 10,
}) => {
  // Sắp xếp và lấy top participants
  const topParticipants = participants
    .sort((a, b) => b.score - a.score)
    .slice(0, maxDisplay);

  const chartData = {
    labels: topParticipants.map((p, index) => {
      const name =
        p.name.length > 15 ? `${p.name.substring(0, 15)}...` : p.name;
      return `${index + 1}. ${name}`;
    }),
    datasets: [
      {
        label: "Điểm số",
        data: topParticipants.map((p) => p.score),
        backgroundColor: topParticipants.map((_, index) => {
          if (index === 0) return "rgba(255, 215, 0, 0.8)"; // gold
          if (index === 1) return "rgba(192, 192, 192, 0.8)"; // silver
          if (index === 2) return "rgba(205, 127, 50, 0.8)"; // bronze
          return "rgba(59, 130, 246, 0.8)"; // blue
        }),
        borderColor: topParticipants.map((_, index) => {
          if (index === 0) return "rgba(255, 215, 0, 1)";
          if (index === 1) return "rgba(192, 192, 192, 1)";
          if (index === 2) return "rgba(205, 127, 50, 1)";
          return "rgba(59, 130, 246, 1)";
        }),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
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
          title: function (context: any) {
            const participant = topParticipants[context[0].dataIndex];
            return participant.name;
          },
          label: function (context: any) {
            const participant = topParticipants[context.dataIndex];
            const progress = participant.progress
              ? `${participant.progress}%`
              : "N/A";
            const answers =
              participant.correct_answers && participant.total_answers
                ? `${participant.correct_answers}/${participant.total_answers} đúng`
                : "N/A";
            return [
              `Điểm: ${context.raw}`,
              `Tiến độ: ${progress}`,
              `Trả lời: ${answers}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "rgba(107, 114, 128, 0.8)",
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
      },
      y: {
        ticks: {
          color: "rgba(107, 114, 128, 0.8)",
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart" as const,
    },
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Award className="h-4 w-4 text-orange-600" />;
      default:
        return (
          <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
        );
    }
  };

  return (
    <Card
      className={`border-2 hover:border-primary transition-all ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Bảng xếp hạng realtime
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topParticipants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có dữ liệu xếp hạng
          </div>
        ) : (
          <>
            <div className="h-80 mb-4">
              <Bar data={chartData} options={options} />
            </div>

            {/* Top 3 highlight */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {topParticipants.slice(0, 3).map((participant, index) => (
                <div
                  key={participant.user_id}
                  className={`text-center p-3 rounded-lg border-2 ${
                    index === 0
                      ? "border-yellow-200 bg-yellow-50"
                      : index === 1
                      ? "border-gray-200 bg-gray-50"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {getRankIcon(index)}
                  </div>
                  <p className="font-semibold text-sm truncate">
                    {participant.name}
                  </p>
                  <p className="text-lg font-bold">{participant.score}</p>
                  {participant.progress && (
                    <p className="text-xs text-muted-foreground">
                      {participant.progress}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RealtimeLeaderboard;
