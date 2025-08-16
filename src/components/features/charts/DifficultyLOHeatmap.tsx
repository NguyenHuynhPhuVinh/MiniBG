"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  Loader2,
  BarChart3,
  AlertCircle,
  Grid3X3,
  BookOpen,
  RefreshCw,
  Check,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { showErrorToast } from "@/lib/utils/toast-utils";
import QuestionsList from "./QuestionsList";

interface DifficultyLOHeatmapProps {
  quizId: number;
  className?: string;
}

interface MatrixDataItem {
  lo_id: number;
  lo_name: string;
  level_id: number;
  level_name: string;
  question_count: number;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  average_time_seconds: number;
  color: string;
  intensity: number;
  difficulty_assessment: string;
  cell_size: number;
  students_attempted: number;
  success_rate: number;
  difficulty_score: number;
  cell_label: string;
  tooltip_text: string;
  questions: Array<{
    question_id: number;
    question_text: string;
    answers?: Array<{
      answer_id: number;
      answer_text: string;
      iscorrect: boolean;
    }>;
  }>;
}

interface LearningOutcome {
  lo_id: number;
  lo_name: string;
  lo_description: string;
}

interface DifficultyLevel {
  level_id: number;
  level_name: string;
}

interface DistributionStats {
  total_questions: number;
  total_students: number;
  lo_distribution: Record<string, number>;
  level_distribution: Record<string, number>;
  balance_analysis: {
    easy_questions: number;
    medium_questions: number;
    hard_questions: number;
    easy_percentage: number;
    medium_percentage: number;
    hard_percentage: number;
    balance_assessment: string;
  };
}

interface DifficultyLODistributionData {
  quiz_info: {
    quiz_id: number;
    name: string;
    total_questions: number;
  };
  matrix_data: MatrixDataItem[];
  chart_config: {
    x_axis: string;
    y_axis: string;
    value_field: string;
    color_field: string;
    chart_type: string;
    tooltip_fields: string[];
  };
  axes_data: {
    learning_outcomes: LearningOutcome[];
    difficulty_levels: DifficultyLevel[];
  };
  distribution_stats: DistributionStats;
  insights: string[];
  recommendations: Array<{
    type: string;
    suggestion: string;
    priority: string;
  }>;
}

