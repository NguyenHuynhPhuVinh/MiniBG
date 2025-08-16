"use client";

import { useState, useEffect } from "react";
import {
  UserCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiError,
  User,
} from "@/lib/types/auth";
import { authService } from "@/lib/services/api";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";
import {
  saveToken,
  removeToken,
  isValidToken,
  getUserFromToken,
} from "@/lib/auth/token-utils";

/**
 * Hook xử lý đăng nhập
 */
export function useLoginMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const login = async (
    credentials: UserCredentials
  ): Promise<AuthResponse | undefined> => {
    try {
      setIsPending(true);
      setError(null);

      const response = await authService.login(
        credentials.email,
        credentials.password
      );

      console.log("Login API Response:", response); // Debug log

      // Xử lý response với wrapper success/data
      let data;
      if (response?.success && response?.data) {
        data = response.data;
      } else if (response?.user && response?.token) {
        // Fallback cho cấu trúc cũ nếu cần
        data = response;
      } else {
        throw new Error("Invalid login response structure");
      }

      // Kiểm tra dữ liệu người dùng
      if (data.user) {
        // Ghi log thông tin đăng nhập để debug
        console.log("Dữ liệu đăng nhập:", data.user);

        // Xử lý trường hợp vai trò có thể nằm trong cấu trúc khác nhau
        // Có thể vai trò nằm trực tiếp trong user.role hoặc trong user.Role.name
        let role = data.user.role;
        if (!role && data.user.Role && data.user.Role.name) {
          role = data.user.Role.name;
          // Cập nhật trường role cho dễ sử dụng
          data.user.role = role;
        }

        if (role) {
          // Lưu token vào localStorage (sử dụng hàm từ token-utils)
          saveToken(data.token);
          // Vẫn lưu thông tin user để tương thích với code cũ
          localStorage.setItem("user", JSON.stringify(data.user));

          return {
            token: data.token,
            user: {
              user_id: data.user.user_id,
              fullName: data.user.name,
              name: data.user.name, // Preserve trường name từ backend
              email: data.user.email,
              role: role,
            },
          };
        }
      }

      // Nếu không có thông tin vai trò, đặt lỗi
      const errorMsg =
        "Không thể xác định vai trò người dùng. Vui lòng liên hệ quản trị viên.";
      setError({
        message: errorMsg,
        status: 403,
      });
      // Toast sẽ được hiển thị từ interceptor API
      return undefined;
    } catch (err: unknown) {
      const error = err as Error & {
        response?: {
          data?: { error?: string; details?: string };
          status: number;
        };
      };
      console.error("Login Error:", error);

      if (error.response) {
        // Hiển thị thông báo lỗi chi tiết từ API
        const errorMsg =
          error.response.data?.error ||
          error.response.data?.details ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
        setError({
          message: errorMsg,
          status: error.response.status,
        });
        // Toast sẽ được hiển thị từ interceptor API
      } else {
        // Lỗi kết nối hoặc lỗi khác
        const errorMsg =
          error.message || "Đã xảy ra lỗi khi kết nối đến máy chủ.";
        setError({
          message: errorMsg,
          status: 500,
        });
        // Toast sẽ được hiển thị từ interceptor API
      }
    } finally {
      setIsPending(false);
    }
  };

  return { login, isPending, error };
}

/**
 * Hook xử lý đăng ký
 */
