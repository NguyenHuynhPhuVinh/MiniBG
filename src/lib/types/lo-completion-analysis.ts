// LO Completion Analysis Types
// Định nghĩa các interface cho hệ thống phân tích Learning Outcomes theo % hoàn thành

// Base interfaces
export interface SubjectInfo {
  subject_id: number;
  subject_name: string;
  description: string;
}

export interface StudentInfo {
  user_id: number;
  name: string;
}

// LO Analysis Types
export interface LOImprovementPlan {
  focus_areas: string[];
  estimated_hours: number;
  priority_level: "high" | "medium" | "low";
  recommended_resources: Array<{
    type: "text" | "video" | "exercise";
    title: string;
    url?: string;
    estimated_time: number;
  }>;
}

export interface LONextLevelSuggestion {
  lo_id: number;
  lo_name: string;
  difficulty_level: "intermediate" | "advanced" | "expert";
  prerequisites_met: boolean;
  estimated_completion_time: number;
}

export interface RelatedChapter {
  chapter_id: number;
  chapter_name: string;
  sections: Array<{
    section_id: number;
    title: string;
    content_type: "text" | "video" | "exercise";
    has_content: boolean;
    estimated_time?: number;
    difficulty_level?: "beginner" | "intermediate" | "advanced";
  }>;
}

export interface AlternativePath {
  path_name: string;
  description: string;
  estimated_time: number;
}

// Actual API Response Structure
export interface QuestionResult {
  question_id: number;
  is_correct: boolean;
  time_spent: number;
}

export interface ActualNextLevelSuggestion {
  lo_id: number;
  lo_name: string;
  description: string;
  prerequisite_met: boolean;
  difficulty_increase: string;
  estimated_study_time: string;
}

export interface ActualAlternativePath {
  path_name: string;
  description: string;
  next_subjects: string[];
}

export interface LOAnalysisItem {
  lo_id: number;
  lo_name: string;
  lo_description: string;
  total_questions: number;
  correct_answers: number;
  total_time_spent: number;
  questions: QuestionResult[];
  completion_percentage: number;
  status: "needs_improvement" | "mastered";
  next_level_suggestions: ActualNextLevelSuggestion[];
  alternative_paths: ActualAlternativePath[];
  // Legacy fields for backward compatibility
  related_chapters?: RelatedChapter[];
  improvement_plan?: LOImprovementPlan;
}

// Personalized Recommendations
export interface ImmediateFocusAction {
  action: string;
  priority: "high" | "medium" | "low";
  estimated_improvement: number;
  time_required: number;
}

export interface NextPhaseItem {
  phase_name: string;
  description: string;
  prerequisites: string[];
  estimated_duration: number;
}

export interface DailyBreakdown {
  day: string;
  focus_area: string;
  duration: number;
}

export interface MilestoneTarget {
  week: number;
  target: string;
  success_criteria: string[];
}

export interface StudySchedule {
  weekly_hours: number;
  daily_breakdown: DailyBreakdown[];
  milestone_targets: MilestoneTarget[];
}

// Actual API Response Structure for Recommendations
export interface ActualNextPhaseItem {
  type: string;
  lo_name: string;
  reason: string;
  action: string;
}

export interface ActualStudySchedule {
  week_5_6?: {
    focus: string;
    chapters: string[];
    target_completion: string;
  };
  [key: string]: any; // For other week patterns
}

export interface PersonalizedRecommendations {
  immediate_focus: ImmediateFocusAction[]; // Empty in actual response
  next_phase: ActualNextPhaseItem[]; // Different structure
  study_schedule: ActualStudySchedule; // Different structure
}

// Main Analysis Response
export interface LOAnalysis {
  needs_improvement: LOAnalysisItem[];
  ready_for_advancement: LOAnalysisItem[];
}

export interface LOCompletionAnalysisData {
  subject_info: SubjectInfo;
  student_info: StudentInfo;
  lo_analysis: LOAnalysis;
  learning_recommendations: PersonalizedRecommendations;
}

