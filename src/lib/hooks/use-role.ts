"use client";

import { useState, useEffect } from "react";
import { getUserRoleFromToken } from "@/lib/auth/token-utils";
import { isValidToken } from "@/lib/auth/token-utils";

/**
 * Hook quản lý role người dùng từ JWT token thay vì từ localStorage
 * @returns Thông tin về role người dùng và các hàm tiện ích liên quan
 */
export function useRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cập nhật role từ token khi component mount hoặc khi token thay đổi
  useEffect(() => {
    const updateRole = () => {
      // Kiểm tra token có hợp lệ không
      if (isValidToken()) {
        // Lấy role từ token
        const userRole = getUserRoleFromToken();
        setRole(userRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    };

    // Cập nhật role khi hook được gọi
    updateRole();

    // Lắng nghe sự kiện storage để cập nhật role khi token thay đổi
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        updateRole();
      }
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener("storage", handleStorageChange);

    // Dọn dẹp khi component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  /**
   * Kiểm tra người dùng có phải là admin không
   * @returns true nếu là admin, false nếu không
   */
  const isAdmin = (): boolean => {
    return role === "admin";
  };

  /**
   * Kiểm tra người dùng có phải là giáo viên không
   * @returns true nếu là giáo viên, false nếu không
   */
  const isTeacher = (): boolean => {
    return role === "teacher";
  };

  /**
   * Kiểm tra người dùng có phải là sinh viên không
   * @returns true nếu là sinh viên, false nếu không
   */
  const isStudent = (): boolean => {
    return role === "student";
  };

  /**
   * Kiểm tra người dùng có quyền cao hơn hoặc bằng quyền yêu cầu không
   * @param requiredRole Quyền yêu cầu ("admin", "teacher", "student")
   * @returns true nếu có quyền, false nếu không
   */
  const hasRole = (requiredRole: string): boolean => {
    // Thứ tự quyền từ cao đến thấp: admin > teacher > student
    if (!role) return false;

    if (role === "admin") return true;
    if (role === "teacher" && requiredRole !== "admin") return true;
    if (role === "student" && requiredRole === "student") return true;

    return false;
  };

  /**
   * Lấy role hiện tại của người dùng
   * @returns Role hiện tại hoặc null nếu chưa đăng nhập
   */
  const getRole = (): string | null => {
    return role;
  };

  /**
   * Cập nhật lại role từ token
   */
  const refreshRole = (): void => {
    const userRole = getUserRoleFromToken();
    setRole(userRole);
  };

  return {
    role,
    loading,
    isAdmin,
    isTeacher,
    isStudent,
    hasRole,
    getRole,
    refreshRole,
  };
}
