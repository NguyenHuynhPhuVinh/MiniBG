import api from "./client";
import type {
  PLO,
  PLOWithRelations,
  PLOListResponse,
  PLOCreateRequest,
  PLOUpdateRequest,
  PLOFilterParams,
} from "@/lib/types/program-management";

export const ploService = {
  // Lấy danh sách tất cả PLOs
  getPLOs: async (params?: PLOFilterParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.program_id)
      queryParams.append("program_id", params.program_id.toString());
    if (params?.po_id) queryParams.append("po_id", params.po_id.toString());

    const response = await api.get<PLOListResponse>(
      `/plos${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // Lấy chi tiết PLO theo ID
  getPLOById: async (ploId: number) => {
    const response = await api.get<{
      success: boolean;
      data: PLOWithRelations;
      message?: string;
    }>(`/plos/${ploId}`);
    return response.data;
  },

  // Lấy PLOs theo program ID
  getPLOsByProgram: async (
    programId: number,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sort_by?: string;
      sort_order?: "ASC" | "DESC";
      po_id?: number;
    }
  ) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.po_id) queryParams.append("po_id", params.po_id.toString());

    const response = await api.get<{
      success: boolean;
      data: PLO[];
      message?: string;
    }>(
      `/plos/program/${programId}${
        queryParams.toString() ? `?${queryParams}` : ""
      }`
    );
    return response.data;
  },

  // Lấy PLOs theo PO ID
  getPLOsByPO: async (
    poId: number,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sort_by?: string;
      sort_order?: "ASC" | "DESC";
    }
  ) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await api.get<{
      success: boolean;
      data: PLO[];
      message?: string;
    }>(`/plos/po/${poId}${queryParams.toString() ? `?${queryParams}` : ""}`);
    return response.data;
  },

  // Tạo PLO mới (admin only)
  createPLO: async (ploData: PLOCreateRequest) => {
    const response = await api.post<{
      success: boolean;
      data: PLO;
      message?: string;
    }>("/plos", ploData);
    return response.data;
  },

  // Cập nhật PLO (admin only)
  updatePLO: async (ploId: number, ploData: PLOUpdateRequest) => {
    const response = await api.put<{
      success: boolean;
      data: PLO;
      message?: string;
    }>(`/plos/${ploId}`, ploData);
    return response.data;
  },

  // Xóa PLO (admin only)
  deletePLO: async (ploId: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/plos/${ploId}`);
    return response.data;
  },

  // Xóa PLO (admin only) - alias for backward compatibility
  deletePLOById: async (ploId: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/plos/${ploId}`);
    return response.data;
  },

  // Lấy danh sách LOs theo PLO
  getPLOLOs: async (ploId: number) => {
    const response = await api.get<{
      success: boolean;
      data: Array<{
        lo_id: number;
        name: string;
        description?: string;
        subject_id?: number;
        plo_id?: number;
        created_at: string;
        updated_at: string;
      }>;
      message?: string;
    }>(`/plos/${ploId}/los`);
    return response.data;
  },

  // Lấy thống kê PLO
  getPLOStatistics: async (ploId: number) => {
    const response = await api.get<{
      success: boolean;
      data: {
        total_los: number;
        total_questions: number;
        completion_rate: number;
        average_score: number;
        difficulty_distribution: {
          easy: number;
          medium: number;
          hard: number;
        };
      };
      message?: string;
    }>(`/plos/${ploId}/statistics`);
    return response.data;
  },

  // Bulk operations - Tạo nhiều PLOs cùng lúc
  createMultiplePLOs: async (plosData: PLOCreateRequest[]) => {
    const response = await api.post<{
      success: boolean;
      data: PLO[];
      message?: string;
    }>("/plos/bulk", { plos: plosData });
    return response.data;
  },

  // Bulk operations - Xóa nhiều PLOs cùng lúc
  deleteMultiplePLOs: async (ploIds: number[]) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>("/plos/bulk", { data: { plo_ids: ploIds } });
    return response.data;
  },

  // Mapping operations - Liên kết PLO với LOs
  linkPLOToLOs: async (ploId: number, loIds: number[]) => {
    const response = await api.post<{
      success: boolean;
      message?: string;
    }>(`/plos/${ploId}/link-los`, { lo_ids: loIds });
    return response.data;
  },

  // Mapping operations - Hủy liên kết PLO với LOs
  unlinkPLOFromLOs: async (ploId: number, loIds: number[]) => {
    const response = await api.post<{
      success: boolean;
      message?: string;
    }>(`/plos/${ploId}/unlink-los`, { lo_ids: loIds });
    return response.data;
  },

  // Association operations - Liên kết PLO với PO
  associateWithPO: async (ploId: number, poId: number) => {
    const response = await api.post<{
      success: boolean;
      message?: string;
    }>(`/plos/${ploId}/associate-po`, { po_id: poId });
    return response.data;
  },

  // Association operations - Hủy liên kết PLO với PO
  disassociateFromPO: async (ploId: number, poId: number) => {
    const response = await api.post<{
      success: boolean;
      message?: string;
    }>(`/plos/${ploId}/disassociate-po`, { po_id: poId });
    return response.data;
  },
};

export default ploService;
