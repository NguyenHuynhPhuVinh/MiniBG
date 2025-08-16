import api from "./client";
import type {
  PO,
  POWithRelations,
  POListResponse,
  POCreateRequest,
  POUpdateRequest,
  POFilterParams,
} from "@/lib/types/program-management";

export const poService = {
  // Lấy danh sách tất cả POs
  getPOs: async (params?: POFilterParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.program_id)
      queryParams.append("program_id", params.program_id.toString());

    const response = await api.get<POListResponse>(
      `/pos${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // Lấy chi tiết PO theo ID
  getPOById: async (poId: number) => {
    const response = await api.get<{
      success: boolean;
      data: POWithRelations;
      message?: string;
    }>(`/pos/${poId}`);
    return response.data;
  },

  // Lấy POs theo program ID
  getPOsByProgram: async (
    programId: number,
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
      data: PO[];
      message?: string;
    }>(
      `/pos/program/${programId}${
        queryParams.toString() ? `?${queryParams}` : ""
      }`
    );
    return response.data;
  },

  // Tạo PO mới (admin only)
  createPO: async (poData: POCreateRequest) => {
    const response = await api.post<{
      success: boolean;
      data: PO;
      message?: string;
    }>("/pos", poData);
    return response.data;
  },

  // Cập nhật PO (admin only)
  updatePO: async (poId: number, poData: POUpdateRequest) => {
    const response = await api.put<{
      success: boolean;
      data: PO;
      message?: string;
    }>(`/pos/${poId}`, poData);
    return response.data;
  },

  // Xóa PO (admin only)
  deletePO: async (poId: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/pos/${poId}`);
    return response.data;
  },

  // Xóa PO (admin only) - alias for backward compatibility
  deletePOById: async (poId: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/pos/${poId}`);
    return response.data;
  },

  // Lấy danh sách PLOs theo PO
  getPOPLOs: async (poId: number) => {
    const response = await api.get<{
      success: boolean;
      data: Array<{
        plo_id: number;
        name: string;
        description?: string;
        code?: string;
        program_id: number;
        po_id?: number;
        created_at: string;
        updated_at: string;
      }>;
      message?: string;
    }>(`/pos/${poId}/plos`);
    return response.data;
  },

  // Lấy thống kê PO
  getPOStatistics: async (poId: number) => {
    const response = await api.get<{
      success: boolean;
      data: {
        total_plos: number;
        total_los: number;
        completion_rate: number;
        average_score: number;
      };
      message?: string;
    }>(`/pos/${poId}/statistics`);
    return response.data;
  },

  // Bulk operations - Tạo nhiều POs cùng lúc
  createMultiplePOs: async (posData: POCreateRequest[]) => {
    const response = await api.post<{
      success: boolean;
      data: PO[];
      message?: string;
    }>("/pos/bulk", { pos: posData });
    return response.data;
  },

  // Bulk operations - Xóa nhiều POs cùng lúc
  deleteMultiplePOs: async (poIds: number[]) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>("/pos/bulk", { data: { po_ids: poIds } });
    return response.data;
  },
};

export default poService;
