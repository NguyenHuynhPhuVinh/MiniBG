import axios from "axios";
import { API_CONFIG, API_ERROR_MESSAGES } from "@/lib/constants";
import { showErrorToast } from "../../utils/toast-utils";
import { getToken, removeToken } from "@/lib/auth/token-utils";

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_CONFIG.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_CONFIG.TIMEOUT,
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi API nhưng không tự động chuyển hướng để dễ debug
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });

      // Xử lý các trường hợp lỗi cụ thể
      switch (error.response.status) {
        case 401:
          // Xóa token và chuyển hướng về trang đăng nhập
          if (typeof window !== "undefined") {
            console.warn("Auth token expired or invalid");
            removeToken();

            // Chỉ chuyển hướng nếu không phải đang ở trang đăng nhập
            const currentPath = window.location.pathname;
            if (
              !currentPath.includes("/login") &&
              !currentPath.includes("/register")
            ) {
              window.location.href = "/login";
            }
          }
          const unauthorizedError = new Error(
            error.response.data?.error || API_ERROR_MESSAGES.UNAUTHORIZED
          );
          showErrorToast(unauthorizedError.message);
          return Promise.reject(unauthorizedError);
        case 403:
          const forbiddenError = new Error(
            error.response.data?.error || API_ERROR_MESSAGES.FORBIDDEN
          );
          showErrorToast(forbiddenError.message);
          return Promise.reject(forbiddenError);
        case 404:
          const notFoundError = new Error(
            error.response.data?.error || API_ERROR_MESSAGES.NOT_FOUND
          );
          showErrorToast(notFoundError.message);
          return Promise.reject(notFoundError);
        case 500:
          const serverError = new Error(
            error.response.data?.error || API_ERROR_MESSAGES.SERVER_ERROR
          );
          showErrorToast(serverError.message);
          return Promise.reject(serverError);
        default:
          const defaultError = new Error(
            error.response.data?.error || `Lỗi API: ${error.response.status}`
          );
          showErrorToast(defaultError.message);
          return Promise.reject(defaultError);
      }
    } else if (error.request) {
      // Yêu cầu đã được gửi nhưng không nhận được phản hồi
      console.error("Network Error:", error.request);
      const networkError = new Error(API_ERROR_MESSAGES.NETWORK_ERROR);
      showErrorToast(networkError.message);
      return Promise.reject(networkError);
    }

    // Lỗi khác
    console.error("API Request Error:", error.message);
    showErrorToast(error.message || "Đã xảy ra lỗi không xác định");
    return Promise.reject(error);
  }
);

export default api;
