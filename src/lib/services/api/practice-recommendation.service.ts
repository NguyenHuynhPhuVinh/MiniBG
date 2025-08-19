import api from "./client";
import { API_ERROR_MESSAGES } from "@/lib/constants";

// Types cho Practice Recommendation API
export interface PracticeRecommendation {
  lo_id: number;
  lo_name: string;
  difficulty: "easy" | "medium" | "hard";
  level_id: number;
  attempts: number;
  correct: number;
  accuracy: number;
  total_questions: number;
  available_new_questions: number;
  priority: "urgent" | "high" | "medium" | "low";
  improvement_actions: string[];
}

export interface PracticeRecommendationSummary {
  total_recommendations: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

export interface PracticeRecommendationsResponse {
  success: boolean;
  data: {
    recommendations: PracticeRecommendation[];
    summary: PracticeRecommendationSummary;
  };
  message?: string;
}

export interface PracticeQuestion {
  question_id: number;
  question_text: string;
  answers: Array<{
    answer_id: number;
    answer_text: string;
    iscorrect: boolean;
  }>;
  difficulty: "easy" | "medium" | "hard";
  review: boolean;
}

export interface PracticeQuestionComposition {
  easy: number;
  medium: number;
  hard: number;
}

export interface GeneratePracticeRequest {
  user_id: number;
  subject_id: number;
  lo_id?: number;
  difficulty?: "easy" | "medium" | "hard";
  total_questions?: number;
}

export interface GeneratePracticeResponse {
  success: boolean;
  data: {
    lo_id: number;
    difficulty_source: "easy" | "medium" | "hard";
    total_questions: number;
    composition: PracticeQuestionComposition;
    questions: PracticeQuestion[];
    meta: {
      question_ids: number[];
      review_count: number;
    };
  };
  message?: string;
}

/**
 * Service quản lý Practice Recommendation & Generation API
 * Cung cấp đề xuất luyện tập cho sinh viên và sinh bộ câu hỏi luyện tập
 */
export const practiceRecommendationService = {
  /**
   * Lấy danh sách đề xuất luyện tập cho sinh viên
   * GET /api/practice/recommendations?user_id={uid}&subject_id={sid}
   */
  getRecommendations: async (params: {
    user_id: number;
    subject_id: number;
  }): Promise<PracticeRecommendationsResponse> => {
    try {
      const { user_id, subject_id } = params;
      
      const response = await api.get<PracticeRecommendationsResponse>(
        "/practice/recommendations",
        {
          params: {
            user_id,
            subject_id,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Không thể lấy danh sách đề xuất luyện tập"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Practice Recommendation - Get Recommendations Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        API_ERROR_MESSAGES.SERVER_ERROR || "Không thể lấy danh sách đề xuất luyện tập"
      );
    }
  },

  /**
   * Sinh bộ câu hỏi luyện tập
   * POST /api/practice/generate
   */
  generatePractice: async (
    request: GeneratePracticeRequest
  ): Promise<GeneratePracticeResponse> => {
    try {
      const response = await api.post<GeneratePracticeResponse>(
        "/practice/generate",
        request
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Không thể sinh bộ câu hỏi luyện tập"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Practice Recommendation - Generate Practice Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        API_ERROR_MESSAGES.SERVER_ERROR || "Không thể sinh bộ câu hỏi luyện tập"
      );
    }
  },
};

export default practiceRecommendationService;
