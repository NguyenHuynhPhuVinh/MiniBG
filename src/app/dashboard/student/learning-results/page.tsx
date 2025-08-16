"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import {
  TrendingUp,
  Award,
  Lightbulb,
  BarChart3,
  BookOpen,
  Target,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  StudentScoreAnalysisChart,
  LearningOverviewDashboard,
  DetailedAnalysisDashboard,
  StudentImprovementSuggestionsChart,
} from "@/components/features/charts";
import {
  SectionRecommendationCard,
  LOCompletionAnalysisCard,
  PersonalizedRecommendationsCard,
} from "@/components/features/learning";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { subjectService } from "@/lib/services/api/subject.service";
import { loService } from "@/lib/services/api/lo.service";
import { ComprehensiveAnalysisData } from "@/lib/types/chapter-analytics";
import { LOCompletionAnalysisData } from "@/lib/types/lo-completion-analysis";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

export default function StudentLearningResultsPage() {
  const { getUser } = useAuthStatus();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<ComprehensiveAnalysisData | null>(null);
  const [loAnalysisData, setLoAnalysisData] =
    useState<LOCompletionAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoAnalysisLoading, setIsLoAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loAnalysisError, setLoAnalysisError] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);

  // Resolve subject ID logic
  const resolveSubjectId = async (): Promise<number | null> => {
    try {
      const subjectsResponse = await subjectService.getSubjects();
      console.log("Subjects API Response:", subjectsResponse); // Debug log

      // Xử lý wrapper nếu có, fallback cho cấu trúc cũ
      let subjects = null;
      if (subjectsResponse?.success && subjectsResponse?.data) {
        // Cấu trúc mới với wrapper
        subjects = Array.isArray(subjectsResponse.data)
          ? subjectsResponse.data
          : subjectsResponse.data.subjects;
      } else if (
        subjectsResponse?.subjects &&
        Array.isArray(subjectsResponse.subjects)
      ) {
        // Cấu trúc cũ - { subjects: [...] }
        subjects = subjectsResponse.subjects;
      } else if (Array.isArray(subjectsResponse)) {
        // Cấu trúc cũ - array trực tiếp
        subjects = subjectsResponse;
      }

      if (subjects && subjects.length > 0) {
        return subjects[0].subject_id;
      }

      console.warn("No subjects found in response:", subjectsResponse);
      return null;
    } catch (error) {
      console.error("Error resolving subject ID:", error);
      return null;
    }
  };

  // Fetch data once for all components
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = getUser();
      if (!user) {
        setError("Vui lòng đăng nhập để xem phân tích");
        return;
      }

      let currentSubjectId = subjectId;
      if (!currentSubjectId) {
        currentSubjectId = await resolveSubjectId();
        if (!currentSubjectId) {
          setError("Không tìm thấy môn học nào");
          return;
        }
        setSubjectId(currentSubjectId);
      }

      const response = await chapterAnalyticsService.getComprehensiveAnalysis({
        subject_id: currentSubjectId,
        user_id: user.user_id,
      });

      setData(response);
    } catch (error) {
      console.error("Error fetching learning results data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu kết quả học tập";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch LO completion analysis data
  const fetchLOAnalysisData = async () => {
    try {
      setIsLoAnalysisLoading(true);
      setLoAnalysisError(null);

      const user = getUser();
      if (!user) {
        setLoAnalysisError("Vui lòng đăng nhập để xem phân tích LO");
        return;
      }

      let currentSubjectId = subjectId;
      if (!currentSubjectId) {
        currentSubjectId = await resolveSubjectId();
        if (!currentSubjectId) {
          setLoAnalysisError("Không tìm thấy môn học nào");
          return;
        }
        setSubjectId(currentSubjectId);
      }

      const response = await loService.getCompletionAnalysis({
        subject_id: currentSubjectId,
        user_id: user.user_id,
      });

      // Log response for debugging (can be removed in production)
      console.log("LO Completion Analysis Response:", response);

      // Xử lý wrapper nếu có, fallback cho cấu trúc cũ
      if (response?.success && response?.data) {
        // Cấu trúc mới với wrapper
        setLoAnalysisData(response.data);
      } else if (response && !response.hasOwnProperty("success")) {
        // Cấu trúc cũ - data trực tiếp (cast to LOCompletionAnalysisData)
        setLoAnalysisData(response as any);
      } else if (response?.success === false) {
        throw new Error(
          response.message || "Không thể tải dữ liệu phân tích LO"
        );
      } else {
        console.warn("Unexpected LO analysis response structure:", response);
        throw new Error("Cấu trúc dữ liệu phân tích LO không đúng");
      }
    } catch (error) {
      console.error("Error fetching LO analysis data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu phân tích LO";
      setLoAnalysisError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoAnalysisLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  // Fetch LO analysis data when switching to LO analysis tab
  useEffect(() => {
    if (
      activeTab === "lo-analysis" &&
      !loAnalysisData &&
      !isLoAnalysisLoading
    ) {
      fetchLOAnalysisData();
    }
  }, [activeTab, loAnalysisData, isLoAnalysisLoading]);

  const handleViewFullRoadmap = () => {
    setActiveTab("roadmap");
  };

  const handleViewLODetails = (loId: number) => {
    console.log("View LO details for:", loId);
    // TODO: Implement LO details modal or navigation
  };

  const handleStartImprovement = (loId: number) => {
    console.log("Start improvement for LO:", loId);
    // TODO: Implement improvement plan navigation
  };

  const handleActionClick = (action: string) => {
    console.log("Action clicked:", action);
    // TODO: Implement action handling
  };

  const handlePhaseSelect = (phaseName: string) => {
    console.log("Phase selected:", phaseName);
    // TODO: Implement phase details modal or navigation
  };

  // Loading state for entire page
  if (isLoading) {
    return (
      <div className="w-full mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            Đang tải kết quả học tập
          </h2>
          <p className="text-muted-foreground">
            Vui lòng chờ trong giây lát...
          </p>
        </div>
      </div>
    );
  }

  // Error state for entire page
  if (error) {
    return (
      <div className="w-full mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Lỗi tải dữ liệu
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="w-full mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Chưa có dữ liệu
          </h2>
          <p className="text-muted-foreground">
            Chưa có dữ liệu phân tích kết quả học tập
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* Analytics Dashboard */}
      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="detailed"
              className="flex items-center gap-2 text-sm"
            >
              <Target className="h-4 w-4" />
              Phân tích Chi tiết
            </TabsTrigger>
            <TabsTrigger
              value="lo-analysis"
              className="flex items-center gap-2 text-sm"
            >
              <Award className="h-4 w-4" />
              Phân tích LO
            </TabsTrigger>
            <TabsTrigger
              value="roadmap"
              className="flex items-center gap-2 text-sm"
            >
              <Lightbulb className="h-4 w-4" />
              Lộ trình Hành động
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6 mt-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-medium text-blue-900 mb-1">
                Phân tích Điểm số Tổng thể
              </h3>
              <p className="text-sm text-blue-700">
                Phân tích toàn diện về hiệu suất học tập của bạn với điểm mạnh,
                điểm yếu và so sánh với trung bình lớp.
              </p>
            </div>
            <StudentScoreAnalysisChart className="w-full" />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <LearningOverviewDashboard
              className="w-full"
              data={data}
              onViewFullRoadmap={handleViewFullRoadmap}
            />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6 mt-6">
            <DetailedAnalysisDashboard className="w-full" data={data} />
          </TabsContent>

          <TabsContent value="lo-analysis" className="space-y-6 mt-6">
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-medium text-purple-900 mb-1">
                Phân tích Learning Outcomes theo % Hoàn thành
              </h3>
              <p className="text-sm text-purple-700">
                Phân tích chi tiết LO dựa trên ngưỡng 60% với kế hoạch cải thiện
                cho LO yếu và gợi ý nâng cao cho LO mạnh.
              </p>
            </div>

            {isLoAnalysisLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
                <h2 className="text-lg font-semibold mb-2">
                  Đang phân tích Learning Outcomes
                </h2>
                <p className="text-muted-foreground">
                  Vui lòng chờ trong giây lát...
                </p>
              </div>
            ) : loAnalysisError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Lỗi tải dữ liệu LO Analysis
                </h2>
                <p className="text-muted-foreground mb-4">{loAnalysisError}</p>
                <button
                  onClick={fetchLOAnalysisData}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Thử lại
                </button>
              </div>
            ) : loAnalysisData ? (
              <div className="space-y-6">
                {/* Safe rendering với fallback */}
                {loAnalysisData.lo_analysis ? (
                  <LOCompletionAnalysisCard
                    className="w-full"
                    data={loAnalysisData}
                    onViewDetails={handleViewLODetails}
                    onStartImprovement={handleStartImprovement}
                  />
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800">
                      Dữ liệu LO analysis không đầy đủ. Vui lòng kiểm tra
                      console để xem chi tiết.
                    </p>
                  </div>
                )}

                {loAnalysisData.learning_recommendations ? (
                  <PersonalizedRecommendationsCard
                    className="w-full"
                    recommendations={loAnalysisData.learning_recommendations}
                    onActionClick={handleActionClick}
                    onPhaseSelect={handlePhaseSelect}
                  />
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800">
                      Dữ liệu recommendations không đầy đủ. Vui lòng kiểm tra
                      console để xem chi tiết.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-lg font-semibold text-gray-600 mb-2">
                  Chưa có dữ liệu LO Analysis
                </h2>
                <p className="text-muted-foreground mb-4">
                  Chưa có dữ liệu phân tích Learning Outcomes
                </p>
                <button
                  onClick={fetchLOAnalysisData}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Tải dữ liệu
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6 mt-6">
            <div className="mb-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-medium text-amber-900 mb-1">
                Lộ trình Hành động Chi tiết
              </h3>
              <p className="text-sm text-amber-700">
                Danh sách đầy đủ các hành động được đề xuất với ưu tiên, thời
                gian và ước tính cải thiện cụ thể.
              </p>
            </div>
            <SectionRecommendationCard className="w-full" data={data} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Additional Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <BookOpen className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                Cách sử dụng hiệu quả
              </h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>
                  • <strong>Dashboard Tổng quan:</strong> Cái nhìn 360 độ về
                  hiệu suất học tập và gợi ý ưu tiên hàng đầu
                </p>
                <p>
                  • <strong>Phân tích Chi tiết:</strong> Thông tin chi tiết theo
                  chương, so sánh thành thạo vs tiến độ, lịch sử quiz
                </p>
                <p>
                  • <strong>Phân tích LO:</strong> Phân tích Learning Outcomes
                  theo % hoàn thành với ngưỡng 60%, kế hoạch cải thiện và gợi ý
                  nâng cao
                </p>
                <p>
                  • <strong>Lộ trình Hành động:</strong> Danh sách đầy đủ các
                  hành động cụ thể để cải thiện kết quả học tập
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
