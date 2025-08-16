import api from "./client";
import type {
  LOCompletionAnalysisData,
  LOCompletionAnalysisResponse,
  LOCompletionAnalysisParams,
  PersonalizedRecommendations,
  LOAnalysisItem,
} from "@/lib/types/lo-completion-analysis";

// Interface cho tham số phân trang
interface PaginationParams {
  page?: number;
  limit?: number;
}

// Cấu trúc dữ liệu LO từ API
export interface LOResponse {
  lo_id: number;
  name: string;
  description?: string;
  subject_id?: number;
  Chapters?: Array<{
    chapter_id: number;
    name: string;
  }>;
}

// Response từ API getAllLOs
export interface LOPaginatedResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  los: LOResponse[];
}

// Response từ API getLOsBySubject (cấu trúc cũ)
export interface LOsBySubjectResponse {
  totalItems: number;
  los: LOResponse[];
}

// Response từ API getLOsBySubject với wrapper
export interface LOsBySubjectApiResponse {
  success: boolean;
  data: {
    totalItems: number;
    los: LOResponse[];
  };
  message?: string;
}

// Import types from the dedicated types file
export type {
  LOCompletionAnalysisParams,
  LOAnalysisItem,
  PersonalizedRecommendations,
} from "@/lib/types/lo-completion-analysis";

// Use the imported type instead of redefining
export type { LOCompletionAnalysisResponse } from "@/lib/types/lo-completion-analysis";

export interface LODetailsResponse {
  success: boolean;
  data: {
    lo_id: number;
    lo_name: string;
    description: string;
    subject_id: number;
    chapters: Array<{
      chapter_id: number;
      chapter_name: string;
      sections: Array<{
        section_id: number;
        title: string;
        content_type: "text" | "video" | "exercise";
        has_content: boolean;
        estimated_time: number;
        difficulty_level: "beginner" | "intermediate" | "advanced";
      }>;
    }>;
    prerequisites: Array<{
      lo_id: number;
      lo_name: string;
      completion_required: boolean;
    }>;
    learning_path: Array<{
      step: number;
      description: string;
      estimated_time: number;
    }>;
  };
}

// Service quản lý mục tiêu học tập (Learning Objectives)
export const loService = {
  // Lấy danh sách tất cả mục tiêu học tập (có phân trang)
  getAllLOs: async (
    params: PaginationParams = {}
  ): Promise<LOPaginatedResponse> => {
    const { page = 1, limit = 10 } = params;
    const response = await api.get("/los", {
      params: { page, limit },
    });
    return response.data;
  },

  // Lấy mục tiêu học tập theo ID
  getLOById: async (loId: number): Promise<LOResponse> => {
    const response = await api.get(`/los/${loId}`);
    return response.data;
  },

  // Lấy danh sách mục tiêu học tập theo môn học
  getLOsBySubject: async (
    subjectId: number
  ): Promise<LOsBySubjectApiResponse> => {
    const response = await api.get(`/los/subject/${subjectId}`);
    return response.data;
  },

  // Tạo mục tiêu học tập mới
  createLO: async (data: {
    subject_id: number;
    name: string;
    description?: string;
  }): Promise<LOResponse> => {
    const response = await api.post("/los", data);
    return response.data;
  },

  // Cập nhật mục tiêu học tập
  updateLO: async (
    loId: number,
    data: {
      subject_id?: number;
      name?: string;
      description?: string;
    }
  ): Promise<LOResponse> => {
    const response = await api.put(`/los/${loId}`, data);
    return response.data;
  },

  // Xóa mục tiêu học tập
  deleteLO: async (loId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/los/${loId}`);
    return response.data;
  },

  // === LO COMPLETION ANALYSIS APIs ===

  // Phân tích LO theo % hoàn thành
  getCompletionAnalysis: async (
    params: LOCompletionAnalysisParams
  ): Promise<LOCompletionAnalysisResponse> => {
    const { subject_id, user_id, start_date, end_date } = params;
    const queryParams = new URLSearchParams();

    if (start_date) queryParams.append("start_date", start_date);
    if (end_date) queryParams.append("end_date", end_date);

    const url = queryParams.toString()
      ? `/learning-outcomes/completion-analysis/${subject_id}/${user_id}?${queryParams.toString()}`
      : `/learning-outcomes/completion-analysis/${subject_id}/${user_id}`;

    const response = await api.get(url);
    return response.data;
  },

  // Lấy chi tiết LO với thông tin chương và sections
  getLODetails: async (loId: number): Promise<LODetailsResponse> => {
    const response = await api.get(`/learning-outcomes/${loId}/details`);
    return response.data;
  },

  // Lấy danh sách LOs theo subject (enhanced version)
  getLOsBySubjectEnhanced: async (
    subjectId: number
  ): Promise<{
    success: boolean;
    data: {
      subject_info: {
        subject_id: number;
        subject_name: string;
        description: string;
      };
      los: Array<{
        lo_id: number;
        lo_name: string;
        description: string;
        chapters: Array<{
          chapter_id: number;
          chapter_name: string;
          section_count: number;
        }>;
        difficulty_level: "beginner" | "intermediate" | "advanced";
        estimated_hours: number;
      }>;
    };
  }> => {
    const response = await api.get(`/learning-outcomes/subject/${subjectId}`);
    return response.data;
  },
};

export default loService;
