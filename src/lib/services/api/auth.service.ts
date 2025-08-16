import axios from "axios";
import api from "./client";
import { API_CONFIG, API_ERROR_MESSAGES } from "@/lib/constants";
import { showErrorToast } from "../../utils/toast-utils";
import { jwtDecode } from "jwt-decode";

// Interface cho JWT payload
interface TokenPayload {
  user_id: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Service xác thực
export const authService = {
  // Đăng nhập
  login: async (email: string, password: string) => {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  },

  // Đăng ký sinh viên (không cần token)
  registerStudent: async (name: string, email: string, password: string) => {
    // Tạo axios instance riêng không có interceptor để tránh vấn đề với token
    const publicApi = axios.create({
      baseURL: API_CONFIG.API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: API_CONFIG.TIMEOUT,
    });

    // Thêm interceptor xử lý lỗi cho publicApi
    publicApi.interceptors.response.use(
      (response) => response,
      (error) => {
        // Xử lý lỗi API
        if (error.response) {
          console.error("Register API Error:", {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response.data,
          });

          // Xử lý các trường hợp lỗi cụ thể
          switch (error.response.status) {
            case 400:
              const badRequestError = new Error(
                error.response.data?.error || API_ERROR_MESSAGES.BAD_REQUEST
              );
              showErrorToast(badRequestError.message);
              return Promise.reject(badRequestError);
            case 409:
              const conflictError = new Error(
                error.response.data?.error ||
                  "Email đã được sử dụng. Vui lòng chọn email khác."
              );
              showErrorToast(conflictError.message);
              return Promise.reject(conflictError);
            case 500:
              const serverError = new Error(
                error.response.data?.error || API_ERROR_MESSAGES.SERVER_ERROR
              );
              showErrorToast(serverError.message);
              return Promise.reject(serverError);
            default:
              const defaultError = new Error(
                error.response.data?.error ||
                  `Lỗi API: ${error.response.status}`
              );
              showErrorToast(defaultError.message);
              return Promise.reject(defaultError);
          }
        } else if (error.request) {
          // Yêu cầu đã được gửi nhưng không nhận được phản hồi
          console.error("Register Network Error:", error.request);
          const networkError = new Error(API_ERROR_MESSAGES.NETWORK_ERROR);
          showErrorToast(networkError.message);
          return Promise.reject(networkError);
        }

        // Lỗi khác
        console.error("Register Request Error:", error.message);
        showErrorToast(error.message || "Đã xảy ra lỗi không xác định");
        return Promise.reject(error);
      }
    );

    const response = await publicApi.post("/users/createStudent", {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Đăng ký giáo viên (yêu cầu quyền admin)
  // Lưu ý: API này yêu cầu token admin, nên không thể sử dụng để đăng ký mới
  registerTeacher: async (name: string, email: string, password: string) => {
    // Sử dụng instance api có token nếu có
    const response = await api.post("/users/createTeacher", {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: async () => {
    if (typeof window !== "undefined") {
      let userId = null;

      // Thử lấy user_id từ localStorage trước
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          userId = userData.user_id || userData.id;
        } catch (e) {
          console.error("Lỗi khi parse user từ localStorage:", e);
        }
      }

      // Nếu không có trong localStorage, thử lấy từ token
      if (!userId) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = jwtDecode<TokenPayload>(token);
            userId = decoded.user_id;
          } catch (e) {
            console.error("Lỗi khi decode token:", e);
          }
        }
      }

      // Gọi API nếu có userId
      if (userId) {
        const response = await api.get(`/users/${userId}`);
        return response.data;
      }
    }
    return null;
  },

  // Cập nhật thông tin người dùng
  updateUser: async (
    userId: string,
    data: { name?: string; email?: string; password?: string }
  ) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },
};

export default authService;
