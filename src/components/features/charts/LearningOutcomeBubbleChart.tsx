"use client";

import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bubble } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
// import { Badge } from "@/components/ui/feedback";
import {
  Target,
  BarChart3,
  ChevronUp,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Filter,
} from "lucide-react";
import { ChapterAnalysisData } from "@/lib/types/chapter-analytics";

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

interface LearningOutcomeBubbleChartProps {
  analysisData: ChapterAnalysisData;
  className?: string;
}

interface BubbleDataPoint {
  id: string;
  type: "learning_outcome" | "difficulty" | "chapter";
  name: string;
  full_name?: string;
  x: number; // Accuracy percentage
  y: number; // LO index or category index
  r: number; // Question count (bubble size)
  accuracy: number;
  total_questions: number;
  correct_answers: number;
  performance_level: string;
  difficulty_level?: string;
  chapter_name?: string;
  related_info?: any;
}

const LearningOutcomeBubbleChart = React.memo(
  function LearningOutcomeBubbleChart({
    analysisData,
    className = "",
  }: LearningOutcomeBubbleChartProps) {
    const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<
      "all" | "learning_outcome" | "difficulty" | "chapter"
    >("all");

    // Helper to detect if we have NEW API data
    const hasNewAPIData = useMemo(() => {
      return !!(
        analysisData.learning_outcome_analysis?.strengths?.length ||
        analysisData.learning_outcome_analysis?.weaknesses?.length
      );
    }, [analysisData.learning_outcome_analysis]);

    // Prepare bubble data
    const bubbleData = useMemo(() => {
      const bubbles: BubbleDataPoint[] = [];
      const seenItems = new Set<string>(); // Track seen items to avoid duplicates

      // Add Learning Outcomes
      if (hasNewAPIData && analysisData.learning_outcome_analysis) {
        const allLOs = [
          ...(analysisData.learning_outcome_analysis.strengths || []),
          ...(analysisData.learning_outcome_analysis.weaknesses || []),
        ];

        allLOs.forEach((lo) => {
          const itemKey = `lo_${lo.lo_id}`;
          if (!seenItems.has(itemKey)) {
            seenItems.add(itemKey);
            bubbles.push({
              id: itemKey,
              type: "learning_outcome",
              name: lo.lo_name || `LO${lo.lo_id}`,
              full_name: `${lo.lo_name || `LO${lo.lo_id}`} - ${
                lo.lo_description || lo.lo_name || "Learning Outcome"
              }`,
              x: lo.accuracy_percentage,
              y: bubbles.length, // Use bubbles.length for consistent Y positioning
              r: Math.max(8, Math.min(35, Math.sqrt(lo.total_questions) * 4)), // Better scaling
              accuracy: lo.accuracy_percentage,
              total_questions: lo.total_questions,
              correct_answers: lo.correct_answers,
              performance_level: lo.performance_level,
              related_info: lo,
            });
          }
        });
      }

      // Add Difficulty Levels
      if (hasNewAPIData && analysisData.difficulty_analysis) {
        const allDifficulties = [
          ...(analysisData.difficulty_analysis.strengths || []),
          ...(analysisData.difficulty_analysis.weaknesses || []),
        ];

        allDifficulties.forEach((diff) => {
          const itemKey = `diff_${diff.level_id}`;
          if (!seenItems.has(itemKey)) {
            seenItems.add(itemKey);
            bubbles.push({
              id: itemKey,
              type: "difficulty",
              name: `Độ khó: ${diff.level_name}`,
              x: diff.accuracy_percentage,
              y: bubbles.length, // Use bubbles.length for consistent Y positioning
              r: Math.max(8, Math.min(35, Math.sqrt(diff.total_questions) * 4)),
              accuracy: diff.accuracy_percentage,
              total_questions: diff.total_questions,
              correct_answers: diff.correct_answers,
              performance_level: diff.performance_level,
              difficulty_level: diff.level_name,
              related_info: diff,
            });
          }
        });
      }

      // Add Chapters
      if (analysisData.chapter_analysis) {
        const allChapters = [
          ...(analysisData.chapter_analysis.strengths || []),
          ...(analysisData.chapter_analysis.weaknesses || []),
        ];

        allChapters.forEach((chapter) => {
          const itemKey = `chapter_${chapter.chapter_id}`;
          if (!seenItems.has(itemKey)) {
            seenItems.add(itemKey);
            bubbles.push({
              id: itemKey,
              type: "chapter",
              name: `Chương: ${chapter.chapter_name}`,
              x: chapter.accuracy_percentage,
              y: bubbles.length, // Use bubbles.length for consistent Y positioning
              r: Math.max(
                8,
                Math.min(35, Math.sqrt(chapter.total_questions) * 4)
              ),
              accuracy: chapter.accuracy_percentage,
              total_questions: chapter.total_questions,
              correct_answers: chapter.correct_answers,
              performance_level: chapter.performance_level || "average",
              chapter_name: chapter.chapter_name,
              related_info: chapter,
            });
          }
        });
      }

      return bubbles;
    }, [hasNewAPIData, analysisData]);

    // Filter bubbles based on selected filter
    const filteredBubbles = useMemo(() => {
      if (filterType === "all") return bubbleData;
      return bubbleData.filter((bubble) => bubble.type === filterType);
    }, [bubbleData, filterType]);

    // Prepare Chart.js data
    const chartData = useMemo(() => {
      const datasets = [];

      // Re-assign Y positions for filtered bubbles to avoid gaps
      const bubblesWithNewY = filteredBubbles.map((bubble, index) => ({
        ...bubble,
        y: index, // Sequential Y positions for filtered bubbles
      }));

      // Group bubbles by type for different colors
      const loData = bubblesWithNewY.filter(
        (b) => b.type === "learning_outcome"
      );
      const diffData = bubblesWithNewY.filter((b) => b.type === "difficulty");
      const chapterData = bubblesWithNewY.filter((b) => b.type === "chapter");

      if (loData.length > 0) {
        datasets.push({
          label: "Learning Outcomes",
          data: loData.map((bubble) => ({
            x: bubble.x,
            y: bubble.y,
            r: bubble.r,
            bubble: bubble,
          })),
          backgroundColor: "rgba(33, 150, 243, 0.6)",
          borderColor: "rgba(33, 150, 243, 1)",
          borderWidth: 2,
        });
      }

      if (diffData.length > 0) {
        datasets.push({
          label: "Độ khó",
          data: diffData.map((bubble) => ({
            x: bubble.x,
            y: bubble.y,
            r: bubble.r,
            bubble: bubble,
          })),
          backgroundColor: "rgba(255, 152, 0, 0.6)",
          borderColor: "rgba(255, 152, 0, 1)",
          borderWidth: 2,
        });
      }

      if (chapterData.length > 0) {
        datasets.push({
          label: "Chương",
          data: chapterData.map((bubble) => ({
            x: bubble.x,
            y: bubble.y,
            r: bubble.r,
            bubble: bubble,
          })),
          backgroundColor: "rgba(76, 175, 80, 0.6)",
          borderColor: "rgba(76, 175, 80, 1)",
          borderWidth: 2,
        });
      }

      return { datasets, bubblesWithNewY };
    }, [filteredBubbles]);

    // Chart options
    const chartOptions = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_event: any, elements: any) => {
          if (elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const dataIndex = element.index;
            const bubble =
              chartData.datasets[datasetIndex].data[dataIndex].bubble;
            setSelectedBubble(selectedBubble === bubble.id ? null : bubble.id);
          }
        },
        plugins: {
          title: {
            display: true,
            text: "Biểu đồ Bong bóng - Phân tích Hiệu suất Toàn diện",
            font: {
              size: 16,
              weight: "bold" as const,
            },
          },
          legend: {
            display: true,
            position: "top" as const,
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const bubble = context.raw.bubble;
                return [
                  `${bubble.full_name || bubble.name}`,
                  `Độ chính xác: ${bubble.accuracy.toFixed(1)}%`,
                  `Câu hỏi: ${bubble.total_questions}`,
                  `Câu đúng: ${bubble.correct_answers}`,
                  `Hiệu suất: ${bubble.performance_level}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear" as const,
            position: "bottom" as const,
            min: 0,
            max: 100,
            title: {
              display: true,
              text: "Độ chính xác (%)",
              font: {
                size: 14,
                weight: "bold" as const,
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            ticks: {
              callback: function (value: any) {
                return value + "%";
              },
            },
          },
          y: {
            type: "linear" as const,
            min: -0.5,
            max: Math.max(5, chartData.bubblesWithNewY?.length - 0.5 || 0),
            title: {
              display: true,
              text: "Các khía cạnh học tập",
              font: {
                size: 14,
                weight: "bold" as const,
              },
            },
            ticks: {
              callback: function (value: any) {
                const index = Math.round(value);
                const bubble = chartData.bubblesWithNewY?.[index];
                return bubble ? bubble.name : "";
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
        },
      }),
      [chartData, selectedBubble]
    );

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Biểu đồ Bong bóng - Phân tích Toàn diện
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Trực quan hóa 4 chiều: Độ chính xác (X), Khía cạnh (Y), Số câu hỏi
            (Kích thước), Loại (Màu sắc)
          </p>
        </CardHeader>

        <CardContent>
          <div className="w-full space-y-6">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Lọc theo:
              </span>
              {[
                { key: "all", label: "Tất cả" },
                { key: "learning_outcome", label: "Learning Outcomes" },
                { key: "difficulty", label: "Độ khó" },
                { key: "chapter", label: "Chương" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterType === filter.key
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Bubble Chart */}
            {filteredBubbles.length > 0 && (
              <div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div
                    className="min-h-96"
                    style={{
                      height: `${Math.max(
                        384,
                        filteredBubbles.length * 60 + 100
                      )}px`,
                    }}
                  >
                    <Bubble
                      data={{ datasets: chartData.datasets }}
                      options={chartOptions}
                    />
                  </div>
                </div>

                {/* Chart Legend & Instructions */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    📊 Hướng dẫn đọc biểu đồ:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <p>
                        <strong>Trục X (Ngang):</strong> Độ chính xác (%)
                      </p>
                      <p>
                        <strong>Trục Y (Dọc):</strong> Các khía cạnh học tập
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Kích thước bong bóng:</strong> Số lượng câu hỏi
                      </p>
                      <p>
                        <strong>Màu sắc:</strong> Loại khía cạnh (LO/Độ
                        khó/Chương)
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
                    <p className="text-xs text-yellow-800">
                      💡 <strong>Mẹo:</strong> Ưu tiên ôn tập những bong bóng{" "}
                      <strong>lớn</strong> (nhiều câu hỏi) nằm{" "}
                      <strong>bên trái</strong> (độ chính xác thấp) - đây là
                      những lỗ hổng kiến thức quan trọng nhất!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Bubble Details */}
            {selectedBubble && (
              <div>
                {(() => {
                  const selectedItem = chartData.bubblesWithNewY?.find(
                    (bubble) => bubble.id === selectedBubble
                  );
                  if (!selectedItem) return null;

                  return (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {selectedItem.type === "learning_outcome" && (
                            <Target className="h-5 w-5 text-blue-600" />
                          )}
                          {selectedItem.type === "difficulty" && (
                            <BarChart3 className="h-5 w-5 text-orange-600" />
                          )}
                          {selectedItem.type === "chapter" && (
                            <BookOpen className="h-5 w-5 text-green-600" />
                          )}
                          Chi tiết:{" "}
                          {selectedItem.full_name || selectedItem.name}
                        </h3>
                        <button
                          onClick={() => setSelectedBubble(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ChevronUp className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">
                              Độ chính xác
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedItem.accuracy.toFixed(1)}%
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-sm">
                              Câu đúng
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {selectedItem.correct_answers}/
                            {selectedItem.total_questions}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-sm">
                              Tổng câu hỏi
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedItem.total_questions}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            <span className="font-medium text-sm">Mức độ</span>
                          </div>
                          <div className="text-lg font-bold text-purple-600">
                            {selectedItem.performance_level === "excellent"
                              ? "Xuất sắc"
                              : selectedItem.performance_level === "good"
                              ? "Tốt"
                              : selectedItem.performance_level === "average"
                              ? "Trung bình"
                              : "Cần cải thiện"}
                          </div>
                        </div>
                      </div>

                      {/* Priority Analysis */}
                      <div className="bg-white p-4 rounded-lg border mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          🎯 Phân tích mức độ ưu tiên
                        </h4>
                        <div className="space-y-2">
                          {(() => {
                            const priority =
                              selectedItem.accuracy < 50 &&
                              selectedItem.total_questions > 10
                                ? "critical"
                                : selectedItem.accuracy < 70 &&
                                  selectedItem.total_questions > 5
                                ? "high"
                                : selectedItem.accuracy < 80
                                ? "medium"
                                : "low";

                            const priorityConfig = {
                              critical: {
                                color: "text-red-600",
                                bg: "bg-red-100",
                                icon: "🚨",
                                text: "Ưu tiên CỰC CAO",
                                description:
                                  "Lỗ hổng kiến thức nghiêm trọng với nhiều câu hỏi. Cần ôn tập ngay lập tức!",
                              },
                              high: {
                                color: "text-orange-600",
                                bg: "bg-orange-100",
                                icon: "⚠️",
                                text: "Ưu tiên CAO",
                                description:
                                  "Cần cải thiện đáng kể. Dành thời gian ôn tập trong tuần này.",
                              },
                              medium: {
                                color: "text-yellow-600",
                                bg: "bg-yellow-100",
                                icon: "📝",
                                text: "Ưu tiên TRUNG BÌNH",
                                description:
                                  "Có thể cải thiện thêm. Ôn tập khi có thời gian rảnh.",
                              },
                              low: {
                                color: "text-green-600",
                                bg: "bg-green-100",
                                icon: "✅",
                                text: "Ưu tiên THẤP",
                                description:
                                  "Đã làm tốt! Chỉ cần duy trì kiến thức hiện tại.",
                              },
                            };

                            const config = priorityConfig[priority];

                            return (
                              <div className={`p-3 rounded-lg ${config.bg}`}>
                                <div
                                  className={`font-semibold ${config.color} mb-1`}
                                >
                                  {config.icon} {config.text}
                                </div>
                                <p className="text-sm text-gray-700">
                                  {config.description}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Performance Analysis */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          📈 Phân tích hiệu suất chi tiết
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                          {selectedItem.accuracy >= 80
                            ? "🎉 Xuất sắc! Bạn đã nắm vững kiến thức này rất tốt."
                            : selectedItem.accuracy >= 70
                            ? "👍 Tốt! Bạn đã hiểu khá tốt nội dung này."
                            : selectedItem.accuracy >= 50
                            ? "⚠️ Trung bình. Bạn cần ôn tập thêm để nắm chắc kiến thức."
                            : "🔴 Cần cải thiện khẩn cấp. Hãy dành thời gian ôn tập kỹ phần này."}
                        </p>

                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">
                            💡 Gợi ý cải thiện cụ thể:
                          </h5>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedItem.type === "learning_outcome" && (
                              <>
                                <li>
                                  • 📚 Ôn tập lại các khái niệm cơ bản của
                                  Learning Outcome này
                                </li>
                                <li>
                                  • 💻 Làm thêm bài tập thực hành để củng cố
                                  kiến thức
                                </li>
                                <li>
                                  • 📖 Tìm hiểu thêm tài liệu tham khảo liên
                                  quan
                                </li>
                                <li>
                                  • 👥 Thảo luận với bạn bè hoặc giảng viên về
                                  những điểm chưa rõ
                                </li>
                              </>
                            )}
                            {selectedItem.type === "difficulty" && (
                              <>
                                <li>
                                  • 🎯 Luyện tập với các bài tập cùng mức độ khó
                                </li>
                                <li>
                                  • 🔍 Phân tích kỹ các bước giải quyết vấn đề
                                </li>
                                <li>
                                  • 🧠 Tìm hiểu các phương pháp giải khác nhau
                                </li>
                                <li>
                                  • ⏰ Luyện tập quản lý thời gian cho loại câu
                                  hỏi này
                                </li>
                              </>
                            )}
                            {selectedItem.type === "chapter" && (
                              <>
                                <li>
                                  • 📑 Đọc lại nội dung chương một cách có hệ
                                  thống
                                </li>
                                <li>
                                  • ✍️ Làm bài tập cuối chương để kiểm tra hiểu
                                  biết
                                </li>
                                <li>
                                  • 🔗 Liên hệ với các chương khác để hiểu tổng
                                  thể
                                </li>
                                <li>
                                  • 📝 Tạo mind map hoặc tóm tắt nội dung chương
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* No data message */}
            {filteredBubbles.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không có dữ liệu phân tích
                </h3>
                <p className="text-gray-600">
                  Chưa có dữ liệu Learning Outcomes, Độ khó hoặc Chương để hiển
                  thị trong biểu đồ bong bóng.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

export default LearningOutcomeBubbleChart;
