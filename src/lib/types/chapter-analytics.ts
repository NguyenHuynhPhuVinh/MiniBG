// Types cho Chapter Analytics API responses - Enhanced with NEW Learning Analysis APIs

// Content type definition
export type ContentType = "text" | "video" | "exercise";

// Performance level definition
export type PerformanceLevel =
  | "excellent"
  | "good"
  | "average"
  | "weak"
  | "below_average"
  | "poor"
  | "needs_improvement";

// Priority level definition (NEW API)
export type PriorityLevel = "critical" | "high" | "medium" | "low";

// LO Status definition (NEW API)
export type LOStatus = "achieved" | "in_progress" | "needs_attention";

// Question interface for analytics
export interface AnalyticsQuestion {
  question_id: number;
  is_correct: boolean;
  time_spent: number;
  lo_name?: string;
}

// Section interface
export interface Section {
  section_id: number;
  title: string;
  content?: string;
  order?: number | null;
  content_type?: ContentType;
  has_content?: boolean;
}

// Chapter analysis item interface
export interface ChapterAnalysisItem {
  chapter_id: number;
  chapter_name: string;
  chapter_description?: string;
  sections?: Section[];
  total_questions: number;
  correct_answers: number;
  total_time_spent: number;
  related_los: string[];
  questions: AnalyticsQuestion[];
  accuracy_percentage: number;
  average_time_per_question: number;
  performance_level: PerformanceLevel;
  los_covered?: number;
}

// Learning Outcome analysis item interface
export interface LearningOutcomeAnalysisItem {
  lo_id: number;
  lo_name: string;
  lo_description: string;
  total_questions: number;
  correct_answers: number;
  total_time_spent: number;
  questions: AnalyticsQuestion[];
  accuracy_percentage: number;
  average_time_per_question: number;
  performance_level: PerformanceLevel;
}

// Difficulty analysis item interface
export interface DifficultyAnalysisItem {
  level_id: number;
  level_name: string;
  total_questions: number;
  correct_answers: number;
  total_time_spent: number;
  questions: AnalyticsQuestion[];
  accuracy_percentage: number;
  average_time_per_question: number;
  performance_level: PerformanceLevel;
}

// NEW API: Enhanced Priority Area Interface
export interface EnhancedPriorityArea {
  type: "learning_outcome" | "difficulty";
  lo_id?: number;
  lo_name?: string;
  level_id?: number;
  level_name?: string;
  current_accuracy: number;
  target_accuracy: number;
  priority_level: PriorityLevel;
  improvement_needed: number;
}

// NEW API: Enhanced Study Plan Phase Interface
export interface EnhancedStudyPlanPhase {
  phase: string;
  focus: string;
  activities: string[];
}

// NEW API: Enhanced Recommended Chapter Interface
export interface EnhancedRecommendedChapter {
  chapter_id: number;
  chapter_name: string;
  lo_name: string;
  sections: Section[];
  study_priority: PriorityLevel;
}

// NEW API: Learning Strategy Interface
export interface LearningStrategy {
  difficulty_level: string;
  current_accuracy: number;
  strategy: string;
  recommended_practice_time: string;
}

// NEW API: Enhanced Improvement Suggestions Interface
export interface EnhancedImprovementSuggestions {
  priority_areas: EnhancedPriorityArea[];
  study_plan: EnhancedStudyPlanPhase[];
  recommended_chapters: EnhancedRecommendedChapter[];
  learning_strategies: LearningStrategy[];
}

// Legacy interfaces (keeping for backward compatibility)
export interface SectionRecommendation {
  section_id: number;
  section_name: string;
  content_type: ContentType;
  mastery_level: number;
  recommendation: string;
  priority: "high" | "medium" | "low";
  estimated_study_time: number; // in minutes
}

// Main interfaces cho API responses

