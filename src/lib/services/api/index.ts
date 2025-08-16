import api from "./client";
import authService from "./auth.service";
import userService from "./user.service";
import roleService from "./role.service";
import quizService from "./quiz.service";
import subjectService from "./subject.service";
import loService from "./lo.service";
import gamificationService from "./gamification.service";
import advancedAnalyticsService from "./advanced-analytics.service";
import chapterAnalyticsService from "./chapter-analytics.service";
import avatarService from "./avatar.service";
import currencyService from "./currency.service";
import shopService from "./shop.service";
import programService from "./program.service";
import poService from "./po.service";
import ploService from "./plo.service";
import courseService from "./course.service";
import courseGradeService from "./course-grade.service";

export {
  api,
  authService,
  userService,
  roleService,
  quizService,
  subjectService,
  loService,
  gamificationService,
  advancedAnalyticsService,
  chapterAnalyticsService,
  avatarService,
  currencyService,
  shopService,
  programService,
  poService,
  ploService,
  courseService,
  courseGradeService,
};

export default api;

// Re-export types from services
export type {
  TimeSeriesParams,
  ScoreDistributionParams,
  LearningOutcomesParams,
  DifficultyHeatmapParams,
  ActivityTimelineParams,
  StudentScoreAnalysisParams,
} from "./advanced-analytics.service";

export type {
  UserGamificationInfo,
  LeaderboardEntry,
  GamificationStats,
  AddPointsRequest,
} from "@/lib/types/gamification";

// Chapter Analytics types
export type {
  ChapterAnalysisData,
  ComprehensiveAnalysisData,
  TeacherAnalyticsData,
  ChapterAnalyticsResponse,
  DetailedAnalysisParams,
  ComprehensiveAnalysisParams,
  TeacherAnalyticsParams,
  SectionRecommendation,
} from "@/lib/types/chapter-analytics";

// Currency types
export type {
  CurrencyBalance,
  CurrencyData,
  UserCurrencies,
  CurrencyApiResponse,
  CurrencyError,
  CurrencyDisplayConfig,
  CurrencyUpdateEvent,
} from "@/lib/types/currency";

// LO Completion Analysis types
export type {
  LOResponse,
  LOPaginatedResponse,
  LOsBySubjectResponse,
  LOsBySubjectApiResponse,
  LOCompletionAnalysisParams,
  LOAnalysisItem,
  PersonalizedRecommendations,
  LOCompletionAnalysisResponse,
  LODetailsResponse,
} from "./lo.service";

// Additional LO types from dedicated types file
export type {
  LOImprovementPlan,
  LONextLevelSuggestion,
  LOCompletionAnalysisData,
  ActualNextPhaseItem,
  ActualStudySchedule,
} from "@/lib/types/lo-completion-analysis";

// Program Management types
export type {
  Program,
  ProgramWithRelations,
  ProgramListResponse,
  ProgramCreateRequest,
  ProgramUpdateRequest,
  ProgramApiResponse,
  ProgramWithRelationsApiResponse,
  ProgramPOsApiResponse,
  ProgramPLOsApiResponse,
  ProgramCoursesApiResponse,
  ProgramStatisticsApiResponse,
  ProgramDeleteApiResponse,
  PO,
  POWithRelations,
  POListResponse,
  POCreateRequest,
  POUpdateRequest,
  POApiResponse,
  POWithRelationsApiResponse,
  POsByProgramApiResponse,
  POPLOsApiResponse,
  POStatisticsApiResponse,
  PODeleteApiResponse,
  POBulkApiResponse,
  PLO,
  PLOWithRelations,
  PLOListResponse,
  PLOCreateRequest,
  PLOUpdateRequest,
  PaginationParams,
  ProgramFilterParams,
  POFilterParams,
  PLOFilterParams,
} from "@/lib/types/program-management";

// Course Management types
export type {
  Course,
  CourseWithRelations,
  CourseListResponse,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseFilterParams,
  CourseStats,
  CourseStudent,
  CourseEnrollment,
} from "@/lib/types/course";

// Validation types
export type {
  ProgramCreateFormData,
  ProgramUpdateFormData,
  POCreateFormData,
  POUpdateFormData,
  PLOCreateFormData,
  PLOUpdateFormData,
  CourseCreateFormData,
  CourseUpdateFormData,
  PaginationFormData,
  ProgramFilterFormData,
  POFilterFormData,
  PLOFilterFormData,
  CourseFilterFormData,
} from "@/lib/validations/program-management";

// Course Grade Management types
export type {
  ApiResponse,
  GradeColumn,
  GradeColumnWithRelations,
  CourseGradeResult,
  CourseGradeResultWithRelations,
  GradeQuiz,
  AvailableQuiz,
  QuizAssignment,
  ExportMetadata,
  ExportResult,
  GradeColumnCreateRequest,
  GradeColumnUpdateRequest,
  QuizAssignmentRequest,
  GradeCalculationRequest,
  FinalExamScoreUpdateRequest,
  CourseWithGradeColumnsRequest,
  ExportRequest,
  GradeColumnsListResponse,
  AvailableQuizzesResponse,
  GradeCalculationResponse,
  CourseWithGradeColumnsResponse,
  GradeColumnFilterParams,
  AvailableQuizFilterParams,
  GradeColumnFormData,
  QuizAssignmentFormData,
  FinalExamScoreFormData,
  CourseWithGradeColumnsFormData,
  ExportFormData,
} from "@/lib/types/course-grade";
