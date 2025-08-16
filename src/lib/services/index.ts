// Services barrel export
export * from "./api";
export * from "./socket";

// Re-export default services for convenience
export { default as quizService } from "./api/quiz.service";
export { default as authService } from "./api/auth.service";
export { default as userService } from "./api/user.service";
export { default as roleService } from "./api/role.service";
export { default as subjectService } from "./api/subject.service";
export { default as loService } from "./api/lo.service";
export { default as gamificationService } from "./api/gamification.service";
export { default as advancedAnalyticsService } from "./api/advanced-analytics.service";
export { default as avatarService } from "./api/avatar.service";

// Export default as quizService for backward compatibility
export { default } from "./api/quiz.service";
