import api from "./client";
import type {
  Course,
  CourseWithRelations,
  CourseListResponse,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseFilterParams,
  CourseStats,
  CourseStudent,
} from "@/lib/types/course";

export const courseService = {
  // Lấy danh sách courses
  getCourses: async (params?: CourseFilterParams) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.teacher_id) queryParams.append("teacher_id", params.teacher_id.toString());
    if (params?.program_id) queryParams.append("program_id", params.program_id.toString());
    if (params?.semester) queryParams.append("semester", params.semester.toString());
    if (params?.year) queryParams.append("year", params.year.toString());
    if (params?.credits) queryParams.append("credits", params.credits.toString());

    const response = await api.get<CourseListResponse>(
      `/courses${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // Lấy chi tiết course theo ID
  getCourseById: async (courseId: number) => {
    const response = await api.get<{
      success: boolean;
      data: CourseWithRelations;
      message?: string;
    }>(`/courses/${courseId}`);
    return response.data;
  },

  // Lấy courses theo teacher ID
  getCoursesByTeacher: async (teacherId: number, params?: {
    page?: number;
    limit?: number;
    search?: string;
    semester?: number;
    year?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.semester) queryParams.append("semester", params.semester.toString());
    if (params?.year) queryParams.append("year", params.year.toString());

    const response = await api.get<{
      success: boolean;
      data: Course[];
      message?: string;
    }>(`/courses/teacher/${teacherId}${queryParams.toString() ? `?${queryParams}` : ""}`);
    return response.data;
  },

  // Lấy courses theo program ID
  getCoursesByProgram: async (programId: number, params?: {
    page?: number;
    limit?: number;
    search?: string;
    semester?: number;
    year?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.semester) queryParams.append("semester", params.semester.toString());
    if (params?.year) queryParams.append("year", params.year.toString());

    const response = await api.get<{
      success: boolean;
      data: Course[];
      message?: string;
    }>(`/courses/program/${programId}${queryParams.toString() ? `?${queryParams}` : ""}`);
    return response.data;
  },

  // Tạo course mới (teacher + admin only)
  createCourse: async (courseData: CourseCreateRequest) => {
    const response = await api.post<{
      success: boolean;
      data: Course;
      message?: string;
    }>("/courses", courseData);
    return response.data;
  },

  // Cập nhật course (teacher + admin only)
  updateCourse: async (courseId: number, courseData: CourseUpdateRequest) => {
    const response = await api.put<{
      success: boolean;
      data: Course;
      message?: string;
    }>(`/courses/${courseId}`, courseData);
    return response.data;
  },

  // Xóa course (teacher + admin only)
  deleteCourseById: async (courseId: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/courses/${courseId}`);
    return response.data;
  },

  // Lấy danh sách students trong course
  getCourseStudents: async (courseId: number, params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "active" | "completed" | "dropped";
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const response = await api.get<{
      success: boolean;
      data: CourseStudent[];
      message?: string;
    }>(`/courses/${courseId}/students${queryParams.toString() ? `?${queryParams}` : ""}`);
    return response.data;
  },

  // Thêm student vào course
  enrollStudent: async (courseId: number, studentId: number) => {
    const response = await api.post<{
      success: boolean;
      message?: string;
    }>(`/courses/${courseId}/enroll`, { student_id: studentId });
    return response.data;
  },

  // Xóa student khỏi course
  unenrollStudent: async (courseId: number, studentId: number) => {
    const response = await api.post<{
      success: boolean;
      message?: string;
    }>(`/courses/${courseId}/unenroll`, { student_id: studentId });
    return response.data;
  },

  // Lấy thống kê course
  getCourseStatistics: async (courseId: number) => {
    const response = await api.get<{
      success: boolean;
      data: CourseStats;
      message?: string;
    }>(`/courses/${courseId}/statistics`);
    return response.data;
  },

  // Lấy subjects của course
  getCourseSubjects: async (courseId: number) => {
    const response = await api.get<{
      success: boolean;
      data: Array<{
        subject_id: number;
        name: string;
        description?: string;
        created_at: string;
        updated_at: string;
      }>;
      message?: string;
    }>(`/courses/${courseId}/subjects`);
    return response.data;
  },

  // Bulk operations - Tạo nhiều courses cùng lúc
  createMultipleCourses: async (coursesData: CourseCreateRequest[]) => {
    const response = await api.post<{
      success: boolean;
      data: Course[];
      message?: string;
    }>("/courses/bulk", { courses: coursesData });
    return response.data;
  },

  // Bulk operations - Xóa nhiều courses cùng lúc
  deleteMultipleCourses: async (courseIds: number[]) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>("/courses/bulk", { data: { course_ids: courseIds } });
    return response.data;
  },

  // Bulk enrollment - Thêm nhiều students vào course
  bulkEnrollStudents: async (courseId: number, studentIds: number[]) => {
    const response = await api.post<{
      success: boolean;
      message?: string;
    }>(`/courses/${courseId}/bulk-enroll`, { student_ids: studentIds });
    return response.data;
  },
};

export default courseService;
