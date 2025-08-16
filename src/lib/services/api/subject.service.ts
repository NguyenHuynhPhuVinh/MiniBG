import api from "./client";

export const subjectService = {
  // Lấy danh sách môn học
  getSubjects: async () => {
    const response = await api.get("/subjects");
    return response.data;
  },

  // Lấy chi tiết môn học
  getSubjectById: async (subjectId: number) => {
    const response = await api.get(`/subjects/${subjectId}`);
    return response.data;
  },

  // Lấy danh sách mục tiêu học tập theo môn học
  getLOsBySubject: async (subjectId: number) => {
    const response = await api.get(`/los/subject/${subjectId}`);
    return response.data;
  },

  // === ENHANCED SUBJECT ANALYSIS APIs ===

  // Phân tích tổng thể môn học với LO completion analysis
  getComprehensiveSubjectAnalysis: async (params: {
    subject_id: number;
    user_id: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const { subject_id, user_id, start_date, end_date } = params;
    const queryParams = new URLSearchParams();

    if (start_date) queryParams.append("start_date", start_date);
    if (end_date) queryParams.append("end_date", end_date);

    const url = queryParams.toString()
      ? `/reports/subject/${subject_id}/comprehensive-analysis/${user_id}?${queryParams.toString()}`
      : `/reports/subject/${subject_id}/comprehensive-analysis/${user_id}`;

    const response = await api.get(url);
    return response.data;
  },
};

export default subjectService;