// Interface cho /quiz-results/detailed-analysis/:quiz_id/:user_id
export interface ChapterAnalysisData {
  quiz_info: {
    quiz_id: number;
    quiz_name: string;
    subject: {
      subject_id: number;
      name: string;
      description?: string;
    };
    total_questions: number;
    completion_date: string;
  };
  student_info: {
    user_id: number;
    name: string;
    email: string;
  };
  overall_performance: {
    final_score: number;
    total_questions_answered: number;
    correct_answers: number;
    accuracy_percentage: number;
    total_time_spent_seconds: number;
    average_time_per_question_seconds: number;
    performance_level: PerformanceLevel;
  };
  question_distribution: {
    // NEW API: by_learning_outcome instead of by_chapter
    by_learning_outcome?: Array<{
      lo_id: number;
      lo_name: string;
      question_count: number;
      percentage: number;
    }>;
    // LEGACY: by_chapter for backward compatibility
    by_chapter?: Array<{
      chapter_id: number;
      chapter_name: string;
      question_count: number;
      percentage: number;
      related_los: string[];
    }>;
    // NEW API: Enhanced difficulty distribution
    by_difficulty: Array<{
      level_id: number;
      level_name: string;
      question_count: number;
      percentage: number;
    }>;
    total_questions: number;
  };
  chapter_analysis: {
    strengths: ChapterAnalysisItem[];
    weaknesses: ChapterAnalysisItem[];
    neutral: ChapterAnalysisItem[];
    overall_stats: {
      total_chapters_tested: number;
      strong_chapters: number;
      weak_chapters: number;
      neutral_chapters: number;
    };
    summary: {
      total_chapters_covered: number;
      strong_chapters_count: number;
      weak_chapters_count: number;
      chapters_needing_attention: Array<{
        chapter_id: number;
        chapter_name: string;
        accuracy: number;
        gap_to_target: number;
        related_los: string[];
        sections: Section[];
      }>;
    };
  };
  // NEW API: Enhanced Learning Outcome Analysis
  learning_outcome_analysis: {
    strengths: Array<{
      lo_id: number;
      lo_name: string;
      lo_description?: string;
      accuracy_percentage: number;
      performance_level: PerformanceLevel;
      total_questions: number;
      correct_answers: number;
    }>;
    weaknesses: Array<{
      lo_id: number;
      lo_name: string;
      lo_description?: string;
      accuracy_percentage: number;
      performance_level: PerformanceLevel;
      total_questions: number;
      correct_answers: number;
    }>;
    summary: {
      total_los_covered: number;
      strong_areas_count: number;
      weak_areas_count: number;
      areas_needing_attention: Array<{
        lo_id: number;
        lo_name: string;
        accuracy_percentage: number;
        performance_level: PerformanceLevel;
        total_questions: number;
        correct_answers: number;
      }>;
    };
  };
  // NEW API: Enhanced Difficulty Analysis
  difficulty_analysis: {
    strengths: Array<{
      level_id: number;
      level_name: string;
      accuracy_percentage: number;
      performance_level: PerformanceLevel;
      total_questions: number;
      correct_answers: number;
    }>;
    weaknesses: Array<{
      level_id: number;
      level_name: string;
      accuracy_percentage: number;
      performance_level: PerformanceLevel;
      total_questions: number;
      correct_answers: number;
    }>;
    summary: {
      total_levels_tested: number;
      strong_levels_count: number;
      weak_levels_count: number;
      challenging_areas: Array<{
        level_id: number;
        level_name: string;
        accuracy_percentage: number;
        improvement_needed: number;
        note: string;
      }>;
    };
  };
  // ENHANCED: Improvement Suggestions (supports both old and new API)
  improvement_suggestions:
    | EnhancedImprovementSuggestions
    | {
        priority_areas: string[];
        study_plan: Array<{
          phase: string;
          focus: string;
          activities: string[];
        }>;
        recommended_chapters: any[];
        learning_strategies: string[];
      };
  learning_insights: {
    what_you_did_well: string;
    areas_for_improvement: string;
    next_steps: string;
    study_chapters: Array<{
      chapter_name: string;
      accuracy: number;
      sections_to_review: string[];
      related_concepts: string[];
      note: string;
    }>;
  };
  generated_at: string;
}

