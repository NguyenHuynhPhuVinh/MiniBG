import api from "./client";
import type {
  Program,
  ProgramWithRelations,
  ProgramListResponse,
  ProgramCreateRequest,
  ProgramUpdateRequest,
  ProgramFilterParams,
  ProgramApiResponse,
  ProgramWithRelationsApiResponse,
  ProgramPOsApiResponse,
  ProgramPLOsApiResponse,
  ProgramCoursesApiResponse,
  ProgramStatisticsApiResponse,
  ProgramDeleteApiResponse,
} from "@/lib/types/program-management";

export const programService = {
  // Lấy danh sách chương trình với pagination
  getPrograms: async (params?: ProgramFilterParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.duration_years)
      queryParams.append("duration_years", params.duration_years.toString());

    const response = await api.get<ProgramListResponse>(
      `/programs${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // Lấy chi tiết chương trình theo ID với relations
  getProgramById: async (programId: number) => {
    const response = await api.get<ProgramWithRelationsApiResponse>(
      `/programs/${programId}`
    );
    return response.data;
  },

  // Tạo chương trình mới
  createProgram: async (programData: ProgramCreateRequest) => {
    const response = await api.post<ProgramApiResponse>(
      "/programs",
      programData
    );
    return response.data;
  },

  // Cập nhật chương trình
  updateProgram: async (
    programId: number,
    programData: ProgramUpdateRequest
  ) => {
    const response = await api.put<ProgramApiResponse>(
      `/programs/${programId}`,
      programData
    );
    return response.data;
  },

  // Xóa chương trình
  deleteProgramById: async (programId: number) => {
    const response = await api.delete<ProgramDeleteApiResponse>(
      `/programs/${programId}`
    );
    return response.data;
  },

  // Lấy danh sách POs theo chương trình
  getProgramPOs: async (programId: number) => {
    const response = await api.get<ProgramPOsApiResponse>(
      `/programs/${programId}/pos`
    );
    return response.data;
  },

  // Lấy danh sách PLOs theo chương trình
  getProgramPLOs: async (programId: number) => {
    const response = await api.get<ProgramPLOsApiResponse>(
      `/programs/${programId}/plos`
    );
    return response.data;
  },

  // Lấy danh sách Courses theo chương trình
  getProgramCourses: async (programId: number) => {
    const response = await api.get<ProgramCoursesApiResponse>(
      `/programs/${programId}/courses`
    );
    return response.data;
  },

  // Lấy thống kê chương trình
  getProgramStatistics: async (programId: number) => {
    const response = await api.get<ProgramStatisticsApiResponse>(
      `/programs/${programId}/statistics`
    );
    return response.data;
  },
};

export default programService;
