import { jwtDecode } from "jwt-decode";
import { User } from "@/lib/types/auth";

interface TokenPayload {
  user_id: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Lấy token JWT từ localStorage
 * @returns token JWT hoặc null nếu không có
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/**
 * Lưu token JWT vào localStorage
 * @param token Token JWT cần lưu
 */
export const saveToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
};

/**
 * Xóa token JWT khỏi localStorage
 */
export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // Xóa cả thông tin user để đảm bảo tính nhất quán
};

/**
 * Kiểm tra token có hợp lệ hay không
 * @returns true nếu token hợp lệ, false nếu không
 */
export const isValidToken = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return false;
  }
};

/**
 * Lấy thông tin payload từ token JWT
 * @returns Thông tin payload hoặc null nếu token không hợp lệ
 */
export const getTokenPayload = (): TokenPayload | null => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};

/**
 * Lấy role của người dùng từ token JWT
 * @returns Role của người dùng hoặc null nếu không có token hoặc token không hợp lệ
 */
export const getUserRoleFromToken = (): string | null => {
  const payload = getTokenPayload();
  return payload?.role || null;
};

/**
 * Lấy thông tin người dùng từ token JWT
 * @returns Thông tin người dùng hoặc null nếu không có token hoặc token không hợp lệ
 */
export const getUserFromToken = (): User | null => {
  const payload = getTokenPayload();
  if (!payload) return null;

  return {
    user_id: Number(payload.user_id),
    fullName: payload.name,
    name: payload.name, // Preserve trường name từ token
    email: payload.email,
    role: payload.role as "admin" | "teacher" | "student",
  };
};
