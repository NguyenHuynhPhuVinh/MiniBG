import api from "./client";
import { CreateQuizFormData, JoinQuizData } from "@/lib/types/quiz";

export const quizService = {
  // Lấy danh sách bài kiểm tra
  getQuizzes: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    subject_id?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
  }) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.subject_id)
      queryParams.append("subject_id", params.subject_id.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const url = queryParams.toString()
      ? `/quizzes?${queryParams.toString()}`
      : "/quizzes";
    const response = await api.get(url);
    return response.data;
  },

  // Lấy chi tiết bài kiểm tra
  getQuizById: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  // Tạo bài kiểm tra mới
  createQuiz: async (quizData: CreateQuizFormData) => {
    const response = await api.post("/quizzes", quizData);
    return response.data;
  },

  // Cập nhật bài kiểm tra
  updateQuiz: async (quizId: number, quizData: Partial<CreateQuizFormData>) => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  },

  // Xóa bài kiểm tra
  deleteQuiz: async (quizId: number) => {
    const response = await api.delete(`/quizzes/${quizId}`);
    return response.data;
  },

  // Bắt đầu bài kiểm tra
  startQuiz: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/start`);
    return response.data;
  },

  // Bắt đầu bài kiểm tra tự động chạy qua tất cả câu hỏi
  startAutoQuiz: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/auto`);
    return response.data;
  },

  // Lấy danh sách câu hỏi của bài kiểm tra
  getQuizQuestions: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  // Trộn lại câu hỏi của bài kiểm tra (sử dụng endpoint duplicate)
  reshuffleQuestions: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/shuffle`);
    return response.data;
  },

  // Lấy danh sách người tham gia quiz
  getQuizParticipants: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/participants`);
    return response.data;
  },

  // Lấy thống kê quiz realtime
  getQuizStatistics: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/statistics`);
    return response.data;
  },

  // Lấy điểm số realtime
  getRealtimeScores: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/realtime-scores`);
    return response.data;
  },

  // Lấy chi tiết học sinh realtime
  getStudentRealtimeData: async (quizId: number, userId: string) => {
    const response = await api.get(
      `/quizzes/${quizId}/students/${userId}/realtime`
    );
    return response.data;
  },

  // Lấy ID bài kiểm tra từ mã PIN
  getQuizIdByPin: async (pin: string) => {
    const response = await api.get(`/quizzes/pin/${pin}`);
    return response.data;
  },

  // Tham gia vào quiz
  joinQuiz: async (quizId: number, joinData: JoinQuizData) => {
    const response = await api.post(`/quizzes/${quizId}/join`, joinData);
    return response.data;
  },

  // Rời khỏi phòng chờ quiz
  leaveQuiz: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/leave`);
    return response.data;
  },

  // Gửi đáp án realtime
  submitRealtimeAnswer: async (
    quizId: number,
    questionId: number,
    answerId: number,
    startTime: number,
    userId?: number | string,
    showLeaderboardImmediately?: boolean
  ) => {
    const response = await api.post("/quizzes/realtime/answer", {
      quizId,
      questionId,
      answerId,
      startTime,
      userId,
      showLeaderboardImmediately,
    });
    return response.data;
  },

  // Trigger câu hỏi tiếp theo
  triggerNextQuestion: async (quizId: number, currentQuestionIndex: number) => {
    const response = await api.post(`/quizzes/${quizId}/next`, {
      current_question_index: currentQuestionIndex,
    });
    return response.data;
  },

  // Lấy bảng xếp hạng
  getLeaderboard: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/leaderboard`);
    return response.data;
  },

  // Trigger hiển thị bảng xếp hạng
  showLeaderboard: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/leaderboard`);
    return response.data;
  },

  // Test trigger hiển thị bảng xếp hạng (không cần auth)
  testShowLeaderboard: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/test-leaderboard`);
    return response.data;
  },

  // Lấy kết quả bài kiểm tra của người dùng hiện tại
  getCurrentUserQuizResults: async (userId: number) => {
    const response = await api.get(`/quiz-results/user/${userId}`);
    return response.data;
  },

  // Lấy chi tiết kết quả bài kiểm tra
  getQuizResultById: async (resultId: number) => {
    const response = await api.get(`/quiz-results/${resultId}`);
    return response.data;
  },

  // Lấy danh sách bài kiểm tra đã hoàn thành của người dùng
  getCompletedQuizzes: async (userId: number) => {
    const response = await api.get(`/quiz-results/user/${userId}/completed`);
    return response.data;
  },

  // Lấy kết quả quiz theo quiz_id (dành cho admin và giáo viên)
  getQuizResultsByQuizId: async (quizId: number) => {
    const response = await api.get(`/quiz-results/quiz/${quizId}`);
    return response.data;
  },

  // Radar Chart APIs
  // @deprecated - Use chapterAnalyticsService.getDetailedAnalysis instead
  // Lấy dữ liệu radar chart cho người dùng hiện tại
  getCurrentUserRadarData: async (quizId: number) => {
    console.warn(
      "⚠️ DEPRECATED: getCurrentUserRadarData is deprecated. " +
        "Please use chapterAnalyticsService.getDetailedAnalysis for chapter-based analytics. " +
        "Migration guide: docs/migration/radar-to-chapter-analytics.md"
    );
    const response = await api.get(
      `/quiz-results/quiz/${quizId}/radar/current-user`
    );
    return response.data;
  },

  // @deprecated - Use chapterAnalyticsService.getComprehensiveAnalysis instead
  // Lấy dữ liệu radar chart trung bình
  getAverageRadarData: async (quizId: number) => {
    console.warn(
      "⚠️ DEPRECATED: getAverageRadarData is deprecated. " +
        "Please use chapterAnalyticsService.getComprehensiveAnalysis for chapter-based analytics. " +
        "Migration guide: docs/migration/radar-to-chapter-analytics.md"
    );
    const response = await api.get(
      `/quiz-results/quiz/${quizId}/radar/average`
    );
    return response.data;
  },

  // @deprecated - Use chapterAnalyticsService.getTeacherAnalytics instead
  // Lấy dữ liệu radar chart của top performer
  getTopPerformerRadarData: async (quizId: number) => {
    console.warn(
      "⚠️ DEPRECATED: getTopPerformerRadarData is deprecated. " +
        "Please use chapterAnalyticsService.getTeacherAnalytics for comprehensive teacher analytics. " +
        "Migration guide: docs/migration/radar-to-chapter-analytics.md"
    );
    const response = await api.get(
      `/quiz-results/quiz/${quizId}/radar/top-performer`
    );
    return response.data;
  },

  // @deprecated - Use chapterAnalyticsService methods instead
  // Lấy tất cả dữ liệu radar chart (API tổng hợp)
  getAllRadarData: async (quizId: number) => {
    console.warn(
      "⚠️ DEPRECATED: getAllRadarData is deprecated. " +
        "Please use chapterAnalyticsService.getDetailedAnalysis, getComprehensiveAnalysis, or getTeacherAnalytics " +
        "for chapter-based analytics. Migration guide: docs/migration/radar-to-chapter-analytics.md"
    );
    const response = await api.get(`/quiz-results/quiz/${quizId}/radar/all`);
    return response.data;
  },

  // Lấy quiz result kèm chương và section theo từng LO
  getQuizResultWithChapters: async (resultId: number) => {
    const response = await api.get(`/quiz-results/${resultId}/chapters`);
    return response.data;
  },

  // Lấy quiz result theo quiz_id và user_id
  getQuizResultByQuizAndUser: async (quizId: number, userId: number) => {
    const response = await api.get(
      `/quiz-results/quiz-user?quiz_id=${quizId}&user_id=${userId}`
    );
    return response.data;
  },

  // Lấy quiz result chi tiết kèm chương/section theo quiz_id và user_id
  getQuizResultWithChaptersByQuizAndUser: async (
    quizId: number,
    userId: number
  ) => {
    const response = await api.get(
      `/quiz-results/quiz-user/chapters?quiz_id=${quizId}&user_id=${userId}`
    );
    return response.data;
  },

  // Đề xuất điểm yếu theo LO và hiển thị chương liên quan
  getWeakestLOWithChapters: async (quizId: number, userId: number) => {
    const response = await api.get(
      `/quiz-results/weakest-lo?quiz_id=${quizId}&user_id=${userId}`
    );
    return response.data;
  },

  // API phân tích cải thiện - lấy độ khó yếu nhất và gợi ý chapter
  getImprovementAnalysis: async (params: {
    quiz_id?: number;
    subject_id?: number;
    user_id?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.quiz_id)
      queryParams.append("quiz_id", params.quiz_id.toString());
    if (params.subject_id)
      queryParams.append("subject_id", params.subject_id.toString());
    if (params.user_id)
      queryParams.append("user_id", params.user_id.toString());

    const response = await api.get(
      `/quiz-results/improvement-analysis?${queryParams}`
    );
    return response.data;
  },

  // API phân tích hiệu suất student cho 1 quiz cụ thể - trả về câu sai theo LO với thông tin chương
  getStudentQuizPerformance: async (params: {
    quiz_id: number;
    user_id: number;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append("quiz_id", params.quiz_id.toString());
    queryParams.append("user_id", params.user_id.toString());

    const response = await api.get(
      `/advanced-analytics/quiz/student-performance?${queryParams}`
    );
    return response.data;
  },

  // === ENHANCED QUIZ ANALYSIS APIs ===

  // Phân tích chi tiết quiz với LO completion analysis
  getDetailedQuizAnalysis: async (params: {
    quiz_id: number;
    user_id: number;
  }) => {
    const { quiz_id, user_id } = params;
    const response = await api.get(
      `/quiz-results/detailed-analysis/${quiz_id}/${user_id}`
    );
    return response.data;
  },

  // Lấy chi tiết câu hỏi với đáp án
  getQuestionById: async (questionId: number) => {
    const response = await api.get(`/questions/${questionId}`);
    return response.data;
  },
};

export default quizService;
