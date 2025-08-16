import { getUserRoleFromToken } from "./token-utils";

/**
 * Enum định nghĩa các vai trò trong hệ thống
 */
export enum Role {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
}

/**
 * Kiểm tra một vai trò có quyền cao hơn hoặc bằng vai trò khác không
 * Lưu ý: Không còn sử dụng cho UI.
 * @param role Vai trò cần kiểm tra
 * @param requiredRole Vai trò yêu cầu
 * @returns true nếu vai trò có quyền cao hơn hoặc bằng vai trò yêu cầu
 */
export const hasHigherOrEqualRole = (
  role: string | null,
  requiredRole: string
): boolean => {
  if (!role) return false;

  // Thứ tự quyền từ cao đến thấp: admin > teacher > student
  switch (role) {
    case Role.ADMIN:
      return true;
    case Role.TEACHER:
      return requiredRole !== Role.ADMIN;
    case Role.STUDENT:
      return requiredRole === Role.STUDENT;
    default:
      return false;
  }
};

/**
 * Kiểm tra người dùng hiện tại có quyền truy cập không
 * @param requiredRole Vai trò yêu cầu để truy cập
 * @returns true nếu có quyền truy cập, false nếu không
 */
export const hasAccess = (requiredRole: string): boolean => {
  const currentRole = getUserRoleFromToken();
  if (!currentRole) return false;

  // Kiểm tra chính xác vai trò
  return currentRole === requiredRole;
};

/**
 * Kiểm tra người dùng hiện tại có phải là vai trò được chỉ định không
 * @param roles Danh sách vai trò cần kiểm tra
 * @returns true nếu người dùng có vai trò nằm trong danh sách, false nếu không
 */
export const hasRole = (roles: string | string[]): boolean => {
  const currentRole = getUserRoleFromToken();
  if (!currentRole) return false;

  if (typeof roles === "string") {
    return currentRole === roles;
  }

  return roles.includes(currentRole);
};

/**
 * Kiểm tra người dùng hiện tại có phải là admin không
 * @returns true nếu là admin, false nếu không
 */
export const isAdmin = (): boolean => {
  return hasRole(Role.ADMIN);
};

/**
 * Kiểm tra người dùng hiện tại có phải là giáo viên không
 * @returns true nếu là giáo viên, false nếu không
 */
export const isTeacher = (): boolean => {
  return hasRole(Role.TEACHER);
};

/**
 * Kiểm tra người dùng hiện tại có phải là sinh viên không
 * @returns true nếu là sinh viên, false nếu không
 */
export const isStudent = (): boolean => {
  return hasRole(Role.STUDENT);
};

/**
 * Lấy vai trò hiện tại của người dùng
 * @returns Vai trò hiện tại hoặc null nếu chưa đăng nhập
 */
export const getCurrentRole = (): string | null => {
  return getUserRoleFromToken();
};

/**
 * Kiểm tra một chuỗi có phải là role hợp lệ không
 * @param role Chuỗi cần kiểm tra
 * @returns true nếu là role hợp lệ, false nếu không
 */
export const isValidRole = (role: string): boolean => {
  return Object.values(Role).includes(role as Role);
};