export interface LOCompletionAnalysisResponse {
  success: boolean;
  message?: string;
  data: LOCompletionAnalysisData;
}

// Enhanced Quiz Analysis Types
export interface QuizLOCompletionAnalysis {
  lo_id: number;
  lo_name: string;
  questions_answered: number;
  correct_answers: number;
  completion_percentage: number;
  improvement_suggestions: string[];
}

export interface EnhancedQuizAnalysisData {
  quiz_info: {
    quiz_id: number;
    quiz_name: string;
    subject_id: number;
    total_questions: number;
  };
  student_performance: {
    total_score: number;
    percentage: number;
    time_taken: number;
  };
  lo_completion_analysis: QuizLOCompletionAnalysis[];
  personalized_recommendations: PersonalizedRecommendations;
}

export interface EnhancedQuizAnalysisResponse {
  success: boolean;
  message?: string;
  data: EnhancedQuizAnalysisData;
}

// Enhanced Subject Analysis Types
export interface SubjectLOMasteryRate {
  total_los: number;
  mastered_los: number;
  needs_improvement_los: number;
  mastery_percentage: number;
}

export interface EnhancedSubjectAnalysisData {
  subject_info: SubjectInfo;
  student_info: StudentInfo;
  overall_performance: {
    average_score: number;
    total_quizzes_taken: number;
    improvement_trend: "improving" | "stable" | "declining";
    mastery_percentage: number;
  };
  chapter_breakdown: Array<{
    chapter_id: number;
    chapter_name: string;
    learning_progress: {
      mastered_sections: number;
      total_sections: number;
      current_level: "beginner" | "intermediate" | "advanced" | "expert";
    };
  }>;
  lo_completion_analysis: LOAnalysis;
  subject_lo_mastery_rate: SubjectLOMasteryRate;
  personalized_recommendations: PersonalizedRecommendations;
}

export interface EnhancedSubjectAnalysisResponse {
  success: boolean;
  message?: string;
  data: EnhancedSubjectAnalysisData;
}

// LO Details Types
export interface LOPrerequisite {
  lo_id: number;
  lo_name: string;
  completion_required: boolean;
}

export interface LearningPathStep {
  step: number;
  description: string;
  estimated_time: number;
}

export interface LODetailsData {
  lo_id: number;
  lo_name: string;
  description: string;
  subject_id: number;
  chapters: RelatedChapter[];
  prerequisites: LOPrerequisite[];
  learning_path: LearningPathStep[];
}

export interface LODetailsResponse {
  success: boolean;
  message?: string;
  data: LODetailsData;
}

// API Parameters
export interface LOCompletionAnalysisParams {
  subject_id: number;
  user_id: number;
  start_date?: string;
  end_date?: string;
}

export interface EnhancedQuizAnalysisParams {
  quiz_id: number;
  user_id: number;
}

export interface EnhancedSubjectAnalysisParams {
  subject_id: number;
  user_id: number;
  start_date?: string;
  end_date?: string;
}

// UI Component Props Types
export interface LOCompletionAnalysisProps {
  className?: string;
  data: LOCompletionAnalysisData;
  onViewDetails?: (loId: number) => void;
  onStartImprovement?: (loId: number) => void;
}

export interface LOImprovementCardProps {
  className?: string;
  loItem: LOAnalysisItem;
  onViewChapter?: (chapterId: number) => void;
  onStartLearning?: (resourceUrl: string) => void;
}

export interface LOAdvancementCardProps {
  className?: string;
  loItem: LOAnalysisItem;
  onExploreNextLevel?: (loId: number) => void;
  onViewAlternativePath?: (pathName: string) => void;
}

export interface PersonalizedRecommendationsProps {
  className?: string;
  recommendations: PersonalizedRecommendations;
  onActionClick?: (action: string) => void;
  onPhaseSelect?: (phaseName: string) => void;
}
