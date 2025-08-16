/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { RadarChartData, RadarChartConfig } from "@/lib/types/radar";

// Đăng ký các component cần thiết cho Chart.js
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  data: RadarChartConfig;
  title?: string;
  height?: number;
  className?: string;
  radarData?: RadarChartData; // Thêm để truy cập thông tin chi tiết
  allRadarData?: {
    // Thêm để truy cập tất cả dữ liệu radar cho tooltip
    average?: RadarChartData;
    top_performer?: RadarChartData;
    current_user?: RadarChartData;
  };
}

export default function RadarChart({
  data,
  title,
  height = 400,
  className = "",
  radarData,
  allRadarData,
}: RadarChartProps) {
  const options = {
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
        displayColors: true,
        callbacks: {
          title: function (context: any) {
            const labelIndex = context[0].dataIndex;
            const chartData = context[0].chart.data;
            const datasetLabel = context[0].dataset.label || "";

            // Lấy dữ liệu tương ứng với dataset đang được hover
            let currentRadarData = radarData;
            if (allRadarData) {
              if (datasetLabel === "Trung bình lớp") {
                currentRadarData = allRadarData.average;
              } else if (datasetLabel === "Học viên xuất sắc") {
                currentRadarData = allRadarData.top_performer;
              } else if (datasetLabel === "Kết quả của tôi") {
                currentRadarData = allRadarData.current_user;
              }
            }

            // Hiển thị thông tin chi tiết cho Learning Outcomes
            if (currentRadarData) {
              // Kiểm tra xem label có phải là LO không (không phải difficulty level hay performance metrics)
              const difficultyCount = Object.keys(
                currentRadarData.difficulty_levels
              ).length;
              const performanceCount = 2; // Có 2 performance metrics (bỏ độ chính xác lần đầu)
              const totalLabels = chartData.labels.length;
              const loStartIndex = difficultyCount;
              const loEndIndex = totalLabels - performanceCount;

              if (labelIndex >= loStartIndex && labelIndex < loEndIndex) {
                // Đây là một LO, lấy LO key từ chart labels thay vì Object.keys()
                const chartLabel = chartData.labels[labelIndex];
                // Extract LO key từ label format "LO1 (5 câu)"
                const loKey = chartLabel.split(" ")[0]; // Lấy phần đầu trước dấu cách
                const loData = currentRadarData.learning_outcomes[loKey];

                if (loData && loData.description) {
                  return `${loKey} - ${loData.description}`;
                } else {
                  return loKey;
                }
              }
            }

            // Trả về label mặc định cho các trường hợp khác
            const labelName = chartData.labels[labelIndex];
            // Với nhãn hiệu suất "Độ chính xác tổng thể", hiển thị đúng nhãn làm title
            if (labelName === "Độ chính xác tổng thể") {
              return labelName;
            }
            return labelName;
          },
          label: function (context: any) {
            const labelIndex = context.dataIndex;
            const value = context.parsed.r;
            const datasetLabel = context.dataset.label || "";
            const chartLabel = context.chart.data.labels[labelIndex];

            // Lấy dữ liệu tương ứng với dataset đang được hover
            let currentRadarData = radarData;
            if (allRadarData) {
              if (datasetLabel === "Trung bình lớp") {
                currentRadarData = allRadarData.average;
              } else if (datasetLabel === "Học viên xuất sắc") {
                currentRadarData = allRadarData.top_performer;
              } else if (
                datasetLabel === "Kết quả của tôi" ||
                datasetLabel === "Kết quả của bạn"
              ) {
                currentRadarData = allRadarData.current_user;
              }
            }

            // Hiển thị thông tin chi tiết cho Learning Outcomes
            if (currentRadarData) {
              const difficultyCount = Object.keys(
                currentRadarData.difficulty_levels
              ).length;
              const performanceCount = 2;
              const totalLabels = context.chart.data.labels.length;
              const loStartIndex = difficultyCount;
              const loEndIndex = totalLabels - performanceCount;

              // Với các mức độ khó (dễ/trung bình/khó), label chỉ hiển thị "Tỷ lệ: ?%"
              if (labelIndex < difficultyCount) {
                return `Tỷ lệ: ${value}%`;
              }

              if (labelIndex >= loStartIndex && labelIndex < loEndIndex) {
                // Đây là một LO, lấy LO key từ chart labels
                const chartLabel = context.chart.data.labels[labelIndex];
                const loKey = chartLabel.split(" ")[0]; // Extract "LO1" từ "LO1 (5 câu)"
                const loData = currentRadarData.learning_outcomes[loKey];

                if (loData) {
                  // Tính số câu đúng thực tế từ accuracy
                  const totalQuestions = loData.questions_count;
                  const correctAnswers = Math.round(
                    (loData.accuracy * totalQuestions) / 100
                  );

                  return `Đúng: ${correctAnswers} câu`;
                }
              }
            }

            // Trả về format mặc định cho các trường hợp khác
            // Với các nhãn hiệu suất, hiển thị "Tỷ lệ: ?%"
            if (
              chartLabel === "Độ chính xác tổng thể" ||
              chartLabel === "Tỷ lệ hoàn thành"
            ) {
              return `Tỷ lệ: ${value}%`;
            }
            return `${datasetLabel}: ${value}%`;
          },
          afterLabel: function (context: any) {
            const labelIndex = context.dataIndex;
            const datasetLabel = context.dataset.label || "";

            // Lấy dữ liệu tương ứng với dataset đang được hover
            let currentRadarData = radarData;
            if (allRadarData) {
              if (datasetLabel === "Trung bình lớp") {
                currentRadarData = allRadarData.average;
              } else if (datasetLabel === "Học viên xuất sắc") {
                currentRadarData = allRadarData.top_performer;
              } else if (
                datasetLabel === "Kết quả của tôi" ||
                datasetLabel === "Kết quả của bạn"
              ) {
                currentRadarData = allRadarData.current_user;
              }
            }

            // Hiển thị thông tin chi tiết cho Learning Outcomes
            if (currentRadarData) {
              const difficultyCount = Object.keys(
                currentRadarData.difficulty_levels
              ).length;
              const performanceCount = 2;
              const totalLabels = context.chart.data.labels.length;
              const loStartIndex = difficultyCount;
              const loEndIndex = totalLabels - performanceCount;

              if (labelIndex >= loStartIndex && labelIndex < loEndIndex) {
                // Đây là một LO, lấy LO key từ chart labels
                const chartLabel = context.chart.data.labels[labelIndex];
                const loKey = chartLabel.split(" ")[0]; // Extract "LO1" từ "LO1 (5 câu)"
                const loData = currentRadarData.learning_outcomes[loKey];

                if (loData) {
                  // Tính tỷ lệ % dựa trên số câu đúng/tổng câu thực tế
                  let totalAnswered, correctAnswers;

                  if (
                    datasetLabel === "Kết quả của bạn" ||
                    datasetLabel === "Kết quả của tôi"
                  ) {
                    // Current user: tính ngược từ accuracy
                    if (loData.accuracy === 0) {
                      correctAnswers = 0;
                      totalAnswered = Math.min(1, loData.questions_count);
                    } else {
                      correctAnswers = Math.round(
                        (loData.accuracy * loData.questions_count) / 100
                      );
                      totalAnswered = Math.round(
                        (correctAnswers * 100) / loData.accuracy
                      );
                      totalAnswered = Math.min(
                        totalAnswered,
                        loData.questions_count
                      );
                    }
                  } else {
                    // Average/Top performer: giả sử trả lời hết
                    totalAnswered = loData.questions_count;
                    correctAnswers = Math.round(
                      (loData.accuracy * totalAnswered) / 100
                    );
                  }

                  // Tính tỷ lệ % thực tế
                  const actualPercentage =
                    totalAnswered > 0
                      ? Math.round((correctAnswers / totalAnswered) * 100)
                      : 0;
                  return `Tỷ lệ: ${actualPercentage}%`;
                }
              }

              // Thêm thông tin cho difficulty levels
              if (labelIndex < difficultyCount) {
                // Lấy difficulty key từ chart labels
                const chartLabel = context.chart.data.labels[labelIndex];
                // Extract difficulty key từ label format "Mức độ Dễ"
                const difficultyKey = chartLabel
                  .toLowerCase()
                  .replace("mức độ ", "");
                const difficultyData =
                  currentRadarData.difficulty_levels[difficultyKey];
                if (difficultyData) {
                  return [
                    `Số câu hỏi: ${difficultyData.questions_count}`,
                    `Thời gian TB: ${(
                      difficultyData.average_response_time / 1000
                    ).toFixed(1)}s`,
                  ];
                }
              }

              // Thêm thông tin cho performance metrics
              if (labelIndex >= loEndIndex) {
                // Với các nhãn hiệu suất (Độ chính xác tổng thể, Tỷ lệ hoàn thành), không hiển thị thêm gì
                return "";
              }
            }

            return "";
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          font: {
            size: 10,
          },
          color: "rgba(107, 114, 128, 0.8)",
          callback: function (value: any) {
            return value + "%";
          },
        },
        grid: {
          color: "rgba(107, 114, 128, 0.2)",
        },
        angleLines: {
          color: "rgba(107, 114, 128, 0.2)",
        },
        pointLabels: {
          font: {
            size: 11,
            weight: 500,
          },
          color: "rgba(55, 65, 81, 0.9)",
          padding: 10,
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
  } as const;

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
          {title}
        </h3>
      )}
      <div style={{ height: `${height}px` }}>
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}

