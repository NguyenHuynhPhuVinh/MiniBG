import api from "./client";
import { API_ERROR_MESSAGES, API_CONFIG } from "@/lib/constants";
import type {
  ChapterAnalysisData,
  ComprehensiveAnalysisData,
  TeacherAnalyticsData,
  ChapterAnalyticsResponse,
  DetailedAnalysisParams,
  ComprehensiveAnalysisParams,
  TeacherAnalyticsParams,
  LearningOutcomesChartResponse,
  LearningOutcomeDetailData,
} from "@/lib/types/chapter-analytics";

// Loading state management
interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
}

// Global loading states for different analytics types
const loadingStates: Record<string, LoadingState> = {};

// Timeout configuration for chapter analytics
const CHAPTER_ANALYTICS_TIMEOUT = API_CONFIG.TIMEOUT * 1.5; // 45 seconds

// Helper functions for loading state management
const getLoadingStateKey = (type: string, params: any): string => {
  return `${type}_${JSON.stringify(params)}`;
};

const setLoadingState = (key: string, state: Partial<LoadingState>) => {
  if (!loadingStates[key]) {
    loadingStates[key] = { isLoading: false, error: null, lastFetch: null };
  }
  loadingStates[key] = { ...loadingStates[key], ...state };
};

const getLoadingState = (key: string): LoadingState => {
  return (
    loadingStates[key] || { isLoading: false, error: null, lastFetch: null }
  );
};

// Timeout wrapper for API calls
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = CHAPTER_ANALYTICS_TIMEOUT
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(API_ERROR_MESSAGES.TIMEOUT)), timeoutMs)
    ),
  ]);
};

/**
 * Service quản lý Chapter Analytics API
 * Tích hợp các API phân tích theo chương mới thay thế LO-based analytics
 */