export function useRegisterMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const register = async (
    credentials: RegisterCredentials
  ): Promise<AuthResponse | undefined> => {
    try {
      setIsPending(true);
      setError(null);

      let data;

      // Hiện tại chỉ hỗ trợ đăng ký sinh viên
      // Đăng ký giáo viên yêu cầu quyền admin
      if (credentials.role === "student") {
        const response = await authService.registerStudent(
          credentials.fullName,
          credentials.email,
          credentials.password
        );

        console.log("Register API Response:", response); // Debug log

        // Xử lý response với wrapper success/data
        if (response?.success && response?.data) {
          data = response.data;
        } else if (response?.user && response?.token) {
          // Fallback cho cấu trúc cũ nếu cần
          data = response;
        } else {
          throw new Error("Invalid register response structure");
        }
      } else if (credentials.role === "teacher") {
        // Thông báo cho người dùng biết đăng ký giáo viên không được hỗ trợ trực tiếp
        const errorMsg =
          "Đăng ký giáo viên cần quyền admin. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
        setError({
          message: errorMsg,
          status: 403,
        });
        // Đây là lỗi logic nội bộ, không phải lỗi API nên cần hiển thị toast ở đây
        showErrorToast(errorMsg);
        return undefined;
      } else {
        throw new Error("Vai trò không hợp lệ");
      }

      // Hiển thị thông báo thành công
      showSuccessToast("Đăng ký tài khoản thành công!");

      return {
        token: data.token || "", // Có thể API đăng ký không trả về token
        user: {
          user_id: data.user.user_id,
          fullName: data.user.name,
          name: data.user.name, // Preserve trường name từ backend
          email: data.user.email,
          role: data.user.role,
        },
      };
    } catch (err: unknown) {
      const error = err as Error & {
        response?: {
          data?: { error?: string; details?: string };
          status: number;
        };
      };
      console.error("Register Error:", error);

      if (error.response) {
        // Hiển thị thông báo lỗi chi tiết từ API
        const errorMsg =
          error.response.data?.error ||
          error.response.data?.details ||
          "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
        setError({
          message: errorMsg,
          status: error.response.status,
        });
        // Toast sẽ được hiển thị từ interceptor API
      } else {
        // Lỗi kết nối hoặc lỗi khác
        const errorMsg =
          error.message || "Đã xảy ra lỗi khi kết nối đến máy chủ.";
        setError({
          message: errorMsg,
          status: 500,
        });
        // Toast sẽ được hiển thị từ interceptor API
      }
    } finally {
      setIsPending(false);
    }
  };

  return { register, isPending, error };
}

/**
 * Hook xử lý đăng xuất
 */
export function useLogout() {
  const logout = () => {
    removeToken();
    window.location.href = "/login";
  };

  return { logout };
}

/**
 * Hook kiểm tra trạng thái đăng nhập
 */
export function useAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = (): boolean => {
    return isValidToken();
  };

  const getUser = (): User | null => {
    // Nếu đã có state user, ưu tiên sử dụng
    if (user) {
      return user;
    }

    // Ưu tiên lấy từ localStorage trước
    if (typeof window !== "undefined") {
      const userFromLocal = localStorage.getItem("user");
      if (userFromLocal) {
        try {
          const parsedUser = JSON.parse(userFromLocal);
          // Chuẩn hóa dữ liệu để đảm bảo có id
          return {
            user_id: parsedUser.user_id || parsedUser.id,
            fullName: parsedUser.name || parsedUser.fullName,
            name: parsedUser.name, // Preserve trường name từ backend
            email: parsedUser.email,
            role:
              parsedUser.role || (parsedUser.Role ? parsedUser.Role.name : ""),
            avatar: parsedUser.avatar,
          };
        } catch (e) {
          console.error("Lỗi khi phân tích dữ liệu user từ localStorage:", e);
        }
      }
    }

    // Nếu không có trong localStorage thì lấy từ token
    const tokenUser = getUserFromToken();
    return tokenUser;
  };

  const refreshUserData = async () => {
    try {
      setLoading(true);
      if (isAuthenticated()) {
        // Lấy dữ liệu từ local/token
        const localUser = getUser();
        if (localUser) {
          setUser(localUser);
        }

        // Chỉ gọi API nếu cần thiết (ví dụ: để cập nhật avatar hoặc thông tin mới nhất)
        // Tạm thời comment out để tránh lỗi API
        /*
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            const updatedUser = {
              user_id: userData.user_id,
              fullName: userData.name,
              name: userData.name,
              email: userData.email,
              role: userData.Role?.name || userData.role,
              avatar: userData.avatar,
            };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(userData));
          }
        } catch (apiError) {
          console.warn("Không thể lấy dữ liệu mới nhất từ API, sử dụng dữ liệu local:", apiError);
        }
        */
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      // Vẫn giữ lại dữ liệu từ local nếu có lỗi
      const localUser = getUser();
      if (localUser) {
        setUser(localUser);
      }
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo dữ liệu người dùng ngay khi hook được gọi

  useEffect(() => {
    refreshUserData();
  }, []);

  return { isAuthenticated, getUser, user, loading, refreshUserData };
}