// Utility function để chuyển đổi radar data thành format Chart.js
export function transformRadarData(
  radarData: RadarChartData,
  label: string,
  colors: {
    backgroundColor: string;
    borderColor: string;
    pointBackgroundColor: string;
  }
): RadarChartConfig {
  // Kết hợp difficulty levels và learning outcomes với thứ tự nhất quán
  const sortedDifficultyEntries = Object.entries(
    radarData.difficulty_levels
  ).sort(([a], [b]) => a.localeCompare(b)); // Sort theo tên để đảm bảo thứ tự nhất quán
  const difficultyLabels = sortedDifficultyEntries.map(
    ([level]) => `Mức độ ${level.charAt(0).toUpperCase() + level.slice(1)}`
  );
  const difficultyData = sortedDifficultyEntries.map(
    ([, data]) => data.accuracy
  );

  const sortedLoEntries = Object.entries(radarData.learning_outcomes).sort(
    ([a], [b]) => a.localeCompare(b)
  ); // Sort theo tên LO để đảm bảo thứ tự nhất quán
  const loLabels = sortedLoEntries.map(
    ([lo, data]) => `${lo} (${data.questions_count} câu)`
  );
  const loData = sortedLoEntries.map(([, data]) => {
    // Tính accuracy thực tế dựa trên logic tương tự tooltip
    let totalAnswered, correctAnswers;

    if (label === "Kết quả của bạn" || label === "Kết quả của tôi") {
      // Current user: tính ngược từ accuracy
      if (data.accuracy === 0) {
        correctAnswers = 0;
        totalAnswered = Math.min(1, data.questions_count);
      } else {
        correctAnswers = Math.round(
          (data.accuracy * data.questions_count) / 100
        );
        totalAnswered = Math.round((correctAnswers * 100) / data.accuracy);
        totalAnswered = Math.min(totalAnswered, data.questions_count);
      }
    } else {
      // Average/Top performer: giả sử trả lời hết
      totalAnswered = data.questions_count;
      correctAnswers = Math.round((data.accuracy * totalAnswered) / 100);
    }

    // Tính accuracy thực tế
    return totalAnswered > 0
      ? Math.round((correctAnswers / totalAnswered) * 100)
      : 0;
  });

  // Thêm performance metrics (bỏ độ chính xác lần đầu)
  const performanceLabels = ["Độ chính xác tổng thể", "Tỷ lệ hoàn thành"];
  const performanceData = [
    radarData.performance_metrics.overall_accuracy,
    radarData.performance_metrics.completion_rate,
  ];

  return {
    labels: [...difficultyLabels, ...loLabels, ...performanceLabels],
    datasets: [
      {
        label,
        data: [...difficultyData, ...loData, ...performanceData],
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 2,
        pointBackgroundColor: colors.pointBackgroundColor,
        pointBorderColor: colors.borderColor,
        pointHoverBackgroundColor: colors.borderColor,
        pointHoverBorderColor: "#fff",
        fill: true,
      },
    ],
  };
}

// Predefined color schemes
export const colorSchemes = {
  primary: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: "rgb(59, 130, 246)",
    pointBackgroundColor: "rgb(59, 130, 246)",
  },
  success: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "rgb(34, 197, 94)",
    pointBackgroundColor: "rgb(34, 197, 94)",
  },
  warning: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    borderColor: "rgb(251, 191, 36)",
    pointBackgroundColor: "rgb(251, 191, 36)",
  },
  danger: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "rgb(239, 68, 68)",
    pointBackgroundColor: "rgb(239, 68, 68)",
  },
  purple: {
    backgroundColor: "rgba(147, 51, 234, 0.2)",
    borderColor: "rgb(147, 51, 234)",
    pointBackgroundColor: "rgb(147, 51, 234)",
  },
};