export const chapterAnalyticsService = {
  /**
   * Lấy phân tích chi tiết theo chương cho một quiz và user cụ thể
   * Endpoint: /quiz-results/detailed-analysis/:quiz_id/:user_id
   */
  getDetailedAnalysis: async (
    params: DetailedAnalysisParams
  ): Promise<ChapterAnalysisData> => {
    const loadingKey = getLoadingStateKey("detailed_analysis", params);

    try {
      // Set loading state
      setLoadingState(loadingKey, { isLoading: true, error: null });

      const { quiz_id, user_id } = params;
      const apiCall = api.get<ChapterAnalyticsResponse<ChapterAnalysisData>>(
        `/quiz-results/detailed-analysis/${quiz_id}/${user_id}`
      );

      const response = await withTimeout(apiCall);

      if (!response.data.success) {
        throw new Error(
          response.data.message || API_ERROR_MESSAGES.CHAPTER_ANALYSIS_FAILED
        );
      }

      // Update loading state on success
      setLoadingState(loadingKey, {
        isLoading: false,
        error: null,
        lastFetch: Date.now(),
      });

      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Detailed Analysis Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : API_ERROR_MESSAGES.CHAPTER_ANALYSIS_FAILED;

      // Update loading state on error
      setLoadingState(loadingKey, {
        isLoading: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  },

  /**
   * Lấy phân tích tổng hợp theo môn học cho một user
   * Endpoint: /reports/subject/:subject_id/comprehensive-analysis/:user_id
   */
  getComprehensiveAnalysis: async (
    params: ComprehensiveAnalysisParams
  ): Promise<ComprehensiveAnalysisData> => {
    try {
      const { subject_id, user_id, start_date, end_date } = params;

      // Tạo query parameters cho date range nếu có
      const queryParams: Record<string, string> = {};
      if (start_date) queryParams.start_date = start_date;
      if (end_date) queryParams.end_date = end_date;

      const response = await api.get<
        ChapterAnalyticsResponse<ComprehensiveAnalysisData>
      >(`/reports/subject/${subject_id}/comprehensive-analysis/${user_id}`, {
        params: queryParams,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            API_ERROR_MESSAGES.COMPREHENSIVE_ANALYSIS_FAILED
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Comprehensive Analysis Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(API_ERROR_MESSAGES.COMPREHENSIVE_ANALYSIS_FAILED);
    }
  },

  /**
   * Lấy báo cáo phân tích tổng hợp cho giáo viên
   * Endpoint: /teacher-analytics/quiz/:quizId/comprehensive-report
   */
  getTeacherAnalytics: async (
    params: TeacherAnalyticsParams
  ): Promise<TeacherAnalyticsData> => {
    try {
      const {
        quiz_id,
        include_student_details = true,
        include_recommendations = true,
      } = params;

      // Tạo query parameters cho optional flags
      const queryParams: Record<string, string> = {};
      if (include_student_details !== undefined) {
        queryParams.include_student_details =
          include_student_details.toString();
      }
      if (include_recommendations !== undefined) {
        queryParams.include_recommendations =
          include_recommendations.toString();
      }

      const response = await api.get<
        ChapterAnalyticsResponse<TeacherAnalyticsData>
      >(`/teacher-analytics/quiz/${quiz_id}/comprehensive-report`, {
        params: queryParams,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || API_ERROR_MESSAGES.TEACHER_ANALYTICS_FAILED
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Teacher Analytics Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(API_ERROR_MESSAGES.TEACHER_ANALYTICS_FAILED);
    }
  },

  /**
   * Lấy dữ liệu tất cả nhóm học sinh để vẽ biểu đồ cột
   * Endpoint: /quiz/:quizId/student-groups
   */
  getStudentGroupsChart: async (quizId: number): Promise<any> => {
    try {
      const response = await api.get<ChapterAnalyticsResponse<any>>(
        `teacher-analytics/quiz/${quizId}/student-groups`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch student groups chart data"
        );
      }

      console.log("getStudentGroupsChart", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Student Groups Chart Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch student groups chart data");
    }
  },

  /**
   * Lấy phân tích chi tiết nhóm học sinh khi click vào cột
   * Endpoint: /quiz/:quizId/student-groups/:groupType
   */
  getStudentGroupAnalysis: async (
    quizId: number,
    groupType: string
  ): Promise<any> => {
    try {
      const response = await api.get<ChapterAnalyticsResponse<any>>(
        `/teacher-analytics/quiz/${quizId}/student-groups/${groupType}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch student group analysis"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Student Group Analysis Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch student group analysis");
    }
  },

  /**
   * Lấy phân tích chi tiết Learning Outcomes của từng học sinh
   * Endpoint: /quiz/:quizId/student/:userId/lo-analysis
   */
  getStudentLOAnalysis: async (
    quizId: number,
    userId: number
  ): Promise<any> => {
    try {
      const response = await api.get<ChapterAnalyticsResponse<any>>(
        `teacher-analytics/quiz/${quizId}/student/${userId}/lo-analysis`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch student LO analysis"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Student LO Analysis Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch student LO analysis");
    }
  },

  /**
   * Lấy danh sách câu hỏi theo LO
   * Endpoint: /quiz/:quizId/lo-questions?lo_id=...
   */
  getQuestionsByLO: async (
    quizId: number,
    loId: number,
    userId?: number
  ): Promise<any> => {
    try {
      const response = await api.get<ChapterAnalyticsResponse<any>>(
        `teacher-analytics/quiz/${quizId}/lo-questions`,
        {
          params: {
            lo_id: loId,
            ...(userId !== undefined ? { userId } : {}),
          },
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch questions by LO"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Questions by LO Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch questions by LO");
    }
  },

  /**
   * Lấy teaching insights cho quiz
   * Endpoint: /teacher-analytics/quiz/:quizId/teaching-insights
   */
  getTeachingInsights: async (quizId: number): Promise<any> => {
    try {
      const response = await api.get<ChapterAnalyticsResponse<any>>(
        `/teacher-analytics/quiz/${quizId}/teaching-insights`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch teaching insights"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Teaching Insights Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch teaching insights");
    }
  },

  /**
   * Lấy quiz benchmark data
   * Endpoint: /teacher-analytics/quiz/:quizId/benchmark
   */
  getQuizBenchmark: async (
    quizId: number,
    options?: {
      compareWithSubject?: boolean;
      compareWithTeacher?: boolean;
    }
  ): Promise<any> => {
    try {
      const queryParams: Record<string, string> = {};
      if (options?.compareWithSubject !== undefined) {
        queryParams.compare_with_subject = String(options.compareWithSubject);
      }
      if (options?.compareWithTeacher !== undefined) {
        queryParams.compare_with_teacher = String(options.compareWithTeacher);
      }

      const response = await api.get<ChapterAnalyticsResponse<any>>(
        `/teacher-analytics/quiz/${quizId}/benchmark`,
        {
          params: queryParams,
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch quiz benchmark"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Quiz Benchmark Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch quiz benchmark");
    }
  },

  /**
   * Lấy quiz comparison data
   * Endpoint: /teacher-analytics/quiz-comparison
   */
  getQuizComparison: async (options: {
    quizIds?: number[];
    subjectId?: number;
  }): Promise<any> => {
    try {
      const queryParams: Record<string, string> = {};
      if (options.quizIds) {
        queryParams.quiz_ids = options.quizIds.join(",");
      }
      if (options.subjectId) {
        queryParams.subject_id = String(options.subjectId);
      }

      const response = await api.get<ChapterAnalyticsResponse<any>>(
        `/teacher-analytics/quiz-comparison`,
        {
          params: queryParams,
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch quiz comparison"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Chapter Analytics - Quiz Comparison Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch quiz comparison");
    }
  },

  /**
   * Retry logic cho failed API calls
   * Thử lại request với exponential backoff
   */
  retryRequest: async <T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // Không retry cho lỗi 4xx (client errors)
        if (error instanceof Error && error.message.includes("40")) {
          throw error;
        }

        // Nếu đây là attempt cuối cùng, throw error
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff delay
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));

        console.warn(
          `Chapter Analytics - Retry attempt ${
            attempt + 1
          }/${maxRetries} after ${delay}ms`
        );
      }
    }

    throw lastError!;
  },

  /**
   * Wrapper methods với retry logic
   */
  getDetailedAnalysisWithRetry: async (
    params: DetailedAnalysisParams,
    maxRetries?: number
  ): Promise<ChapterAnalysisData> => {
    return chapterAnalyticsService.retryRequest(
      () => chapterAnalyticsService.getDetailedAnalysis(params),
      maxRetries
    );
  },

  getComprehensiveAnalysisWithRetry: async (
    params: ComprehensiveAnalysisParams,
    maxRetries?: number
  ): Promise<ComprehensiveAnalysisData> => {
    return chapterAnalyticsService.retryRequest(
      () => chapterAnalyticsService.getComprehensiveAnalysis(params),
      maxRetries
    );
  },

  getTeacherAnalyticsWithRetry: async (
    params: TeacherAnalyticsParams,
    maxRetries?: number
  ): Promise<TeacherAnalyticsData> => {
    return chapterAnalyticsService.retryRequest(
      () => chapterAnalyticsService.getTeacherAnalytics(params),
      maxRetries
    );
  },

  /**
   * Loading state management methods
   */
  getLoadingState: (type: string, params: any): LoadingState => {
    const key = getLoadingStateKey(type, params);
    return getLoadingState(key);
  },

  isLoading: (type: string, params: any): boolean => {
    return chapterAnalyticsService.getLoadingState(type, params).isLoading;
  },

  getError: (type: string, params: any): string | null => {
    return chapterAnalyticsService.getLoadingState(type, params).error;
  },

  clearError: (type: string, params: any): void => {
    const key = getLoadingStateKey(type, params);
    setLoadingState(key, { error: null });
  },

  clearAllLoadingStates: (): void => {
    Object.keys(loadingStates).forEach((key) => {
      delete loadingStates[key];
    });
  },

  /**
   * Cache management
   */
  isCacheValid: (
    type: string,
    params: any,
    maxAgeMs: number = 300000
  ): boolean => {
    const state = chapterAnalyticsService.getLoadingState(type, params);
    if (!state.lastFetch) return false;
    return Date.now() - state.lastFetch < maxAgeMs;
  },

  /**
   * Lấy dữ liệu biểu đồ Learning Outcomes
   * Endpoint: /quiz/:quizId/learning-outcomes
   */
  getLearningOutcomesChart: async (
    quizId: number
  ): Promise<LearningOutcomesChartResponse> => {
    try {
      const response = await api.get<
        ChapterAnalyticsResponse<LearningOutcomesChartResponse>
      >(`teacher-analytics/quiz/${quizId}/learning-outcomes`);

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to fetch learning outcomes chart data"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error(
        "Chapter Analytics - Learning Outcomes Chart Error:",
        error
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch learning outcomes chart data");
    }
  },

  /**
   * Lấy chi tiết Learning Outcome khi click vào cột
   * Endpoint: /quiz/:quizId/learning-outcomes/:loId
   */
  getLearningOutcomeDetail: async (
    quizId: number,
    loId: number
  ): Promise<LearningOutcomeDetailData> => {
    try {
      const response = await api.get<
        ChapterAnalyticsResponse<LearningOutcomeDetailData>
      >(`teacher-analytics/quiz/${quizId}/learning-outcomes/${loId}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch learning outcome detail"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error(
        "Chapter Analytics - Learning Outcome Detail Error:",
        error
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch learning outcome detail");
    }
  },

  /**
   * Lấy dữ liệu phân bố độ khó - Learning Outcomes cho quiz
   * Endpoint: /teacher-analytics/quiz/:quizId/difficulty-lo-distribution
   */
  getDifficultyLODistribution: async (quizId: number): Promise<any> => {
    try {
      console.log("Fetching difficulty-LO distribution for quiz:", quizId);

      const response = await api.get<any>(
        `teacher-analytics/quiz/${quizId}/difficulty-lo-distribution`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch difficulty-LO distribution"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error(
        "Chapter Analytics - Difficulty-LO Distribution Error:",
        error
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch difficulty-LO distribution");
    }
  },

  /**
   * Lấy danh sách câu hỏi theo LO và độ khó (dùng cho click heatmap)
   * Endpoint: /teacher-analytics/quiz/:quizId/difficulty-lo-questions
   */
  getQuestionsByDifficultyAndLO: async (
    quizId: number,
    loId: number,
    levelId: number
  ): Promise<any> => {
    try {
      console.log("Fetching questions by difficulty and LO:", {
        quizId,
        loId,
        levelId,
      });

      const response = await api.get<any>(
        `teacher-analytics/quiz/${quizId}/difficulty-lo-questions`,
        {
          params: {
            lo_id: loId,
            level_id: levelId,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.error ||
            "Failed to fetch questions by difficulty and LO"
        );
      }
      console.log("getQuestionsByDifficultyAndLO", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error(
        "Chapter Analytics - Questions by Difficulty and LO Error:",
        error
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch questions by difficulty and LO");
    }
  },
};

export default chapterAnalyticsService;
