import api from "./client";

export interface TimeSeriesParams {
  program_id?: number;
  subject_id?: number;
  quiz_id?: number;
  user_id?: number;
  time_period?: "7d" | "30d" | "3m" | "6m" | "1y";
  aggregation?: "daily" | "weekly" | "monthly";
}

export interface ScoreDistributionParams {
  program_id?: number;
  subject_id?: number;
  quiz_id?: number;
  bins?: number;
  comparison_period?: string;
}

export interface LearningOutcomesParams {
  program_id?: number;
  subject_id?: number;
  user_id?: number;
  comparison_type?: "average" | "top_performer" | "user_vs_average";
}

export interface DifficultyHeatmapParams {
  program_id?: number;
  subject_id?: number;
  quiz_id?: number;
  time_period?: string;
}

export interface ActivityTimelineParams {
  program_id?: number;
  subject_id?: number;
  quiz_id?: number;
  user_id?: number;
  time_period?: string;
  granularity?: "hourly" | "daily" | "weekly";
}

export interface StudentScoreAnalysisParams {
  user_id: number;
  program_id?: number;
  subject_id?: number;
  time_period?: "1m" | "3m" | "6m" | "1y";
  include_comparison?: boolean;
}

export interface LearningOutcomeMasteryParams {
  user_id: number;
  subject_id?: number;
  program_id?: number;
  mastery_threshold?: number;
}

export interface ImprovementSuggestionsParams {
  user_id: number;
  lo_id?: number;
  subject_id?: number;
  program_id?: number;
  suggestion_depth?: "basic" | "detailed" | "comprehensive";
}

export interface DashboardOverviewParams {
  program_id?: number;
  subject_id?: number;
  time_period?: string;
}

export interface ExportReportParams {
  program_id?: number;
  subject_id?: number;
  time_period?: string;
  format?: "json" | "csv" | "pdf";
}

const buildQueryParams = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  return queryParams.toString();
};

export const advancedAnalyticsService = {
  // Performance Analytics
  getTimeSeriesPerformance: async (params?: TimeSeriesParams) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/performance/time-series?${queryString}`
      : "/advanced-analytics/performance/time-series";
    const response = await api.get(url);
    return response.data;
  },

  getScoreDistribution: async (params?: ScoreDistributionParams) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/performance/score-distribution?${queryString}`
      : "/advanced-analytics/performance/score-distribution";
    const response = await api.get(url);
    return response.data;
  },

  getLearningOutcomesComparison: async (params?: LearningOutcomesParams) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/performance/learning-outcomes?${queryString}`
      : "/advanced-analytics/performance/learning-outcomes";
    const response = await api.get(url);
    return response.data;
  },

  getCompletionFunnel: async (params?: {
    program_id?: number;
    subject_id?: number;
    quiz_id?: number;
  }) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/performance/completion-funnel?${queryString}`
      : "/advanced-analytics/performance/completion-funnel";
    const response = await api.get(url);
    return response.data;
  },

  // Difficulty Analysis
  getDifficultyHeatmap: async (params?: DifficultyHeatmapParams) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/difficulty/heatmap?${queryString}`
      : "/advanced-analytics/difficulty/heatmap";
    const response = await api.get(url);
    return response.data;
  },

  getTimeScoreCorrelation: async (params?: {
    program_id?: number;
    subject_id?: number;
    quiz_id?: number;
  }) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/difficulty/time-score-correlation?${queryString}`
      : "/advanced-analytics/difficulty/time-score-correlation";
    const response = await api.get(url);
    return response.data;
  },

  // Behavior Analytics
  getActivityTimeline: async (params?: ActivityTimelineParams) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/behavior/activity-timeline?${queryString}`
      : "/advanced-analytics/behavior/activity-timeline";
    const response = await api.get(url);
    return response.data;
  },

  getLearningFlow: async (params?: {
    program_id?: number;
    subject_id?: number;
    user_id?: number;
  }) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/behavior/learning-flow?${queryString}`
      : "/advanced-analytics/behavior/learning-flow";
    const response = await api.get(url);
    return response.data;
  },

  // Student Analytics
  getStudentScoreAnalysis: async (params: StudentScoreAnalysisParams) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(
      `/advanced-analytics/student/score-analysis?${queryString}`
    );
    return response.data;
  },

  getLearningOutcomeMastery: async (params: LearningOutcomeMasteryParams) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(
      `/advanced-analytics/student/learning-outcome-mastery?${queryString}`
    );
    return response.data;
  },

  getImprovementSuggestions: async (params: ImprovementSuggestionsParams) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(
      `/advanced-analytics/student/improvement-suggestions?${queryString}`
    );
    return response.data;
  },

  // Dashboard & Export
  getDashboardOverview: async (params?: DashboardOverviewParams) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/dashboard/overview?${queryString}`
      : "/advanced-analytics/dashboard/overview";
    const response = await api.get(url);
    return response.data;
  },

  exportReport: async (params?: ExportReportParams) => {
    const queryString = params ? buildQueryParams(params) : "";
    const url = queryString
      ? `/advanced-analytics/export/report?${queryString}`
      : "/advanced-analytics/export/report";
    const response = await api.get(url);
    return response.data;
  },

  // Test endpoints
  testEndpoints: async () => {
    const response = await api.get("/advanced-analytics/test/endpoints");
    return response.data;
  },

  getSampleData: async () => {
    const response = await api.get("/advanced-analytics/test/sample-data");
    return response.data;
  },
};

export default advancedAnalyticsService;
