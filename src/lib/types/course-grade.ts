// Course Grade Management TypeScript types and interfaces

// ===== API RESPONSE WRAPPER TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
    limit?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface CourseGradeApiError {
  success: false;
  error: string;
  code?: string;
  message?: string;
}

// ===== GRADE COLUMN TYPES =====

export interface GradeColumn {
  column_id: number;
  column_name: string;
  weight_percentage: number;
  column_order: number;
  description?: string;
  course_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GradeColumnWithRelations extends GradeColumn {
  Course?: {
    course_id: number;
    name: string;
    code?: string;
  };
  Quizzes?: Array<{
    quiz_id: number;
    subject_id: number;
    name: string;
    duration: number;
    start_time?: string;
    end_time?: string;
    status: "pending" | "active" | "finished";
    CourseGradeColumnQuiz: {
      assigned_at: string;
    };
    Subject: {
      subject_id: number;
      name: string;
    };
  }>;
  QuizAssignments?: Array<{
    quiz_id: number;
    quiz_name: string;
    assigned_at: string;
  }>;
  _count?: {
    QuizAssignments: number;
    CourseGradeResults: number;
  };
}

// ===== COURSE GRADE RESULT TYPES =====

export interface CourseGradeResult {
  id: number;
  course_id: number;
  student_id: number;
  grade_column_id: number;
  quiz_score?: number;
  final_exam_score?: number;
  calculated_grade: number;
  created_at: string;
  updated_at: string;
}

export interface CourseGradeResultWithRelations extends CourseGradeResult {
  Student: {
    user_id: number;
    fullName: string;
    email: string;
    student_id?: string;
  };
  Course: {
    course_id: number;
    name: string;
    code?: string;
  };
  GradeColumn: {
    id: number;
    name: string;
    weight: number;
  };
}

// ===== QUIZ ASSIGNMENT TYPES =====

export interface GradeQuiz {
  quiz_id: number;
  subject_id: number;
  name: string;
  duration: number;
  status: "pending" | "active" | "finished";
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAssignment {
  id: number;
  grade_column_id: number;
  quiz_id: number;
  weight_percentage?: number;
  assigned_at: string;
}

export interface AvailableQuiz extends GradeQuiz {
  Subject: {
    subject_id: number;
    name: string;
  };
  isAssigned?: boolean;
}

// ===== EXPORT METADATA TYPES =====

export interface ExportMetadata {
  id: number;
  course_id: number;
  export_type: "json" | "excel";
  file_name: string;
  file_path: string;
  file_size: number;
  exported_by: number;
  exported_at: string;
  download_count: number;
}

export interface ExportResult {
  success: boolean;
  file_url: string;
  file_name: string;
  export_metadata: ExportMetadata;
}

// ===== REQUEST TYPES =====

export interface GradeColumnCreateRequest {
  column_name: string;
  weight_percentage: number;
  column_order: number;
  description?: string;
  course_id: number;
  is_active?: boolean;
}

export interface GradeColumnUpdateRequest
  extends Partial<GradeColumnCreateRequest> {}

export interface QuizAssignmentRequest {
  quiz_ids: number[];
}

// New types for updated Quiz Assignment API
export interface QuizAssignmentWithWeight {
  quiz_id: number;
  weight_percentage?: number;
}

export interface QuizAssignmentWithWeightRequest {
  quiz_assignments: QuizAssignmentWithWeight[];
}

export interface QuizAssignmentResponse {
  column_id: number;
  assigned_quizzes: number;
  assignments: Array<{
    quiz_id: number;
    weight_percentage: number;
  }>;
}

export interface UnassignQuizzesRequest {
  quiz_ids: number[];
}

export interface UnassignQuizzesResponse {
  column_id: number;
  unassigned_quizzes: number;
  quiz_ids: number[];
}

export interface UnassignAllQuizzesResponse {
  column_id: number;
  unassigned_quizzes: number;
  quiz_ids: number[];
}

export interface GradeCalculationRequest {
  student_ids?: number[];
  recalculate_all?: boolean;
}

export interface FinalExamScoreUpdateRequest {
  student_id: number;
  final_exam_score: number;
}

export interface CourseWithGradeColumnsRequest {
  user_id: number;
  name: string;
  description?: string;
  code?: string;
  credits?: number;
  semester?: number;
  year?: number;
  start_date?: string;
  end_date?: string;
  program_id: number;
  grade_config?: {
    final_exam_weight: number;
    process_weight: number;
  };
  grade_columns: Array<{
    column_name: string;
    weight_percentage: number;
    description?: string;
  }>;
}

export interface ExportRequest {
  format: "json" | "excel";
  include_student_details?: boolean;
  include_grade_breakdown?: boolean;
}

// ===== RESPONSE TYPES =====

export interface GradeColumnsListResponse {
  grade_columns: GradeColumnWithRelations[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface AvailableQuizzesResponse {
  available_quizzes: AvailableQuiz[];
  assigned_quizzes: AvailableQuiz[];
  total_quizzes: number;
}

export interface GradeCalculationResponse {
  calculated_results: CourseGradeResultWithRelations[];
  summary: {
    total_students: number;
    calculated_count: number;
    average_grade: number;
    highest_grade: number;
    lowest_grade: number;
  };
}

export interface CourseWithGradeColumnsResponse {
  course: {
    course_id: number;
    name: string;
    description?: string;
    code?: string;
    credits?: number;
    semester?: number;
    year?: number;
    teacher_id?: number;
    program_id?: number;
    created_at: string;
    updated_at: string;
  };
  grade_columns: GradeColumn[];
}

// ===== FILTER AND PAGINATION PARAMS =====

export interface GradeColumnFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  course_id?: number;
}

export interface AvailableQuizFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  subject_id?: number;
  status?: "pending" | "active" | "finished";
  exclude_assigned?: boolean;
}

// ===== FORM VALIDATION TYPES FOR REACT HOOK FORM =====

export interface GradeColumnFormData {
  name: string;
  weight: number;
  description?: string;
  course_id: number;
}

export interface QuizAssignmentFormData {
  quiz_ids: number[];
}

export interface FinalExamScoreFormData {
  student_id: number;
  final_exam_score: number;
}

export interface CourseWithGradeColumnsFormData {
  name: string;
  description?: string;
  credits?: number;
  semester?: number;
  year?: number;
  program_id: number;
  grade_columns: Array<{
    column_name: string;
    weight_percentage: number;
    description?: string;
  }>;
}

export interface ExportFormData {
  format: "json" | "excel";
  include_student_details?: boolean;
  include_grade_breakdown?: boolean;
}

// ===== VALIDATION SCHEMAS TYPES =====

export interface GradeColumnValidation {
  name: {
    required: string;
    minLength: string;
    maxLength: string;
  };
  weight: {
    required: string;
    min: string;
    max: string;
    pattern: string;
  };
  description: {
    maxLength: string;
  };
  course_id: {
    required: string;
    min: string;
  };
}

export interface QuizAssignmentValidation {
  quiz_ids: {
    required: string;
    minItems: string;
  };
}

export interface FinalExamScoreValidation {
  student_id: {
    required: string;
    min: string;
  };
  final_exam_score: {
    required: string;
    min: string;
    max: string;
    pattern: string;
  };
}