// Interface cho /reports/subject/:subject_id/comprehensive-analysis/:user_id - ACTUAL API STRUCTURE
export interface ComprehensiveAnalysisData {
  subject_info: {
    subject_id: number;
    subject_name: string;
    description: string;
    total_quizzes: number;
    completed_quizzes: number;
  };
  student_info: {
    user_id: number;
    name: string;
    email: string;
  };
  overall_performance: {
    total_questions_answered: number;
    correct_answers: number;
    overall_accuracy_percentage: number;
    average_quiz_score: number;
    total_time_spent_seconds: number;
    performance_level: "excellent" | "good" | "average" | "weak";
  };
  chapter_completion_chart: {
    labels: string[];
    completion_percentages: number[];
    target_line: number;
    chart_data: Array<{
      chapter_id: number;
      chapter_name: string;
      completion_percentage: number;
      status: "achieved" | "in_progress" | "needs_attention";
      gap_to_target: number;
      related_los: string[];
      sections: Array<{
        section_id: number;
        title: string;
        content_type: "text" | "video" | "exercise";
        has_content: boolean;
        order: number | null;
      }>;
    }>;
  };
  chapter_analysis: {
    strengths: Array<ChapterAnalysisItem>;
    weaknesses: Array<ChapterAnalysisItem>;
    neutral: Array<ChapterAnalysisItem>;
    overall_stats: {
      total_chapters_tested: number;
      strong_chapters: number;
      weak_chapters: number;
      neutral_chapters: number;
    };
    achievement_summary: {
      total_chapters: number;
      achieved_chapters: number;
      in_progress_chapters: number;
      needs_attention_chapters: number;
    };
  };
  learning_outcome_analysis: {
    strengths: Array<LearningOutcomeAnalysisItem>;
    weaknesses: Array<LearningOutcomeAnalysisItem>;
    neutral: Array<LearningOutcomeAnalysisItem>;
    overall_stats: {
      total_los_tested: number;
      strong_los: number;
      weak_los: number;
      neutral_los: number;
    };
    achievement_summary: {
      total_los: number;
      achieved_los: number;
      weak_los: number;
      neutral_los: number;
    };
  };
  improvement_suggestions: {
    priority_areas: string[];
    study_plan: Array<{
      phase: string;
      focus: string;
      activities: string[];
    }>;
    recommended_chapters: string[];
    learning_strategies: string[];
  };
  quiz_breakdown: Array<{
    quiz_id: number;
    quiz_name: string;
    score: number;
    completion_date: string;
    status: "completed" | "in_progress" | "not_started";
  }>;
  learning_insights: {
    subject_mastery_level: string;
    strongest_chapters: string[];
    chapters_needing_improvement: string[];
    recommended_focus: string;
    next_learning_phase: string;
    study_recommendations: Array<{
      chapter_name: string;
      current_accuracy: number;
      sections_to_review: string[];
      related_concepts: string[];
      priority: "high" | "medium" | "low" | "none";
      note: string;
    }>;
  };
  generated_at: string;
}

