import api from "./client";

// Service quản lý người dùng (dành cho admin)
export const userService = {
  // Lấy danh sách người dùng
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Tạo admin mới (yêu cầu quyền admin)
  createAdmin: async (name: string, email: string, password: string) => {
    const response = await api.post("/users/createAdmin", {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Xóa người dùng (yêu cầu quyền admin)
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Import danh sách học viên từ file Excel (yêu cầu quyền giáo viên)
  importStudents: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/users/importStudents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default userService;
