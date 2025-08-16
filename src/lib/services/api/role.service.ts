import api from "./client";

// Service quản lý vai trò (dành cho admin)
export const roleService = {
  // Lấy danh sách vai trò
  getAllRoles: async (page = 1, limit = 10) => {
    const response = await api.get(`/roles?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Lấy thông tin vai trò theo ID
  getRoleById: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Tạo vai trò mới
  createRole: async (name: string) => {
    const response = await api.post("/roles", { name });
    return response.data;
  },

  // Cập nhật vai trò
  updateRole: async (id: string, name: string) => {
    const response = await api.put(`/roles/${id}`, { name });
    return response.data;
  },

  // Xóa vai trò
  deleteRole: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};

export default roleService;
