// Course Management TypeScript types and interfaces

// ===== COURSE TYPES =====

export interface Course {
  course_id: number;
  name: string;
  description?: string;
  code?: string;
  credits?: number;
  semester?: number;
  year?: number;
  user_id?: number; // Teacher ID (renamed from teacher_id to match API)
  program_id?: number;
  start_date?: string;
  end_date?: string;
  grade_config?: {
    process_weight: number;
    final_exam_weight: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CourseWithRelations extends Course {
  User?: {
    user_id: number;
    name: string;
    email?: string;
  };
  Program?: {
    program_id: number;
    name: string;
    code?: string;
  };
  Subjects?: Array<{
    subject_id: number;
    name: string;
    description?: string;
  }>;
  CourseResults?: Array<{
    result_id: number;
    average_score: number;
  }>;
  _count?: {
    Subjects: number;
    Students: number;
  };
}

export interface CourseListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    courses: Course[];
  };
  message?: string;
}

export interface CourseCreateRequest {
  name: string;
  description?: string;
  code?: string;
  credits?: number;
  semester?: number;
  year?: number;
  teacher_id?: number;
  program_id?: number;
}

export interface CourseUpdateRequest extends Partial<CourseCreateRequest> {
  start_date?: string;
  end_date?: string;
}

// ===== PAGINATION AND FILTER PARAMS =====

export interface CourseFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  teacher_id?: number;
  program_id?: number;
  semester?: number;
  year?: number;
  credits?: number;
}

// ===== API RESPONSE TYPES =====

export interface CourseApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CourseApiError {
  success: false;
  error: string;
  code?: string;
}

// ===== COURSE ENROLLMENT TYPES =====

export interface CourseEnrollment {
  enrollment_id: number;
  course_id: number;
  student_id: number;
  enrolled_at: string;
  status: "active" | "completed" | "dropped";
}

export interface CourseStudent {
  user_id: number;
  fullName: string;
  email: string;
  enrollment: CourseEnrollment;
}

// ===== COURSE STATISTICS =====

export interface CourseStats {
  total_students: number;
  active_students: number;
  completed_students: number;
  average_grade?: number;
  completion_rate: number;
}