// Interface cho /teacher-analytics/quiz/:quizId/comprehensive-report - Updated to match actual API response
export interface TeacherAnalyticsData {
  quiz_info: {
    quiz_id: number;
    name: string;
    subject_name: string;
    total_questions: number;
    duration: number;
    status: string;
  };
  participant_stats: {
    total_participants: number;
    completed_participants: number;
    completion_rate: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
  };
  learning_outcome_analysis: Array<{
    lo_id: number;
    lo_name: string;
    total_questions: number;
    total_attempts: number;
    correct_attempts: number;
    total_time: number;
    students_attempted: number;
    accuracy: number;
    average_time: number;
    performance_level: "excellent" | "good" | "average" | "weak";
    insights: string[];
    recommendations: string[];
  }>;
  difficulty_level_analysis: Array<{
    level_id: number;
    level_name: string;
    total_questions: number;
    total_attempts: number;
    correct_attempts: number;
    total_time: number;
    students_attempted: number;
    accuracy: number;
    average_time: number;
    performance_level: "excellent" | "good" | "average" | "weak";
    insights: string[];
    recommendations: string[];
  }>;
  student_performance_groups: {
    excellent: {
      threshold: number;
      students: Array<{
        user_id: number;
        name: string;
        email: string;
        score: number;
        percentage_score: number;
        completion_time: number | null;
        average_time_per_question: number;
        total_questions_attempted: number;
        correct_answers: number;
      }>;
      insights: string[];
    };
    good: {
      threshold: number;
      students: Array<{
        user_id: number;
        name: string;
        email: string;
        score: number;
        percentage_score: number;
        completion_time: number | null;
        average_time_per_question: number;
        total_questions_attempted: number;
        correct_answers: number;
      }>;
      insights: string[];
    };
    average: {
      threshold: number;
      students: Array<{
        user_id: number;
        name: string;
        email: string;
        score: number;
        percentage_score: number;
        completion_time: number | null;
        average_time_per_question: number;
        total_questions_attempted: number;
        correct_answers: number;
      }>;
      insights: string[];
    };
    weak: {
      threshold: number;
      students: Array<{
        user_id: number;
        name: string;
        email: string;
        score: number;
        percentage_score: number;
        completion_time: number | null;
        average_time_per_question: number;
        total_questions_attempted: number;
        correct_answers: number;
      }>;
      insights: string[];
    };
  };
  teacher_insights: {
    insights: Array<{
      type: "warning" | "info" | "success";
      category: string;
      message: string;
      priority: "high" | "medium" | "low";
    }>;
    recommendations: Array<{
      category: string;
      suggestion: string;
      priority: "high" | "medium" | "low";
    }>;
  };
  generated_at: string;
}

// Common response wrapper interface
export interface ChapterAnalyticsResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// Error response interface
export interface ChapterAnalyticsError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
  timestamp: string;
}

// API method parameter interfaces
export interface DetailedAnalysisParams {
  quiz_id: number;
  user_id: number;
}

export interface ComprehensiveAnalysisParams {
  subject_id: number;
  user_id: number;
  start_date?: string;
  end_date?: string;
}

export interface TeacherAnalyticsParams {
  quiz_id: number;
  include_student_details?: boolean;
  include_recommendations?: boolean;
}

// Interface cho Student Group Analysis API response - Updated to match actual API structure
export interface StudentGroupAnalysisData {
  quiz_info: {
    quiz_id: number;
    name: string;
    total_questions: number;
  };
  group_overview: {
    group_name: "excellent" | "good" | "average" | "weak";
    student_count: number;
    score_range: {
      min: number;
      max: number;
      average: number;
    };
    completion_stats: {
      total_questions: number;
      average_correct: number;
      average_time_per_question: number;
    };
    insights: string[];
    recommendations: Array<{
      type: string;
      suggestion: string;
      priority: "high" | "medium" | "low";
    }>;
  };
  students: Array<{
    user_id: number;
    name: string;
    email: string;
    score: number;
    percentage_score: number;
    completion_time: number | null;
    average_time_per_question: number;
    total_questions_attempted: number;
    correct_answers: number;
  }>;
  learning_outcome_analysis: Array<{
    lo_id: number;
    lo_name: string;
    total_questions: number;
    total_attempts: number;
    correct_attempts: number;
    total_time: number;
    students_attempted: number;
    accuracy: number;
    average_time: number;
    performance_level: "excellent" | "good" | "average" | "weak";
    insights: string[];
    recommendations: string[];
  }>;
  difficulty_level_analysis: Array<{
    level_id: number;
    level_name: string;
    total_questions: number;
    total_attempts: number;
    correct_attempts: number;
    total_time: number;
    students_attempted: number;
    accuracy: number;
    average_time: number;
    performance_level: "excellent" | "good" | "average" | "weak";
    insights: string[];
    recommendations: string[];
  }>;
  generated_at: string;
}

