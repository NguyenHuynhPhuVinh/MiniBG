"use client";

import { ReactNode } from "react";
import { getCurrentRole } from "@/lib/auth/role-manager";

interface RoleGuardProps {
  /**
   * Vai trò yêu cầu để hiển thị nội dung
   * Có thể là một vai trò cụ thể hoặc mảng các vai trò được phép
   */
  roles: string | string[];

  /**
   * Nội dung sẽ hiển thị nếu người dùng có quyền
   */
  children: ReactNode;

  /**
   * Nội dung thay thế sẽ hiển thị nếu người dùng không có quyền
   * Nếu không cung cấp, component sẽ không hiển thị gì khi không có quyền
   */
  fallback?: ReactNode;
}

/**
 * Component bảo vệ nội dung dựa trên vai trò
 * Chỉ hiển thị nội dung nếu người dùng có chính xác vai trò đó
 */
export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const currentRole = getCurrentRole();
  let hasPermission = false;

  if (!currentRole) {
    hasPermission = false;
  } else if (typeof roles === "string") {
    // Chỉ hiển thị nếu người dùng có chính xác vai trò này
    hasPermission = currentRole === roles;
  } else if (Array.isArray(roles)) {
    // Hiển thị nếu người dùng có một trong các vai trò cụ thể
    hasPermission = roles.includes(currentRole);
  }

  // Hiển thị nội dung nếu có quyền, ngược lại hiển thị fallback hoặc null
  return hasPermission ? <>{children}</> : fallback ? <>{fallback}</> : null;
}

/**
 * Component chỉ hiển thị nội dung cho admin
 */
export function AdminOnly({
  children,
  fallback,
}: Omit<RoleGuardProps, "roles">) {
  return (
    <RoleGuard roles="admin" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Component chỉ hiển thị nội dung cho giáo viên
 */
export function TeacherOnly({
  children,
  fallback,
}: Omit<RoleGuardProps, "roles">) {
  return (
    <RoleGuard roles="teacher" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Component chỉ hiển thị nội dung cho sinh viên
 */
export function StudentOnly({
  children,
  fallback,
}: Omit<RoleGuardProps, "roles">) {
  return (
    <RoleGuard roles="student" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
