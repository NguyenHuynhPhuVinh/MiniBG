// Time Series Performance Data
export interface TimeSeriesDataPoint {
  period: string;
  avg_score: string;
  total_attempts: number;
  high_score_rate: string;
  score_range: number;
  score_stddev: string;
}

export interface TrendAnalysis {
  trend_direction: "improving" | "declining" | "stable";
  trend_strength: string;
  slope: string;
  r_squared: string;
  confidence: "high" | "medium" | "low";
}

export interface TimeSeriesResponse {
  success: boolean;
  data: {
    time_series: TimeSeriesDataPoint[];
    trend_analysis: TrendAnalysis;
  };
}

// Score Distribution
export interface HistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
  percentage: string;
}

export interface StatisticalSummary {
  mean: string;
  median: string;
  std_dev: string;
  skewness: string;
  kurtosis: string;
}

export interface ScoreDistributionResponse {
  success: boolean;
  data: {
    current_period: {
      histogram: HistogramBin[];
      statistics: StatisticalSummary;
    };
    comparison_period?: {
      histogram: HistogramBin[];
      statistics: StatisticalSummary;
    };
  };
}

// Completion Funnel
export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  conversion_rate: string;
}

export interface FunnelSummary {
  completion_rate: string;
  pass_rate: string;
  excellence_rate: string;
}

export interface CompletionFunnelResponse {
  success: boolean;
  data: {
    funnel_stages: FunnelStage[];
    summary: FunnelSummary;
  };
}

// Difficulty Heatmap
export interface HeatmapDataPoint {
  chapter: string;
  level: string;
  difficulty_score: string;
  accuracy_rate: string;
  avg_response_time: string;
}

export interface HeatmapAxisLabels {
  chapters: string[];
  levels: string[];
}

export interface HeatmapSummary {
  avg_difficulty: string;
  most_difficult: {
    chapter: string;
    level: string;
    difficulty_score: string;
  };
}

export interface DifficultyHeatmapResponse {
  success: boolean;
  data: {
    heatmap_data: HeatmapDataPoint[];
    axis_labels: HeatmapAxisLabels;
    summary: HeatmapSummary;
  };
}

// Time vs Score Correlation
export interface ScatterPlotPoint {
  x: number;
  y: number;
  user_id: number;
  quiz_id: number;
  is_outlier: boolean;
}

export interface CorrelationAnalysis {
  correlation_coefficient: string;
  sample_size: number;
  significance: "high" | "medium" | "low";
  interpretation: string;
}

export interface OutlierInfo {
  score_outliers: {
    outlier_count: number;
    outlier_percentage: string;
  };
}

export interface TimeScoreCorrelationResponse {
  success: boolean;
  data: {
    correlation_analysis: CorrelationAnalysis;
    scatter_plot_data: ScatterPlotPoint[];
    outliers: OutlierInfo;
  };
}

// Activity Timeline
export interface ActivityTimelinePoint {
  time_period: string;
  total_attempts: number;
  accuracy_rate: string;
  avg_response_time: string;
  active_users: number;
  activity_intensity: "high" | "medium" | "low";
}

export interface ActivityPatterns {
  activity_trend: "increasing" | "decreasing" | "stable";
  consistency_score: string;
  peak_periods: Array<{
    period: string;
    attempts: number;
  }>;
}

export interface ActivityTimelineResponse {
  success: boolean;
  data: {
    timeline: ActivityTimelinePoint[];
    patterns: ActivityPatterns;
  };
}

// Learning Flow
export interface FlowPattern {
  path: string;
  count: number;
}

export interface TransitionMatrix {
  transition: string;
  count: number;
}

export interface LearningFlowSummary {
  total_users: number;
  avg_path_length: string;
  completion_rate: number;
}

export interface LearningFlowResponse {
  success: boolean;
  data: {
    flow_patterns: FlowPattern[];
    transition_matrix: TransitionMatrix[];
    summary: LearningFlowSummary;
  };
}

// Student Score Analysis
export interface OverallPerformance {
  total_attempts: number;
  correct_attempts: number;
  accuracy_rate: string;
  avg_response_time: string;
  performance_grade: string;
}

export interface StrengthWeakness {
  type: string;
  name: string;
  accuracy: string;
  reason: string;
  priority?: "high" | "medium" | "low";
}

export interface PersonalizedRecommendation {
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  actions: string[];
  estimated_time: string;
}

export interface PeerComparison {
  user_accuracy: string;
  peer_average: string;
  comparison: "above_average" | "slightly_above_average" | "average" | "below_average";
  estimated_percentile: number;
  message: string;
}

export interface StudentScoreAnalysisResponse {
  success: boolean;
  data: {
    user_id: number;
    overall_performance: OverallPerformance;
    strengths_weaknesses: {
      strengths: StrengthWeakness[];
      weaknesses: StrengthWeakness[];
    };
    personalized_recommendations: PersonalizedRecommendation[];
    comparison_with_peers: PeerComparison;
  };
}

// Learning Outcome Mastery
export interface DifficultyDistribution {
  [key: string]: {
    total: number;
    correct: number;
    accuracy: number;
  };
}

export interface LearningOutcome {
  lo_id: number;
  lo_name: string;
  chapter: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy_rate: number;
  mastery_level: "mastered" | "developing" | "needs_improvement" | "not_started";
  improvement_trend: "improving" | "stable" | "declining";
  difficulty_distribution: DifficultyDistribution;
}

export interface MasterySummary {
  total_los: number;
  mastered_count: number;
  developing_count: number;
  needs_improvement_count: number;
  not_started_count: number;
  overall_mastery_rate: string;
}

export interface MasteryRecommendation {
  priority: "high" | "medium" | "low";
  lo_id: number;
  lo_name: string;
  current_accuracy: string;
  target_accuracy: string;
  recommendation: string;
  specific_actions: string[];
}

export interface LearningOutcomeMasteryResponse {
  success: boolean;
  data: {
    user_id: number;
    mastery_threshold: number;
    summary: MasterySummary;
    learning_outcomes: LearningOutcome[];
    recommendations: MasteryRecommendation[];
  };
}

// Dashboard Overview
export interface DashboardOverviewResponse {
  success: boolean;
  data: {
    performance_summary: any;
    difficulty_analysis: any;
    behavior_insights: any;
    recommendations: any;
  };
}
