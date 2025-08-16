"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentRole, Role } from "@/lib/auth/role-manager";

/**
 * Hook kiểm tra phân quyền truy cập dựa trên vai trò
 * @param requiredRole Vai trò cần thiết để truy cập trang
 * @param redirectTo Đường dẫn chuyển hướng khi không có quyền (mặc định: /dashboard)
 * @returns Thông tin về trạng thái kiểm tra phân quyền
 */
export function useRoleBasedAccess(
  requiredRole: string | string[] = Role.STUDENT,
  redirectTo: string = "/dashboard"
) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      setLoading(true);
      const currentRole = getCurrentRole();

      if (!currentRole) {
        setHasPermission(false);
        router.replace(redirectTo);
      } else if (typeof requiredRole === "string") {
        // Nếu yêu cầu một vai trò cụ thể, cần chính xác vai trò đó
        const canAccess = currentRole === requiredRole;
        setHasPermission(canAccess);

        if (!canAccess) {
          router.replace(redirectTo);
        }
      } else if (Array.isArray(requiredRole)) {
        // Nếu yêu cầu một trong nhiều vai trò, kiểm tra xem người dùng có nằm trong danh sách không
        const canAccess = requiredRole.includes(currentRole);
        setHasPermission(canAccess);

        if (!canAccess) {
          router.replace(redirectTo);
        }
      }

      setLoading(false);
    };

    checkAccess();
  }, [requiredRole, redirectTo, router]);

  return {
    loading,
    hasPermission,
    currentRole: getCurrentRole(),
  };
}

/**
 * Hook kiểm tra quyền admin
 * @param redirectTo Đường dẫn chuyển hướng khi không có quyền
 * @returns Thông tin về trạng thái kiểm tra phân quyền
 */
export function useAdminAccess(redirectTo: string = "/dashboard") {
  return useRoleBasedAccess(Role.ADMIN, redirectTo);
}

/**
 * Hook kiểm tra quyền giáo viên
 * @param redirectTo Đường dẫn chuyển hướng khi không có quyền
 * @returns Thông tin về trạng thái kiểm tra phân quyền
 */
export function useTeacherAccess(redirectTo: string = "/dashboard") {
  return useRoleBasedAccess(Role.TEACHER, redirectTo);
}

/**
 * Hook kiểm tra quyền sinh viên
 * @param redirectTo Đường dẫn chuyển hướng khi không có quyền
 * @returns Thông tin về trạng thái kiểm tra phân quyền
 */
export function useStudentAccess(redirectTo: string = "/dashboard") {
  return useRoleBasedAccess(Role.STUDENT, redirectTo);
}
