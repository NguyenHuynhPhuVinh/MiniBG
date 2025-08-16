// Định nghĩa các kiểu dữ liệu cho toàn bộ ứng dụng

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends UserCredentials {
  fullName: string;
  confirmPassword: string;
  role: "student" | "teacher";
}

export interface User {
  user_id: number;
  fullName: string;
  name?: string; // Thêm trường name từ backend
  email: string;
  role: "admin" | "teacher" | "student";
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  status: number;
}
