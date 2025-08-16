// Types cho Improvement Analysis API

export interface QuestionDetail {
  question_id: number;
  question_text: string;
  lo_name: string;
  chapter_name: string;
  difficulty_level?: string;
  is_correct?: boolean;
  user_answer?: string;
  correct_answer?: string;
}

export interface WeakestLevel {
  level: string;
  level_name: string;
  accuracy: number;
  improvement_priority: "high" | "medium" | "low";
  questions_list: QuestionDetail[];
}

export interface LevelAnalysis {
  level: string;
  level_name: string;
  accuracy: number;
  questions_count: number;
  improvement_priority: "high" | "medium" | "low";
}

export interface WeakLevelsAnalysis {
  levels_analysis: LevelAnalysis[];
  weakest_level: WeakestLevel;
}

export interface WeakLO {
  lo_id: number;
  lo_name: string;
  accuracy: number;
  questions_count: number;
  improvement_priority: "high" | "medium" | "low";
}

export interface ChapterSuggestion {
  chapter_id: number;
  chapter_name: string;
  subject_name: string;
  accuracy: number;
  priority: "high" | "medium" | "low";
  weak_los: WeakLO[];
  suggestions: string[];
}

export interface ImprovementSuggestions {
  chapter_suggestions: ChapterSuggestion[];
  general_recommendations: string[];
  study_plan: {
    immediate_focus: string[];
    medium_term_goals: string[];
    long_term_objectives: string[];
  };
}

export interface ImprovementAnalysisData {
  user_id: number;
  quiz_id?: number;
  subject_id?: number;
  analysis_date: string;
  weak_levels: WeakLevelsAnalysis;
  chapters_need_improvement: ChapterSuggestion[];
  improvement_suggestions: ImprovementSuggestions;
  overall_performance: {
    total_questions: number;
    correct_answers: number;
    accuracy: number;
    average_response_time: number;
  };
}

export interface ImprovementAnalysisResponse {
  success: boolean;
  data: ImprovementAnalysisData;
  message?: string;
}