// Interface cho Teaching Insights API response - Updated to match actual API structure
export interface TeachingInsightsData {
  quiz_info: {
    quiz_id: number;
    name: string;
    subject_name: string;
  };
  summary_insights: {
    overall_assessment:
      | "excellent"
      | "good"
      | "mixed"
      | "concerning"
      | "needs_improvement";
    key_strengths: string[];
    main_challenges: string[];
    immediate_actions_needed: number;
    long_term_improvements: number;
  };
  detailed_insights: {
    curriculum_insights: Array<{
      type: "strength" | "weakness" | "opportunity";
      message: string;
      impact: "positive" | "negative" | "neutral";
    }>;
    teaching_method_insights: Array<{
      type: "time_concern" | "difficulty" | "engagement" | "effectiveness";
      message: string;
      suggestion?: string;
    }>;
    student_insights: Array<{
      type: "concern" | "strength" | "opportunity";
      message: string;
      affected_count?: number;
    }>;
    action_recommendations: Array<{
      category:
        | "question_improvement"
        | "teaching_method"
        | "student_support"
        | "curriculum_revision";
      action: string;
      priority: "high" | "medium" | "low";
      timeline: "immediate" | "next_quiz" | "short_term" | "long_term";
    }>;
    priority_actions: Array<{
      action: string;
      urgency: "high" | "medium" | "low";
      estimated_time: string;
      expected_outcome: string;
    }>;
  };
  metrics: {
    total_participants: number;
    average_score: number;
    completion_rate: number;
    weak_los_count: number;
    strong_los_count: number;
    weak_students_count: number;
    excellent_students_count: number;
  };
  generated_at: string;
}

// Learning Outcomes Chart Data Interface (Updated for new backend)
export interface LearningOutcomesChartData {
  lo_id: number;
  lo_name: string;
  lo_description?: string;
  completion_rate: number; // % hoàn thành
  students_completed: number; // ≥70%
  students_partial: number; // 40-69%
  students_not_started: number; // <40%
  total_students_attempted: number;
  total_questions: number;
  performance_level:
    | "excellent"
    | "good"
    | "average"
    | "below_average"
    | "poor";
  average_score?: number;
  difficulty_level?: string;
  teaching_recommendation?: string;
  strength_weakness?: {
    is_strength: boolean;
    is_weakness: boolean;
    needs_attention: boolean;
    priority_level: "low" | "medium" | "high" | "critical";
  };
}

export interface LearningOutcomesChartResponse {
  chart_data: LearningOutcomesChartData[];
  summary?: {
    total_students: number;
    total_los: number;
    quiz_name: string;
    quiz_id: number;
  };
  teacher_insights?: {
    overall_performance: {
      average_completion_rate: number;
      performance_level:
        | "excellent"
        | "good"
        | "average"
        | "below_average"
        | "poor";
      total_los: number;
    };
    strengths?: {
      count: number;
      los: Array<{ lo_name: string; completion_rate: number }>;
    };
    weaknesses?: {
      count: number;
      los: Array<{
        lo_name: string;
        completion_rate: number;
        priority?: "low" | "medium" | "high" | "critical";
      }>;
    };
    teaching_recommendations?: string[];
  };
}

// Learning Outcome Detail Interface (Based on actual API response)
export interface LearningOutcomeDetailData {
  lo_info: {
    lo_id: number;
    lo_name: string;
    description: string;
    total_questions: number;
    accuracy: number; // Overall accuracy của LO này
    performance_level: "excellent" | "good" | "average" | "weak";
    related_chapters?: Array<{
      chapter_id: number;
      chapter_name: string;
      subject?: {
        subject_id: number;
        subject_name: string;
      };
      sections?: Array<{
        section_id: number;
        title: string;
        content_preview?: string;
        order?: number;
      }>;
    }>;
  };
  question_breakdown: Array<{
    question_id: number;
    question_text: string;
    difficulty: string;
    correct_count: number;
    total_attempts: number;
    accuracy: number;
    insights: string[];
  }>;
  student_performance: Array<{
    performance_level: "excellent" | "good" | "average" | "weak";
    student_count: number;
    students: Array<{
      user_id: number;
      name: string;
      correct_count: number;
      total_count: number;
      accuracy: number;
    }>;
  }>;
  insights: string[];
  recommendations: Array<{
    type: string;
    suggestion: string;
    priority: "high" | "medium" | "low";
  }>;
}
