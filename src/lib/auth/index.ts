// Export from token-utils.ts
export {
  getToken,
  saveToken,
  removeToken,
  isValidToken,
  getTokenPayload,
  getUserRoleFromToken,
  getUserFromToken,
} from "./token-utils";

// Export from role-manager.ts
export {
  Role,
  hasHigherOrEqualRole,
  hasAccess,
  hasRole,
  isAdmin,
  isTeacher,
  isStudent,
  getCurrentRole,
  isValidRole,
} from "./role-manager";

// Export types
export type { User } from "@/lib/types/auth";
