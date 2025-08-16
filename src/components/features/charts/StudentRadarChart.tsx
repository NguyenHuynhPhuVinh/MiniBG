"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import {
  Loader2,
  BarChart3,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { quizService } from "@/lib/services/api";
import {
  UserRadarData,
  RadarChartConfig,
  AllRadarData,
} from "@/lib/types/radar";
import { ImprovementAnalysisData } from "@/lib/types/improvement";
import { showErrorToast } from "@/lib/utils/toast-utils";
import RadarChart, { transformRadarData, colorSchemes } from "./RadarChart";

interface StudentRadarChartProps {
  quizId: number;
  quizName?: string;
  className?: string;
}

export default function StudentRadarChart({
  quizId,
  quizName,
  className = "",
}: StudentRadarChartProps) {
  const [radarData, setRadarData] = useState<UserRadarData | null>(null);
  const [combinedRadarData, setCombinedRadarData] =
    useState<AllRadarData | null>(null);
  const [improvementData, setImprovementData] =
    useState<ImprovementAnalysisData | null>(null);
  const [studentPerformanceData, setStudentPerformanceData] =
    useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        setIsLoading(true);

        // Gọi 3 API đầu tiên để lấy user_id
        const [currentUserData, averageData, topPerformerData] =
          await Promise.allSettled([
            quizService.getCurrentUserRadarData(quizId),
            quizService.getAverageRadarData(quizId),
            quizService.getTopPerformerRadarData(quizId),
          ]);

        // Lưu dữ liệu người dùng hiện tại (để hiển thị thông tin chi tiết)
        let currentUserId = null;
        if (currentUserData.status === "fulfilled") {
          const userData = currentUserData.value;
          console.log("Student Current User Data:", userData); // Debug log

          // Xử lý wrapper nếu có
          const actualData =
            userData?.success && userData?.data ? userData.data : userData;

          if (actualData?.user_id) {
            setRadarData(actualData);
            currentUserId = actualData.user_id;
          }
        }

        // Gọi API student performance nếu có user_id
        if (currentUserId) {
          try {
            const performanceResult =
              await quizService.getStudentQuizPerformance({
                quiz_id: quizId,
                user_id: currentUserId,
              });
            if (performanceResult.success) {
              setStudentPerformanceData(performanceResult);
            }
          } catch (err) {
            console.error("Lỗi khi lấy student performance:", err);
          }
        }

        // Gọi improvement analysis (backup)
        const improvementAnalysis = await Promise.allSettled([
          quizService.getImprovementAnalysis({ quiz_id: quizId }),
        ]);

        // Lưu dữ liệu phân tích cải thiện (backup)
        if (improvementAnalysis[0].status === "fulfilled") {
          setImprovementData(improvementAnalysis[0].value.data);
        }

        // Tạo dữ liệu kết hợp cho radar chart chồng lại
        const processedData: AllRadarData = {
          quiz_id: quizId,
          quiz_name: quizName || "Bài kiểm tra",
          total_questions: 0,
          radar_data: {},
          summary: {
            total_participants: 0,
            total_answers: 0,
            average_score: 0,
            difficulty_levels: [],
            learning_outcomes: [],
          },
        };

        // Xử lý dữ liệu người dùng hiện tại
        if (currentUserData.status === "fulfilled") {
          const userData = currentUserData.value;
          const actualData =
            userData?.success && userData?.data ? userData.data : userData;

          if (actualData?.user_id && actualData?.radar_data) {
            processedData.radar_data.current_user = {
              user_id: actualData.user_id,
              data: actualData.radar_data,
            };
          }
        }

        // Xử lý dữ liệu trung bình
        if (averageData.status === "fulfilled") {
          const avgData = averageData.value;
          const actualData =
            avgData?.success && avgData?.data ? avgData.data : avgData;

          if (actualData?.radar_data) {
            processedData.radar_data.average = actualData.radar_data;
          }
        }

        // Xử lý dữ liệu top performer
        if (topPerformerData.status === "fulfilled") {
          const topData = topPerformerData.value;
          const actualData =
            topData?.success && topData?.data ? topData.data : topData;

          if (actualData?.top_performer && actualData?.radar_data) {
            processedData.radar_data.top_performer = {
              user_info: actualData.top_performer,
              data: actualData.radar_data,
            };
          }
        }

        setCombinedRadarData(processedData);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu radar chart:", err);
        setError("Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.");
        showErrorToast("Không thể tải dữ liệu phân tích");
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      fetchRadarData();
    }
  }, [quizId]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-lg font-medium text-muted-foreground">
              Đang tải dữ liệu phân tích...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !radarData) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {error || "Không có dữ liệu phân tích"}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Tạo dữ liệu cho chart chồng lại (tương tự TeacherRadarChart)
  const getComparisonChartData = (): RadarChartConfig => {
    if (!combinedRadarData) {
      // Fallback về chart đơn nếu không có dữ liệu kết hợp
      return transformRadarData(
        radarData.radar_data,
        "Kết quả của bạn",
        colorSchemes.primary
      );
    }

    const datasets = [];

    // 1. Thêm dữ liệu trung bình (vòng ngoài cùng - màu xanh dương)
    if (combinedRadarData.radar_data.average) {
      const avgData = transformRadarData(
        combinedRadarData.radar_data.average,
        "Trung bình lớp",
        colorSchemes.primary
      );
      const customizedDataset = {
        ...avgData.datasets[0],
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(59, 130, 246)",
      };
      datasets.push(customizedDataset);
    }

    // 2. Thêm dữ liệu top performer (vòng giữa - màu xanh lá)
    if (combinedRadarData.radar_data.top_performer) {
      const topData = transformRadarData(
        combinedRadarData.radar_data.top_performer.data,
        "Học viên xuất sắc",
        colorSchemes.success
      );
      const customizedDataset = {
        ...topData.datasets[0],
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        borderColor: "rgb(34, 197, 94)",
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(34, 197, 94)",
      };
      datasets.push(customizedDataset);
    }

    // 3. Thêm dữ liệu user hiện tại (vòng trong cùng - màu cam)
    if (combinedRadarData.radar_data.current_user) {
      const currentData = transformRadarData(
        combinedRadarData.radar_data.current_user.data,
        "Kết quả của bạn",
        colorSchemes.warning
      );
      const customizedDataset = {
        ...currentData.datasets[0],
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        borderColor: "rgb(249, 115, 22)",
        pointBackgroundColor: "rgb(249, 115, 22)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(249, 115, 22)",
      };
      datasets.push(customizedDataset);
    }

    // Lấy labels từ dataset đầu tiên có sẵn
    const labels = combinedRadarData.radar_data.average
      ? transformRadarData(
          combinedRadarData.radar_data.average,
          "",
          colorSchemes.primary
        ).labels
      : combinedRadarData.radar_data.current_user
      ? transformRadarData(
          combinedRadarData.radar_data.current_user.data,
          "",
          colorSchemes.warning
        ).labels
      : [];

    return { labels, datasets };
  };

  const chartData: RadarChartConfig = getComparisonChartData();

  // Tính toán dữ liệu để hiển thị
  const difficultyLevels = radarData.radar_data.difficulty_levels;
  const learningOutcomes = radarData.radar_data.learning_outcomes;

  // Helper function để map difficulty level
  const getDifficultyDisplay = (level: string) => {
    const levelLower = level.toLowerCase();
    if (
      levelLower.includes("easy") ||
      levelLower.includes("dễ") ||
      levelLower === "de"
    ) {
      return { icon: "🟢", name: "Dễ" };
    } else if (
      levelLower.includes("medium") ||
      levelLower.includes("trung") ||
      levelLower === "tb" ||
      levelLower === "medium"
    ) {
      return { icon: "🟡", name: "Trung bình" };
    } else if (
      levelLower.includes("hard") ||
      levelLower.includes("khó") ||
      levelLower === "kho"
    ) {
      return { icon: "🔴", name: "Khó" };
    } else {
      return { icon: "📝", name: level };
    }
  };

  // Format thời gian
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Phân tích kết quả của bạn
            </CardTitle>
            {quizName && <p className="text-muted-foreground">{quizName}</p>}
            {radarData?.message && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded mt-2">
                {radarData.message}
              </p>
            )}
          </div>

          {/* Legend cho 3 vòng chồng lên nhau (chỉ hiển thị khi có dữ liệu kết hợp) */}
          {combinedRadarData && (
            <div className="text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-700 mb-2">So sánh:</div>
                <div className="flex flex-wrap gap-4">
                  {combinedRadarData.radar_data.average && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-gray-600">Trung bình lớp</span>
                    </div>
                  )}
                  {combinedRadarData.radar_data.top_performer && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Học viên xuất sắc</span>
                    </div>
                  )}
                  {combinedRadarData.radar_data.current_user && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-gray-600">Kết quả của bạn</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Radar Chart */}
        <div className="mb-8">
          <RadarChart
            data={chartData}
            title={quizName || "Bài kiểm tra"}
            height={400}
            radarData={radarData.radar_data}
            allRadarData={
              combinedRadarData
                ? {
                    average: combinedRadarData.radar_data.average,
                    top_performer:
                      combinedRadarData.radar_data.top_performer?.data,
                    current_user:
                      combinedRadarData.radar_data.current_user?.data,
                  }
                : undefined
            }
          />
        </div>

        {/* Enhanced Recommendations */}
        {(radarData.weakest_lo ||
          radarData.weakest_difficulty ||
          improvementData?.weak_levels?.weakest_level ||
          Object.keys(difficultyLevels).length > 0) && (
          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-amber-900 mb-6 flex items-center gap-2 text-lg">
              <Target className="h-6 w-6" />
              Đề xuất cải thiện chi tiết
            </h4>

            <div className="space-y-6">
              {/* Weakest LO with enhanced details */}
              {radarData.weakest_lo && (
                <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h5 className="font-semibold text-amber-900 text-base mb-1">
                        🎯 Chuẩn đầu ra ưu tiên cải thiện
                      </h5>
                      <div className="text-lg font-bold text-amber-800 mb-1">
                        {radarData.weakest_lo.lo_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {radarData.weakest_lo.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-xs text-amber-600">độ chính xác</div>
                    </div>
                  </div>

                  {radarData.weakest_lo.chapters &&
                    radarData.weakest_lo.chapters.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          📚 Chương học cần ôn tập:
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {radarData.weakest_lo.chapters
                            .slice(0, 3)
                            .map((chapter) => (
                              <div
                                key={chapter.chapter_id}
                                className="bg-gradient-to-r from-amber-100 to-yellow-100 p-3 rounded-lg border border-amber-200"
                              >
                                <div className="font-semibold text-amber-800 mb-1">
                                  {chapter.chapter_name}
                                </div>
                                {chapter.description && (
                                  <div className="text-sm text-amber-700">
                                    {chapter.description}
                                  </div>
                                )}
                              </div>
                            ))}
                          {radarData.weakest_lo.chapters.length > 3 && (
                            <div className="text-sm text-amber-600 text-center py-2">
                              +{radarData.weakest_lo.chapters.length - 3} chương
                              khác cần ôn tập
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Weakest Difficulty Level with Wrong Questions */}
              {/* Sử dụng dữ liệu từ Student Performance API */}
              {studentPerformanceData?.data?.question_by_question
                ? (() => {
                    // Loại bỏ câu hỏi trùng lặp - chỉ lấy attempt cuối cùng của mỗi question_id
                    const uniqueQuestions: any = {};
                    studentPerformanceData.data.question_by_question.forEach(
                      (q: any) => {
                        const questionId = q.question_id;
                        if (
                          !uniqueQuestions[questionId] ||
                          new Date(q.attempt_date) >
                            new Date(uniqueQuestions[questionId].attempt_date)
                        ) {
                          uniqueQuestions[questionId] = q;
                        }
                      }
                    );

                    const allUniqueQuestions = Object.values(uniqueQuestions);

                    // Lọc câu sai từ danh sách đã loại bỏ trùng lặp
                    const incorrectQuestions = allUniqueQuestions.filter(
                      (q: any) => !q.is_correct
                    );

                    if (incorrectQuestions.length === 0) {
                      return (
                        <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm">
                          <h5 className="font-semibold text-green-900 text-base mb-1">
                            🎉 Chúc mừng!
                          </h5>
                          <p className="text-green-700">
                            Bạn đã làm đúng tất cả câu hỏi trong bài quiz này!
                          </p>
                        </div>
                      );
                    }

                    // Nhóm theo LO và tính accuracy
                    const loGroups: any = {};
                    incorrectQuestions.forEach((q: any) => {
                      const loName = q.lo_name || "Unknown LO";
                      if (!loGroups[loName]) {
                        loGroups[loName] = {
                          lo_name: loName,
                          chapter_name: q.chapter_name || "Unknown Chapter",
                          level_name: q.level_name || "Unknown Level",
                          questions: [],
                          total_questions: 0,
                          incorrect_questions: 0,
                        };
                      }
                      loGroups[loName].questions.push(q);
                      loGroups[loName].incorrect_questions++;
                    });

                    // Tính total questions cho mỗi LO từ danh sách đã loại bỏ trùng lặp
                    allUniqueQuestions.forEach((q: any) => {
                      const loName = q.lo_name || "Unknown LO";
                      if (loGroups[loName]) {
                        loGroups[loName].total_questions++;
                      }
                    });

                    // Tính accuracy và tìm LO yếu nhất
                    const loArray = Object.values(loGroups).map((lo: any) => ({
                      ...lo,
                      accuracy:
                        lo.total_questions > 0
                          ? ((lo.total_questions - lo.incorrect_questions) /
                              lo.total_questions) *
                            100
                          : 0,
                    }));

                    const weakestLO = loArray.sort(
                      (a: any, b: any) => a.accuracy - b.accuracy
                    )[0];

                    return (
                      <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h5 className="font-semibold text-red-900 text-base mb-1">
                              🔴 LO yếu nhất cần cải thiện
                            </h5>
                            <div className="text-lg font-bold text-red-800 mb-1">
                              {weakestLO.lo_name}
                            </div>
                            <div className="text-sm text-red-600">
                              Chương: {weakestLO.chapter_name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">
                              {weakestLO.accuracy.toFixed(1)}%
                            </div>
                            <div className="text-xs text-red-600">
                              độ chính xác
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                            ❌ Các câu hỏi sai thuộc LO:
                          </p>
                          <div
                            className={`space-y-3 overflow-y-auto ${
                              showAllQuestions ? "max-h-96" : "max-h-64"
                            }`}
                          >
                            {weakestLO.questions
                              .slice(0, showAllQuestions ? undefined : 5)
                              .map((question: any, index: number) => (
                                <div
                                  key={question.question_id}
                                  className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-200"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <div className="font-semibold text-red-800 text-sm mb-1">
                                        Câu {index + 1}:
                                      </div>
                                      <div className="text-sm text-red-700">
                                        <span className="font-medium">LO:</span>{" "}
                                        {question.lo_name}
                                      </div>
                                      <div className="text-xs text-red-600 mt-1">
                                        <span className="font-medium">
                                          Chương:
                                        </span>{" "}
                                        {question.chapter_name}
                                      </div>
                                    </div>
                                    <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded ml-2">
                                      {question.level_name || "N/A"}
                                    </div>
                                  </div>
                                  <div className="text-sm text-red-700 mb-2">
                                    {question.question_text.length > 100
                                      ? `${question.question_text.substring(
                                          0,
                                          100
                                        )}...`
                                      : question.question_text}
                                  </div>
                                </div>
                              ))}
                            {weakestLO.questions.length > 5 && (
                              <div className="text-center py-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setShowAllQuestions(!showAllQuestions)
                                  }
                                  className="text-red-600 border-red-200 hover:bg-red-50 flex items-center"
                                >
                                  {showAllQuestions ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                      Thu gọn
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                      Xem thêm +{weakestLO.questions.length -
                                        5}{" "}
                                      câu
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                : // Fallback: Hiển thị dữ liệu từ improvement analysis nếu có
                  improvementData?.weak_levels?.weakest_level && (
                    <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h5 className="font-semibold text-red-900 text-base mb-1">
                            🔴 Độ khó yếu nhất cần cải thiện (Fallback)
                          </h5>
                          <div className="text-lg font-bold text-red-800 mb-1">
                            {improvementData.weak_levels.weakest_level.level ||
                              "Unknown Level"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {improvementData.weak_levels.weakest_level.accuracy?.toFixed(
                              1
                            ) || "0.0"}
                            %
                          </div>
                          <div className="text-xs text-red-600">
                            độ chính xác
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-red-700">
                        Đang tải dữ liệu chi tiết...
                      </p>
                    </div>
                  )}

              {/* Enhanced Difficulty Analysis */}
              {Object.keys(difficultyLevels).length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                  <h5 className="font-semibold text-amber-900 text-base mb-4 flex items-center gap-2">
                    📊 Phân tích theo độ khó
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(difficultyLevels)
                      .sort(([, a], [, b]) => a.accuracy - b.accuracy)
                      .map(([level, data]) => {
                        const isWeakest =
                          data.accuracy ===
                          Math.min(
                            ...Object.values(difficultyLevels).map(
                              (d) => d.accuracy
                            )
                          );
                        return (
                          <div
                            key={level}
                            className={`p-4 rounded-lg border-2 ${
                              isWeakest
                                ? "bg-red-50 border-red-200"
                                : data.accuracy >= 70
                                ? "bg-green-50 border-green-200"
                                : "bg-yellow-50 border-yellow-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize text-gray-800">
                                {(() => {
                                  const display = getDifficultyDisplay(level);
                                  return `${display.icon} ${display.name}`;
                                })()}
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  isWeakest
                                    ? "text-red-600"
                                    : data.accuracy >= 70
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {data.accuracy}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {data.questions_count} câu •{" "}
                              {formatTime(data.average_response_time)}
                            </div>
                            {isWeakest && (
                              <div className="mt-2 text-xs font-medium text-red-700 bg-red-100 p-2 rounded">
                                ⚠️ Cần tập trung cải thiện
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Learning Outcomes Analysis */}
              {Object.keys(learningOutcomes).length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                  <h5 className="font-semibold text-amber-900 text-base mb-4 flex items-center gap-2">
                    🎯 Phân tích theo chuẩn đầu ra
                  </h5>

                  <div className="space-y-3">
                    {Object.entries(learningOutcomes)
                      .sort(([, a], [, b]) => a.accuracy - b.accuracy)
                      .map(([lo, data]) => {
                        const isWeakest =
                          data.accuracy ===
                          Math.min(
                            ...Object.values(learningOutcomes).map(
                              (d) => d.accuracy
                            )
                          );
                        return (
                          <div
                            key={lo}
                            className={`p-3 rounded-lg border ${
                              isWeakest
                                ? "bg-red-50 border-red-200"
                                : data.accuracy >= 70
                                ? "bg-green-50 border-green-200"
                                : "bg-yellow-50 border-yellow-200"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-800">
                                {data.description
                                  ? `${lo} - ${data.description}`
                                  : lo}
                              </span>
                              <span
                                className={`font-bold ${
                                  isWeakest
                                    ? "text-red-600"
                                    : data.accuracy >= 70
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {data.accuracy}%
                              </span>
                            </div>
                            {data.description && (
                              <div className="text-sm text-gray-600 mb-2 italic">
                                {data.description}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {data.questions_count} câu •{" "}
                              {formatTime(data.average_response_time)}
                            </div>
                            {isWeakest && (
                              <div className="mt-2 text-xs font-medium text-red-700">
                                ⚠️ Ưu tiên cải thiện chuẩn đầu ra này
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Chapter Suggestions from Improvement Analysis */}
              {improvementData?.chapters_need_improvement &&
                improvementData.chapters_need_improvement.length > 0 && (
                  <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
                    <h5 className="font-semibold text-blue-900 text-base mb-4 flex items-center gap-2">
                      📚 Gợi ý chương học cần ôn tập
                    </h5>

                    <div className="space-y-4">
                      {improvementData.chapters_need_improvement
                        .slice(0, showAllChapters ? undefined : 3)
                        .map((chapter) => (
                          <div
                            key={chapter.chapter_id}
                            className={`p-4 rounded-lg border-2 ${
                              chapter.priority === "high"
                                ? "bg-red-50 border-red-200"
                                : chapter.priority === "medium"
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="font-semibold text-gray-800 mb-1">
                                  {chapter.chapter_name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {chapter.subject_name}
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-lg font-bold ${
                                    chapter.priority === "high"
                                      ? "text-red-600"
                                      : chapter.priority === "medium"
                                      ? "text-yellow-600"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {chapter.accuracy.toFixed(1)}%
                                </div>
                                <div
                                  className={`text-xs px-2 py-1 rounded ${
                                    chapter.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : chapter.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {chapter.priority === "high"
                                    ? "Ưu tiên cao"
                                    : chapter.priority === "medium"
                                    ? "Ưu tiên trung bình"
                                    : "Ưu tiên thấp"}
                                </div>
                              </div>
                            </div>

                            {chapter.weak_los &&
                              chapter.weak_los.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    LO yếu cần cải thiện:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {chapter.weak_los.slice(0, 3).map((lo) => (
                                      <span
                                        key={lo.lo_id}
                                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                      >
                                        {lo.lo_name} ({lo.accuracy.toFixed(1)}%)
                                      </span>
                                    ))}
                                    {chapter.weak_los.length > 3 && (
                                      <span className="text-xs text-gray-500">
                                        +{chapter.weak_los.length - 3} LO khác
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                            {chapter.suggestions &&
                              chapter.suggestions.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    Gợi ý học tập:
                                  </p>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {chapter.suggestions
                                      .slice(0, 2)
                                      .map((suggestion, index) => (
                                        <li
                                          key={index}
                                          className="flex items-start gap-2"
                                        >
                                          <span className="text-blue-500 mt-1">
                                            •
                                          </span>
                                          <span>{suggestion}</span>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        ))}

                      {improvementData.chapters_need_improvement.length > 3 && (
                        <div className="text-center py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAllChapters(!showAllChapters)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center"
                          >
                            {showAllChapters ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Thu gọn
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Xem thêm +
                                {improvementData.chapters_need_improvement
                                  .length - 3}{" "}
                                chương
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