const DifficultyLOHeatmap: React.FC<DifficultyLOHeatmapProps> = ({
  quizId,
  className = "",
}) => {
  const [data, setData] = useState<DifficultyLODistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<MatrixDataItem | null>(null);
  const [loadingQuestionDetails, setLoadingQuestionDetails] =
    useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Fetch detailed questions for selected cell
  const fetchDetailedQuestions = async (cell: MatrixDataItem) => {
    try {
      setLoadingQuestionDetails(true);

      const detailedQuestions =
        await chapterAnalyticsService.getQuestionsByDifficultyAndLO(
          quizId,
          cell.lo_id,
          cell.level_id
        );

      // Update the selected cell with detailed questions including answers
      setSelectedCell({
        ...cell,
        questions: detailedQuestions.map((q: any) => ({
          question_id: q.question_id,
          question_text: q.question_text,
          answers: q.answers,
        })),
      });
    } catch (error: any) {
      console.error("Error fetching detailed questions:", error);
      showErrorToast("Không thể tải chi tiết câu hỏi");
    } finally {
      setLoadingQuestionDetails(false);
    }
  };

  const handleCellClick = useCallback(
    async (cell: MatrixDataItem) => {
      if (
        selectedCell?.lo_id === cell.lo_id &&
        selectedCell?.level_id === cell.level_id
      ) {
        setSelectedCell(null); // Collapse if clicking the same cell
      } else {
        setSelectedCell(cell); // Set cell first for immediate UI feedback

        // Fetch detailed questions with answers
        await fetchDetailedQuestions(cell);
      }
    },
    [selectedCell, quizId]
  );

  useEffect(() => {
    fetchHeatmapData();
  }, [quizId]);

  useEffect(() => {
    if (data && svgRef.current) {
      createHeatmap();
    }
  }, [data, selectedCell, handleCellClick]);

  // Redraw on container resize for responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    // Use ResizeObserver for responsive redraw
    if (typeof ResizeObserver !== "undefined") {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (data) createHeatmap();
      });
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
      }
    };
  }, [data, selectedCell, handleCellClick]);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching difficulty-LO distribution data for quiz:", quizId);

      const response =
        await chapterAnalyticsService.getDifficultyLODistribution(quizId);
      console.log("Difficulty-LO distribution data received:", response);

      setData(response);
    } catch (error: any) {
      console.error("Error fetching difficulty-LO distribution data:", error);
      setError(error.message || "Không thể tải dữ liệu phân bố độ khó - LO");
      showErrorToast(
        error.message || "Không thể tải dữ liệu phân bố độ khó - LO"
      );
    } finally {
      setLoading(false);
    }
  };

  const createHeatmap = () => {
    if (!data || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Layout and responsive sizing
    const margin = { top: 20, right: 20, bottom: 80, left: 120 };
    const containerWidth = containerRef.current?.clientWidth || 800;
    const xCategories = data.axes_data.learning_outcomes.map(
      (lo) => lo.lo_name
    );
    const yCategories = data.axes_data.difficulty_levels.map(
      (level) => level.level_name
    );

    // Adaptive cell sizes
    const minCellWidth = 48;
    const minCellHeight = 36;
    const width =
      Math.max(xCategories.length * minCellWidth, containerWidth - 40) -
      margin.left -
      margin.right;
    const height =
      Math.max(yCategories.length * minCellHeight, 240) -
      margin.top -
      margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(xCategories)
      .range([0, width])
      .padding(0.1);
    const yScale = d3
      .scaleBand()
      .domain(yCategories)
      .range([height, 0])
      .padding(0.1);

    // Color scale based on question count (knowledge distribution)
    const maxQuestionCount = Math.max(
      ...data.matrix_data.map((d) => d.question_count)
    );
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, maxQuestionCount]);

    // Helper: pick contrasting text color based on fill
    const getTextColor = (questionCount: number) => {
      const col = d3.color(colorScale(questionCount)) as d3.RGBColor | null;
      if (!col) return "#000";
      const r = col.r / 255,
        gCol = col.g / 255,
        b = col.b / 255;
      const [R, G, B] = [r, gCol, b].map((v) =>
        v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      );
      const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      return luminance > 0.5 ? "#111827" : "#FFFFFF"; // slate-900 or white
    };

    // Gridlines for bands
    g.append("g")
      .selectAll("line.h-grid")
      .data(xCategories)
      .enter()
      .append("line")
      .attr("class", "h-grid")
      .attr("x1", (d) => xScale(d) || 0)
      .attr("y1", 0)
      .attr("x2", (d) => xScale(d) || 0)
      .attr("y2", height)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("opacity", 0.6);

    g.append("g")
      .selectAll("line.v-grid")
      .data(yCategories)
      .enter()
      .append("line")
      .attr("class", "v-grid")
      .attr("x1", 0)
      .attr("y1", (d) => yScale(d) || 0)
      .attr("x2", width)
      .attr("y2", (d) => yScale(d) || 0)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("opacity", 0.6);

    // Single tooltip node (managed by D3 but owned by React via ref)
    if (!tooltipRef.current) {
      const el = document.createElement("div");
      el.className =
        "pointer-events-none fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm max-w-xs opacity-0 transition-opacity";
      document.body.appendChild(el);
      tooltipRef.current = el;
    }

    const showTooltip = (event: any, d: MatrixDataItem) => {
      if (!tooltipRef.current) return;
      tooltipRef.current.innerHTML = `
        <div class="font-bold mb-2">${d.lo_name} - ${d.level_name}</div>
        <div class="space-y-1">
          <div>Số câu hỏi: <span class="font-semibold">${
            d.question_count
          }</span></div>
          <div>Phân bổ: <span class="font-semibold">${(
            (d.question_count / data.quiz_info.total_questions) *
            100
          ).toFixed(1)}%</span></div>
        </div>
      `;
      const padding = 10;
      const x = event.pageX + padding;
      const y = event.pageY - 28;
      tooltipRef.current.style.left = `${x}px`;
      tooltipRef.current.style.top = `${y}px`;
      tooltipRef.current.style.opacity = "1";
    };

    const hideTooltip = () => {
      if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
    };

    // Cells
    g.selectAll("rect.heatmap-cell")
      .data(data.matrix_data)
      .enter()
      .append("rect")
      .attr("class", "heatmap-cell")
      .attr("x", (d: MatrixDataItem) => xScale(d.lo_name) || 0)
      .attr("y", (d: MatrixDataItem) => yScale(d.level_name) || 0)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d: MatrixDataItem) => {
        const isSelected =
          selectedCell?.lo_id === d.lo_id &&
          selectedCell?.level_id === d.level_id;
        return isSelected
          ? d3.color(colorScale(d.question_count))?.brighter(0.3).toString() ||
              colorScale(d.question_count)
          : colorScale(d.question_count);
      })
      .attr("stroke", (d: MatrixDataItem) =>
        selectedCell?.lo_id === d.lo_id && selectedCell?.level_id === d.level_id
          ? "#3b82f6"
          : "#e5e7eb"
      )
      .attr("stroke-width", (d: MatrixDataItem) =>
        selectedCell?.lo_id === d.lo_id && selectedCell?.level_id === d.level_id
          ? 4
          : 1
      )
      .style("filter", (d: MatrixDataItem) =>
        selectedCell?.lo_id === d.lo_id && selectedCell?.level_id === d.level_id
          ? "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))"
          : "none"
      )
      .style("cursor", "pointer")
      .on("mouseover", function (event: any, d: MatrixDataItem) {
        const isSelected =
          selectedCell?.lo_id === d.lo_id &&
          selectedCell?.level_id === d.level_id;
        if (!isSelected) {
          d3.select(this)
            .attr("stroke-width", 3)
            .style("filter", "brightness(1.05)");
        }
        showTooltip(event, d);
      })
      .on("mousemove", function (event: any, d: MatrixDataItem) {
        showTooltip(event, d);
      })
      .on("mouseout", function (_event: any, d: MatrixDataItem) {
        const isSelected =
          selectedCell?.lo_id === d.lo_id &&
          selectedCell?.level_id === d.level_id;
        if (!isSelected) {
          d3.select(this).attr("stroke-width", 1).style("filter", "none");
        }
        hideTooltip();
      })
      .on("click", (_event: any, d: MatrixDataItem) => {
        handleCellClick(d);
      })
      .append("title")
      .text((d) => `${d.lo_name} - ${d.level_name}`);

    // Question count labels with contrast-aware color
    g.selectAll("text.count-label")
      .data(data.matrix_data)
      .enter()
      .append("text")
      .attr("class", "count-label")
      .attr(
        "x",
        (d: MatrixDataItem) => (xScale(d.lo_name) || 0) + xScale.bandwidth() / 2
      )
      .attr(
        "y",
        (d: MatrixDataItem) =>
          (yScale(d.level_name) || 0) + yScale.bandwidth() / 2
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", (d: MatrixDataItem) => getTextColor(d.question_count))
      .attr("font-weight", "700")
      .attr("font-size", "13px")
      .text((d: MatrixDataItem) => d.question_count)
      .style("pointer-events", "none");

    // Axes with improved label management
    const xAxis = d3.axisBottom(xScale).tickFormat((d: any) => {
      const label = String(d);
      return label.length > 12 ? label.slice(0, 12) + "…" : label;
    });

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-35)")
      .style("font-size", "12px")
      .append("title")
      .text((d: any) => String(d));

    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "12px");

    // Legend gradient (0 to max question count)
    const legendHeight = 10;
    const legendWidth = Math.min(240, Math.max(160, width * 0.4));
    const legendX = (width - legendWidth) / 2;
    const legendY = height + 30;

    const defs = svg.append("defs");
    const gradientId = "question-count-gradient";
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    [0, 0.25, 0.5, 0.75, 1].forEach((p) => {
      linearGradient
        .append("stop")
        .attr("offset", `${p * 100}%`)
        .attr("stop-color", colorScale(p * maxQuestionCount));
    });

    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    legendGroup
      .append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", `url(#${gradientId})`);

    const legendScale = d3
      .scaleLinear()
      .domain([0, maxQuestionCount])
      .range([legendX, legendX + legendWidth]);
    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat((d) => `${d}`);

    legendGroup
      .append("g")
      .attr("transform", `translate(0, ${legendY + legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "10px");
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Đang tải dữ liệu phân bố...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchHeatmapData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <p>Không có dữ liệu phân bố</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Heatmap Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-primary" />
            Ma trận phân bổ kiến thức theo độ khó và Chuẩn đầu ra
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Hiển thị phân bổ số lượng câu hỏi. Hover để xem chi tiết, click vào
            ô để chọn và xem thông tin chi tiết bên dưới
          </p>
        </CardHeader>
        <CardContent>
          <div ref={containerRef} className="w-full">
            <svg
              ref={svgRef}
              className="w-full"
              role="img"
              aria-label="Ma trận phân bổ kiến thức theo độ khó và Chuẩn đầu ra"
            ></svg>
          </div>

          {/* Color Legend */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
            <span className="text-muted-foreground">Số lượng câu hỏi:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <span>Ít</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Trung bình</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-800 rounded"></div>
              <span>Nhiều</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Cell Details */}
      {selectedCell && (
        <Card>
          <CardContent>
            <QuestionsList
              questions={selectedCell.questions || []}
              title="Danh sách câu hỏi"
              loading={loadingQuestionDetails}
            />
          </CardContent>
        </Card>
      )}

      {/* Distribution Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Cân bằng độ khó
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Difficulty Distribution */}
            <div className="space-y-4">
              {/* Easy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Dễ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {data.distribution_stats.balance_analysis.easy_questions}{" "}
                      câu
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-100"
                    >
                      {data.distribution_stats.balance_analysis.easy_percentage.toFixed(
                        1
                      )}
                      %
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${data.distribution_stats.balance_analysis.easy_percentage}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Trung bình</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {
                        data.distribution_stats.balance_analysis
                          .medium_questions
                      }{" "}
                      câu
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                    >
                      {data.distribution_stats.balance_analysis.medium_percentage.toFixed(
                        1
                      )}
                      %
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${data.distribution_stats.balance_analysis.medium_percentage}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Khó</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {data.distribution_stats.balance_analysis.hard_questions}{" "}
                      câu
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-100"
                    >
                      {data.distribution_stats.balance_analysis.hard_percentage.toFixed(
                        1
                      )}
                      %
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${data.distribution_stats.balance_analysis.hard_percentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LO Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Phân bố Chuẩn đầu ra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.distribution_stats.lo_distribution).map(
                ([lo, count]) => {
                  const percentage =
                    ((count as number) / data.quiz_info.total_questions) * 100;
                  return (
                    <div key={lo} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {lo}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {count} câu
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DifficultyLOHeatmap;
