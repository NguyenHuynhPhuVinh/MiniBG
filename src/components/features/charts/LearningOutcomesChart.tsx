"use client";

import React, { useState, useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import {
  Loader2,
  Target,
  TrendingUp,
  BarChart3,
  BookOpen,
  Award,
  Users,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import {
  LearningOutcomesChartResponse,
  LearningOutcomeDetailData,
} from "@/lib/types/chapter-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface LearningOutcomesChartProps {
  quizId: number;
  quizName?: string;
  className?: string;
}

export default function LearningOutcomesChart({
  quizId,
  quizName = "Quiz",
  className = "",
}: LearningOutcomesChartProps) {
  // States
  const [chartData, setChartData] =
    useState<LearningOutcomesChartResponse | null>(null);
  const [selectedLO, setSelectedLO] = useState<number | null>(null);
  const [detailData, setDetailData] =
    useState<LearningOutcomeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Fetch chart data (Level 1)
  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await chapterAnalyticsService.getLearningOutcomesChart(
        quizId
      );
      setChartData(response);
    } catch (error) {
      console.error("Error fetching LO chart data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu biểu đồ";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch LO detail data (Level 2)
  const fetchLODetail = async (loId: number) => {
    try {
      setDetailLoading(true);
      const response = await chapterAnalyticsService.getLearningOutcomeDetail(
        quizId,
        loId
      );
      setDetailData(response);
    } catch (error) {
      console.error("Error fetching LO detail:", error);
      showErrorToast("Không thể tải chi tiết Learning Outcome");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchChartData();
    }
  }, [quizId]);

  // Handle bar click (Level 1 -> Level 2)
  const handleBarClick = (loId: number) => {
    setSelectedLO(loId);
    fetchLODetail(loId);
    // Reset expanded groups when switching LO
    setExpandedGroups(new Set());
  };

  // Toggle expanded group
  const toggleExpandedGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Mapping mức độ hiệu suất

  // Helper functions for performance level (from API)
  const getPerformanceColor = (level: string): string => {
    switch (level) {
      case "excellent":
        return "#4CAF50";
      case "good":
        return "#2196F3";
      case "average":
        return "#FF9800";
      case "below_average":
        return "#F97316"; // orange-500
      case "poor":
        return "#EF4444"; // red-500
      case "weak":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getPerformanceBadgeColor = (level: string): string => {
    switch (level) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "average":
        return "text-yellow-600 bg-yellow-100";
      case "below_average":
        return "text-orange-600 bg-orange-100";
      case "poor":
        return "text-red-600 bg-red-100";
      case "weak":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPerformanceLevelColor = (level: string): string => {
    switch (level) {
      case "excellent":
        return "#10B981"; // emerald-500
      case "good":
        return "#3B82F6"; // blue-500
      case "average":
        return "#F59E0B"; // amber-500
      case "below_average":
        return "#F97316"; // orange-500
      case "poor":
        return "#EF4444"; // red-500
      default:
        return "#6B7280"; // gray-500
    }
  };

  const getPerformanceText = (level: string): string => {
    switch (level) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "average":
        return "Trung bình";
      case "below_average":
        return "Dưới trung bình";
      case "poor":
        return "Kém";
      case "weak":
        return "Yếu";
      default:
        return "Chưa xác định";
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3 mx-auto" />
            <p className="text-muted-foreground">Đang tải dữ liệu biểu đồ...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-600 mb-2">
            Lỗi tải dữ liệu
          </p>
          <p className="text-muted-foreground text-center mb-4">{error}</p>
          <Button onClick={fetchChartData} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!chartData) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Chưa có dữ liệu
          </h3>
          <p className="text-muted-foreground">
            Chưa có dữ liệu Chuẩn đầu ra cho quiz này
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get chart data
  const learningOutcomes = chartData.chart_data || [];

  // Prepare Chart.js data: 3 dataset (completed / partial / not started) - Grouped bars
  const chartJSData = {
    labels: learningOutcomes.map((lo) => {
      // Tạo mã LO từ lo_id
      const loCode = `LO${lo.lo_id}`;
      let displayName;

      if (lo.lo_name.startsWith("LO") && /^LO\d+/.test(lo.lo_name)) {
        // Nếu lo_name đã có format LO? thì dùng description hoặc lo_name
        displayName = lo.lo_description || lo.lo_name;
        if (displayName !== lo.lo_name) {
          displayName = `${lo.lo_name} - ${displayName}`;
        }
      } else {
        // Nếu lo_name là tên thực sự thì thêm prefix
        displayName = `${loCode} - ${lo.lo_name}`;
      }

      return displayName.length > 30
        ? displayName.substring(0, 27) + "..."
        : displayName;
    }),
    datasets: [
      {
        label: "Hoàn thành (≥70%)",
        data: learningOutcomes.map((lo: any) => lo.students_completed || 0),
        backgroundColor: "rgba(16, 185, 129, 0.8)", // Màu xanh lá với độ trong suốt
        borderColor: "#059669",
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 60, // Giới hạn độ rộng cột
      },
      {
        label: "Một phần (40-69%)",
        data: learningOutcomes.map((lo: any) => lo.students_partial || 0),
        backgroundColor: "rgba(245, 158, 11, 0.8)", // Màu vàng với độ trong suốt
        borderColor: "#D97706",
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 60,
      },
      {
        label: "Chưa hoàn thành (<40%)",
        data: learningOutcomes.map((lo: any) => lo.students_not_started || 0),
        backgroundColor: "rgba(239, 68, 68, 0.8)", // Màu đỏ với độ trong suốt
        borderColor: "#DC2626",
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 60,
      },
    ],
  };

  // Chart.js options with click handler
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ẩn legend mặc định vì đã có nhãn dưới biểu đồ
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          beforeBody: function (context: any) {
            if (context.length > 0) {
              const lo = learningOutcomes[context[0].dataIndex];
              return [
                `Tỷ lệ: ${lo.completion_rate ?? 0}%`,
                `Số câu: ${lo.total_questions ?? 0}`,
              ];
            }
            return [];
          },
          label: function (context: any) {
            // Không hiển thị label để tránh lặp lại
            return "";
          },
        },
        displayColors: false, // Không hiển thị ô màu
        bodySpacing: 4,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: false, // Thay đổi từ true sang false để tạo biểu đồ đa cột
        title: {
          display: true,
          text: "Số lượng sinh viên",
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        stacked: false, // Thay đổi từ true sang false để tạo biểu đồ đa cột
        title: {
          display: true,
          text: "Chuẩn đầu ra",
        },
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    onClick: (_event: any, elements: any) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        const clickedLO = learningOutcomes[clickedIndex];
        if (clickedLO) {
          handleBarClick(clickedLO.lo_id);
        }
      }
    },
  };

  // Main Chart View với Detail dưới (như StudentGroupBarChart)
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Biểu đồ Chuẩn đầu ra - {quizName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Biểu đồ đa cột hiển thị phân bố sinh viên theo mức độ hoàn thành.
            Click vào cột để xem chi tiết Chuẩn đầu ra
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart.js Bar Chart - Grouped Bars */}
            <div className="h-80">
              {" "}
              {/* Tăng chiều cao để hiển thị tốt hơn biểu đồ đa cột */}
              <Bar data={chartJSData} options={chartOptions} />
            </div>

            {/* Nhãn mô tả dưới biểu đồ */}
            <div className="flex flex-wrap justify-center gap-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500 opacity-80"></div>
                <span className="text-sm text-gray-600">Hoàn thành (≥70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500 opacity-80"></div>
                <span className="text-sm text-gray-600">Một phần (40-69%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500 opacity-80"></div>
                <span className="text-sm text-gray-600">
                  Chưa hoàn thành (&lt;40%)
                </span>
              </div>
            </div>

            {/* LO Overview Cards - disabled as per request */}
            {false && learningOutcomes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningOutcomes.map((lo: any) => (
                  <div
                    key={lo.lo_id}
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleBarClick(lo.lo_id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {lo.lo_name}
                      </h4>
                      <span
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{
                          backgroundColor: getPerformanceLevelColor(
                            lo.performance_level
                          ),
                        }}
                      >
                        {lo.completion_rate}%
                      </span>
                    </div>
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {lo.difficulty_level && (
                        <Badge variant="outline" className="text-xs">
                          Độ khó: {lo.difficulty_level}
                        </Badge>
                      )}
                      {lo.strength_weakness?.is_strength && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          Điểm mạnh
                        </Badge>
                      )}
                      {lo.strength_weakness?.is_weakness && (
                        <Badge className="text-xs bg-red-100 text-red-700">
                          Điểm yếu
                        </Badge>
                      )}
                      {lo.strength_weakness?.needs_attention && (
                        <Badge variant="outline" className="text-xs">
                          Ưu tiên:{" "}
                          {lo.strength_weakness.priority_level === "critical"
                            ? "Rất cao"
                            : lo.strength_weakness.priority_level === "high"
                            ? "Cao"
                            : lo.strength_weakness.priority_level === "medium"
                            ? "Trung bình"
                            : "Thấp"}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Hoàn thành:</span>
                        <span className="font-medium text-green-600">
                          {lo.students_completed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Một phần:</span>
                        <span className="font-medium text-yellow-600">
                          {lo.students_partial}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chưa hoàn thành:</span>
                        <span className="font-medium text-red-600">
                          {lo.students_not_started}
                        </span>
                      </div>
                      {lo.teaching_recommendation && (
                        <div className="pt-2 text-[11px] text-gray-500 line-clamp-2">
                          Gợi ý: {lo.teaching_recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Removed quick list để tránh trùng với LO cards và chart selection */}
          </div>
        </CardContent>
      </Card>

      {/* Selected LO Details (hiển thị dưới chart) */}
      {selectedLO && (
        <Card>
          <CardContent>
            {detailLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-3 mx-auto" />
                  <p className="text-muted-foreground">Đang tải chi tiết...</p>
                </div>
              </div>
            ) : detailData ? (
              <div className="space-y-6">
                {/* Related Chapters */}
                {Array.isArray(detailData.lo_info.related_chapters) &&
                  detailData.lo_info.related_chapters.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Chương liên quan
                      </h4>
                      <div className="space-y-4">
                        {detailData.lo_info.related_chapters.map((ch) => (
                          <div
                            key={ch.chapter_id}
                            className="border rounded-lg p-4 bg-blue-50 border-blue-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                                {ch.chapter_name}
                              </h5>
                              {ch.subject?.subject_name && (
                                <Badge
                                  variant="outline"
                                  className="text-blue-700 border-blue-300"
                                >
                                  {ch.subject.subject_name}
                                </Badge>
                              )}
                            </div>

                            {Array.isArray(ch.sections) &&
                              ch.sections.length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    Các mục trong chương:
                                  </p>
                                  <div className="space-y-1">
                                    {ch.sections.map((s, index) => {
                                      // Extract section number and title from content_preview or title
                                      const fullText =
                                        s.title ||
                                        s.content_preview ||
                                        `Mục ${index + 1}`;

                                      // Try to extract section number (2.1, 2.2, etc.)
                                      const sectionMatch =
                                        fullText.match(/(\d+\.\d+)/);
                                      const sectionNumber = sectionMatch
                                        ? sectionMatch[1]
                                        : `${index + 1}`;

                                      // Get the description part (after the dash or the whole content_preview)
                                      let description =
                                        s.content_preview || s.title || "";
                                      if (description.includes(" - ")) {
                                        description =
                                          description.split(" - ")[1];
                                      } else if (
                                        description.match(/^\d+\.\d+\s+/)
                                      ) {
                                        description = description.replace(
                                          /^\d+\.\d+\s+/,
                                          ""
                                        );
                                      }

                                      return (
                                        <div
                                          key={s.section_id || index}
                                          className="flex items-start gap-3 p-3 bg-white rounded border border-gray-100 hover:shadow-sm transition-shadow"
                                        >
                                          <span className="flex-shrink-0 w-8 text-center text-sm font-medium text-blue-600">
                                            {sectionNumber}
                                          </span>
                                          <div className="flex-1">
                                            <span className="text-sm text-gray-800 leading-relaxed">
                                              {description}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Quick Stats Summary */}
                {Array.isArray(detailData.question_breakdown) &&
                  detailData.question_breakdown.length > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">
                            {detailData.question_breakdown.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Tổng câu hỏi
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {(() => {
                              const avgAccuracy =
                                detailData.question_breakdown.reduce(
                                  (sum: number, q: any) =>
                                    sum + (q.accuracy || 0),
                                  0
                                ) / detailData.question_breakdown.length;
                              return avgAccuracy.toFixed(1);
                            })()}
                            %
                          </div>
                          <div className="text-sm text-gray-600">
                            Độ chính xác TB
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {
                              detailData.question_breakdown.filter(
                                (q: any) => (q.accuracy || 0) >= 70
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            Câu tốt (≥70%)
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {
                              detailData.question_breakdown.filter(
                                (q: any) => (q.accuracy || 0) < 40
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            Câu yếu (&lt;40%)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Question Breakdown with Chapter Relationship */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Phân tích chi tiết từng câu hỏi
                  </h4>
                  <div className="space-y-4">
                    {Array.isArray(detailData.question_breakdown) ? (
                      detailData.question_breakdown.map(
                        (question: any, index: number) => (
                          <div
                            key={question.question_id || index}
                            className="border rounded-lg p-4 bg-white shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900">
                                    Câu {index + 1}
                                  </p>
                                  {question.chapter_info && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {question.chapter_info.chapter_name ||
                                        "Chương không xác định"}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {question.question_text}
                                </p>
                                {question.chapter_info?.section_name && (
                                  <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                    📖 {question.chapter_info.section_name}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge
                                  variant="outline"
                                  className={
                                    question.difficulty === "easy"
                                      ? "text-green-600 border-green-300"
                                      : question.difficulty === "medium"
                                      ? "text-yellow-600 border-yellow-300"
                                      : question.difficulty === "hard"
                                      ? "text-red-600 border-red-300"
                                      : "text-gray-600"
                                  }
                                >
                                  {question.difficulty === "easy"
                                    ? "Dễ"
                                    : question.difficulty === "medium"
                                    ? "Trung bình"
                                    : question.difficulty === "hard"
                                    ? "Khó"
                                    : question.difficulty}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="text-sm">
                                <span className="text-gray-600">
                                  Độ chính xác:{" "}
                                </span>
                                <span
                                  className={`font-semibold ${
                                    (question.accuracy || 0) >= 70
                                      ? "text-green-600"
                                      : (question.accuracy || 0) >= 40
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {question.accuracy?.toFixed(1) || 0}%
                                </span>
                              </div>
                              <div className="text-sm text-right">
                                <span className="text-gray-600">Đạt: </span>
                                <span className="font-semibold">
                                  {question.correct_count || 0}/
                                  {question.total_attempts || 0}
                                </span>
                              </div>
                            </div>

                            <Progress
                              value={question.accuracy || 0}
                              className="h-3"
                            />

                            {question.common_mistakes &&
                              question.common_mistakes.length > 0 && (
                                <div className="mt-3 p-2 bg-red-50 rounded border-l-4 border-red-200">
                                  <p className="text-xs font-medium text-red-800 mb-1">
                                    Lỗi thường gặp:
                                  </p>
                                  <ul className="text-xs text-red-700 space-y-1">
                                    {question.common_mistakes
                                      .slice(0, 2)
                                      .map((mistake: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="flex items-start gap-1"
                                        >
                                          <span className="text-red-500 mt-0.5">
                                            •
                                          </span>
                                          <span>{mistake}</span>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          Không có dữ liệu câu hỏi cho Chuẩn đầu ra này
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bỏ Phân tích nhóm HS + Nhận xét/Khuyến nghị theo yêu cầu */}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Không có dữ liệu chi tiết cho Chuẩn đầu ra này
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bỏ Teacher Insights theo yêu cầu */}
    </div>
  );
}
