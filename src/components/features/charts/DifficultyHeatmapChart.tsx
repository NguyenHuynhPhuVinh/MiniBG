"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { Loader2, Thermometer, Clock, Target } from "lucide-react";
import { advancedAnalyticsService, DifficultyHeatmapParams } from "@/lib/services";
import { DifficultyHeatmapResponse } from "@/lib/types/advanced-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";

interface DifficultyHeatmapChartProps {
  quizId?: number;
  subjectId?: number;
  programId?: number;
  className?: string;
}

export default function DifficultyHeatmapChart({
  quizId,
  subjectId,
  programId,
  className = "",
}: DifficultyHeatmapChartProps) {
  const [data, setData] = useState<DifficultyHeatmapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<string>("30d");
  const [viewMode, setViewMode] = useState<"difficulty" | "accuracy" | "time">("difficulty");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: DifficultyHeatmapParams = {
        time_period: timePeriod,
      };

      if (quizId) params.quiz_id = quizId;
      if (subjectId) params.subject_id = subjectId;
      if (programId) params.program_id = programId;

      const response = await advancedAnalyticsService.getDifficultyHeatmap(params);
      setData(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu difficulty heatmap:", error);
      setError("Không thể tải dữ liệu biểu đồ");
      showErrorToast("Không thể tải dữ liệu biểu đồ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId, subjectId, programId, timePeriod]);

  const getHeatmapColor = (value: number, maxValue: number, mode: string) => {
    const intensity = value / maxValue;
    
    switch (mode) {
      case "difficulty":
        // Red for high difficulty
        return `rgba(239, 68, 68, ${Math.max(0.1, intensity)})`;
      case "accuracy":
        // Green for high accuracy
        return `rgba(34, 197, 94, ${Math.max(0.1, intensity)})`;
      case "time":
        // Blue for high response time
        return `rgba(59, 130, 246, ${Math.max(0.1, intensity)})`;
      default:
        return `rgba(156, 163, 175, ${Math.max(0.1, intensity)})`;
    }
  };

  const getValue = (item: any, mode: string) => {
    switch (mode) {
      case "difficulty":
        return parseFloat(item.difficulty_score);
      case "accuracy":
        return parseFloat(item.accuracy_rate);
      case "time":
        return parseFloat(item.avg_response_time);
      default:
        return 0;
    }
  };

  const getValueLabel = (mode: string) => {
    switch (mode) {
      case "difficulty":
        return "Độ khó";
      case "accuracy":
        return "Độ chính xác (%)";
      case "time":
        return "Thời gian TB (giây)";
      default:
        return "";
    }
  };

  const getIcon = (mode: string) => {
    switch (mode) {
      case "difficulty":
        return <Thermometer className="h-4 w-4" />;
      case "accuracy":
        return <Target className="h-4 w-4" />;
      case "time":
        return <Clock className="h-4 w-4" />;
      default:
        return <Thermometer className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Bản đồ nhiệt độ khó
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Đang tải dữ liệu...</span>
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
            <Thermometer className="h-5 w-5" />
            Bản đồ nhiệt độ khó
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">{error || "Không có dữ liệu"}</p>
            <Button onClick={fetchData} variant="outline">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tạo ma trận dữ liệu cho heatmap
  const chapters = data.data.axis_labels.chapters;
  const levels = data.data.axis_labels.levels;
  
  // Tìm giá trị max để chuẩn hóa màu sắc
  const allValues = data.data.heatmap_data.map(item => getValue(item, viewMode));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Bản đồ nhiệt độ khó
          </CardTitle>
          <div className="flex gap-2">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="difficulty">Độ khó</SelectItem>
                <SelectItem value="accuracy">Độ chính xác</SelectItem>
                <SelectItem value="time">Thời gian phản hồi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 ngày</SelectItem>
                <SelectItem value="30d">30 ngày</SelectItem>
                <SelectItem value="3m">3 tháng</SelectItem>
                <SelectItem value="6m">6 tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getIcon(viewMode)}
            <span className="text-sm font-medium">{getValueLabel(viewMode)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span>Thấp</span>
            <div className="flex">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity, index) => (
                <div
                  key={index}
                  className="w-4 h-4"
                  style={{
                    backgroundColor: getHeatmapColor(intensity * maxValue, maxValue, viewMode),
                  }}
                />
              ))}
            </div>
            <span>Cao</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `120px repeat(${levels.length}, 1fr)` }}>
              <div className="text-xs font-medium text-muted-foreground p-2">Chương / Mức độ</div>
              {levels.map((level, index) => (
                <div key={index} className="text-xs font-medium text-center p-2 bg-muted rounded">
                  {level}
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {chapters.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `120px repeat(${levels.length}, 1fr)` }}>
                <div className="text-xs font-medium p-2 bg-muted rounded flex items-center">
                  {chapter}
                </div>
                {levels.map((level, levelIndex) => {
                  const dataPoint = data.data.heatmap_data.find(
                    item => item.chapter === chapter && item.level === level
                  );
                  
                  if (!dataPoint) {
                    return (
                      <div key={levelIndex} className="h-12 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">N/A</span>
                      </div>
                    );
                  }

                  const value = getValue(dataPoint, viewMode);
                  const color = getHeatmapColor(value, maxValue, viewMode);

                  return (
                    <div
                      key={levelIndex}
                      className="h-12 rounded flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: color }}
                      title={`${chapter} - ${level}: ${value.toFixed(2)} ${getValueLabel(viewMode)}`}
                    >
                      <span className="text-xs font-medium text-gray-800">
                        {value.toFixed(1)}
                      </span>
                      {viewMode === "accuracy" && (
                        <span className="text-xs text-gray-600">%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Giá trị trung bình</p>
            <p className="text-lg font-semibold">
              {(allValues.reduce((sum, val) => sum + val, 0) / allValues.length).toFixed(2)}
              {viewMode === "accuracy" && "%"}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Giá trị cao nhất</p>
            <p className="text-lg font-semibold">
              {maxValue.toFixed(2)}
              {viewMode === "accuracy" && "%"}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.data.summary.most_difficult.chapter} - {data.data.summary.most_difficult.level}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Giá trị thấp nhất</p>
            <p className="text-lg font-semibold">
              {minValue.toFixed(2)}
              {viewMode === "accuracy" && "%"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
