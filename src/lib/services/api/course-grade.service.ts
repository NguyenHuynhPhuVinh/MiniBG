import api from "./client";
import type {
  ApiResponse,
  GradeColumn,
  GradeColumnWithRelations,
  GradeColumnCreateRequest,
  GradeColumnUpdateRequest,
  GradeColumnFilterParams,
  GradeColumnsListResponse,
  CourseGradeResult,
  CourseGradeResultWithRelations,
  GradeQuiz,
  AvailableQuiz,
  QuizAssignment,
  QuizAssignmentRequest,
  QuizAssignmentWithWeightRequest,
  QuizAssignmentResponse,
  UnassignQuizzesRequest,
  UnassignQuizzesResponse,
  UnassignAllQuizzesResponse,
  AvailableQuizzesResponse,
  AvailableQuizFilterParams,
  GradeCalculationRequest,
  GradeCalculationResponse,
  FinalExamScoreUpdateRequest,
  ExportResult,
  CourseWithGradeColumnsRequest,
  CourseWithGradeColumnsResponse,
} from "@/lib/types/course-grade";

export const courseGradeService = {
  // ===== GRADE COLUMNS CRUD =====

  // Lấy danh sách grade columns
  getGradeColumns: async (
    courseId: number,
    params?: GradeColumnFilterParams
  ) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await api.get<ApiResponse<GradeColumnsListResponse>>(
      `/courses/${courseId}/grade-columns${
        queryParams.toString() ? `?${queryParams}` : ""
      }`
    );
    return response.data;
  },

  // Tạo grade column mới
  createGradeColumn: async (gradeColumnData: GradeColumnCreateRequest) => {
    const response = await api.post<ApiResponse<GradeColumn>>(
      `/courses/${gradeColumnData.course_id}/grade-columns`,
      gradeColumnData
    );
    return response.data;
  },

  // Cập nhật grade column
  updateGradeColumn: async (
    courseId: number,
    gradeColumnId: number,
    gradeColumnData: GradeColumnUpdateRequest
  ) => {
    const response = await api.put<ApiResponse<GradeColumn>>(
      `/courses/${courseId}/grade-columns/${gradeColumnId}`,
      gradeColumnData
    );
    return response.data;
  },

  // Xóa grade column
  deleteGradeColumn: async (courseId: number, gradeColumnId: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/courses/${courseId}/grade-columns/${gradeColumnId}`
    );
    return response.data;
  },

  // ===== QUIZ ASSIGNMENT =====

  // Assign quizzes to grade column (Updated API with weight support)
  assignQuizzesToColumn: async (
    courseId: number,
    gradeColumnId: number,
    assignmentData: QuizAssignmentWithWeightRequest
  ) => {
    const response = await api.post<ApiResponse<QuizAssignmentResponse>>(
      `/courses/${courseId}/grade-columns/${gradeColumnId}/assign-quizzes`,
      assignmentData
    );
    return response.data;
  },

  // Unassign specific quizzes from grade column (New API)
  unassignQuizzesFromColumn: async (
    courseId: number,
    gradeColumnId: number,
    unassignData: UnassignQuizzesRequest
  ) => {
    const response = await api.delete<ApiResponse<UnassignQuizzesResponse>>(
      `/courses/${courseId}/grade-columns/${gradeColumnId}/unassign-quizzes`,
      { data: unassignData }
    );
    return response.data;
  },

  // Unassign all quizzes from grade column (New API)
  unassignAllQuizzesFromColumn: async (
    courseId: number,
    gradeColumnId: number
  ) => {
    const response = await api.delete<ApiResponse<UnassignAllQuizzesResponse>>(
      `/courses/${courseId}/grade-columns/${gradeColumnId}/unassign-all-quizzes`
    );
    return response.data;
  },

  // Lấy danh sách available quizzes cho course
  getAvailableQuizzes: async (
    courseId: number,
    params?: AvailableQuizFilterParams
  ) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.subject_id)
      queryParams.append("subject_id", params.subject_id.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.exclude_assigned)
      queryParams.append(
        "exclude_assigned",
        params.exclude_assigned.toString()
      );

    const response = await api.get<ApiResponse<AvailableQuizzesResponse>>(
      `/courses/${courseId}/available-quizzes${
        queryParams.toString() ? `?${queryParams}` : ""
      }`
    );
    return response.data;
  },

  // ===== GRADE CALCULATION =====

  // Calculate grades for course
  calculateGrade: async (
    courseId: number,
    calculationData?: GradeCalculationRequest
  ) => {
    const response = await api.post<ApiResponse<GradeCalculationResponse>>(
      `/courses/${courseId}/calculate-grade`,
      calculationData || {}
    );
    return response.data;
  },

  // Update final exam score for student
  updateFinalExamScore: async (
    courseId: number,
    scoreData: FinalExamScoreUpdateRequest
  ) => {
    const response = await api.put<ApiResponse<CourseGradeResult>>(
      `/courses/${courseId}/final-exam-score`,
      scoreData
    );
    return response.data;
  },

  // Recalculate all grades for course
  recalculateAllGrades: async (
    courseId: number,
    calculationData?: GradeCalculationRequest
  ) => {
    const response = await api.post<ApiResponse<GradeCalculationResponse>>(
      `/courses/${courseId}/recalculate-all`,
      calculationData || {}
    );
    return response.data;
  },

  // ===== EXPORT =====

  // Export course results
  exportResults: async (
    courseId: number,
    format: "json" | "excel" = "json"
  ) => {
    const response = await api.get<ApiResponse<ExportResult>>(
      `/courses/${courseId}/export-results?format=${format}`
    );
    return response.data;
  },

  // ===== COURSE CREATION WITH GRADE COLUMNS =====

  // Create course with grade columns
  createCourseWithGradeColumns: async (
    courseData: CourseWithGradeColumnsRequest
  ) => {
    const response = await api.post<
      ApiResponse<CourseWithGradeColumnsResponse>
    >("/courses/create-with-grade-columns", courseData);
    return response.data;
  },

  // ===== ADDITIONAL HELPER METHODS =====

  // Lấy chi tiết grade column theo ID
  getGradeColumnById: async (gradeColumnId: number) => {
    const response = await api.get<ApiResponse<GradeColumnWithRelations>>(
      `/grade-columns/${gradeColumnId}`
    );
    return response.data;
  },

  // Lấy grade results cho course
  getCourseGradeResults: async (
    courseId: number,
    params?: {
      page?: number;
      limit?: number;
      student_id?: number;
      grade_column_id?: number;
    }
  ) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.student_id)
      queryParams.append("student_id", params.student_id.toString());
    if (params?.grade_column_id)
      queryParams.append("grade_column_id", params.grade_column_id.toString());

    const response = await api.get<
      ApiResponse<{
        results: CourseGradeResultWithRelations[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
      }>
    >(
      `/courses/${courseId}/grade-results${
        queryParams.toString() ? `?${queryParams}` : ""
      }`
    );
    return response.data;
  },

  // Lấy quiz assignments cho grade column
  getQuizAssignments: async (gradeColumnId: number) => {
    const response = await api.get<
      ApiResponse<
        Array<{
          id: number;
          quiz_id: number;
          assigned_at: string;
          Quiz: GradeQuiz;
        }>
      >
    >(`/grade-columns/${gradeColumnId}/quiz-assignments`);
    return response.data;
  },

  // Remove quiz assignment from grade column
  removeQuizAssignment: async (gradeColumnId: number, quizId: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/grade-columns/${gradeColumnId}/quiz-assignments/${quizId}`
    );
    return response.data;
  },

  // Bulk delete grade columns
  bulkDeleteGradeColumns: async (gradeColumnIds: number[]) => {
    const response = await api.delete<
      ApiResponse<{ message: string; deleted_count: number }>
    >("/grade-columns/bulk", { data: { grade_column_ids: gradeColumnIds } });
    return response.data;
  },

  // Get grade statistics for course
  getGradeStatistics: async (courseId: number) => {
    const response = await api.get<
      ApiResponse<{
        total_students: number;
        total_grade_columns: number;
        average_grade: number;
        highest_grade: number;
        lowest_grade: number;
        grade_distribution: Array<{
          range: string;
          count: number;
          percentage: number;
        }>;
        column_statistics: Array<{
          grade_column_id: number;
          grade_column_name: string;
          average_score: number;
          completion_rate: number;
        }>;
      }>
    >(`/courses/${courseId}/grade-statistics`);
    return response.data;
  },
};

export default courseGradeService;
