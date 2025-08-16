// Application-wide constants including roles, statuses, routes, and defaults

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher", 
  STUDENT: "student",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// User Status
export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Quiz Status
export const QUIZ_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export type QuizStatus = typeof QUIZ_STATUS[keyof typeof QUIZ_STATUS];

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  FILL_IN_BLANK: "fill_in_blank",
  ESSAY: "essay",
} as const;

export type QuestionType = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES];

// Application Routes
export const APP_ROUTES = {
  // Public routes
  PUBLIC: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },

  // Student routes
  STUDENT: {
    DASHBOARD: "/dashboard",
    PROFILE: "/dashboard/profile",
    QUIZZES: "/dashboard/student/quizzes",
    QUIZ_LIST: "/dashboard/student/quizzes/list",
    QUIZ_COMPLETED: "/dashboard/student/quizzes/completed",
    QUIZ_RESULT: "/dashboard/student/quizzes/result",
    LEARNING_RESULTS: "/dashboard/student/learning-results",
    LEADERBOARD: "/dashboard/leaderboard",
  },

  // Teacher routes
  TEACHER: {
    DASHBOARD: "/dashboard",
    PROFILE: "/dashboard/profile",
    QUIZZES: "/dashboard/teaching/quizzes",
    QUIZ_LIST: "/dashboard/teaching/quizzes/list",
    QUIZ_CREATE: "/dashboard/teaching/quizzes/create",
    QUIZ_DETAIL: "/dashboard/teaching/quizzes/detail",
    QUIZ_EDIT: "/dashboard/teaching/quizzes/edit",
    STUDENTS: "/dashboard/teaching/students",
    REPORTS: "/dashboard/reports",
    QUIZ_RESULTS: "/dashboard/reports/quiz-results",
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: "/dashboard",
    USERS: "/admin/users",
    SUBJECTS: "/admin/subjects",
    SETTINGS: "/admin/settings",
    ANALYTICS: "/admin/analytics",
  },

  // Quiz-specific routes
  QUIZ: {
    WAITING_ROOM: "/quiz-waiting-room",
    LIVE: "/quiz-live",
    MONITOR: "/quiz-monitor",
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  THEME: "theme",
  LANGUAGE: "language",
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
  QUIZ_DRAFT: "quiz_draft",
  QUIZ_PROGRESS: "quiz_progress",
} as const;

// Session Storage Keys
export const SESSION_KEYS = {
  QUIZ_STATE: "quiz_state",
  FORM_DATA: "form_data",
  NAVIGATION_STATE: "navigation_state",
} as const;

// Default Values
export const DEFAULTS = {
  // Pagination
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Quiz settings
  QUIZ_DURATION: 60, // minutes
  QUESTIONS_PER_PAGE: 1,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds

  // UI settings
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,

  // Timeouts
  TOAST_DURATION: 5000,
  LOADING_DELAY: 300,
  DEBOUNCE_DELAY: 500,

  // File upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  CHUNK_SIZE: 1024 * 1024, // 1MB

  // Gamification
  INITIAL_POINTS: 0,
  INITIAL_LEVEL: 1,
  POINTS_PER_CORRECT_ANSWER: 10,
  POINTS_PER_QUIZ_COMPLETION: 50,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_GAMIFICATION: true,
  ENABLE_REAL_TIME_QUIZ: true,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: true,
  ENABLE_MULTI_LANGUAGE: false,
} as const;

// Environment Constants
export const ENVIRONMENT = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_TEST: process.env.NODE_ENV === "test",
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  SHORT: "dd/MM/yyyy",
  LONG: "dd/MM/yyyy HH:mm",
  TIME_ONLY: "HH:mm",
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  DISPLAY: "dd 'tháng' MM, yyyy",
  DISPLAY_WITH_TIME: "dd 'tháng' MM, yyyy 'lúc' HH:mm",
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Socket Events
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",

  // Quiz events
  QUIZ_START: "quiz:start",
  QUIZ_END: "quiz:end",
  QUIZ_UPDATE: "quiz:update",
  QUESTION_ANSWER: "question:answer",
  PARTICIPANT_JOIN: "participant:join",
  PARTICIPANT_LEAVE: "participant:leave",

  // Real-time updates
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  NOTIFICATION: "notification",
} as const;

// Permission Constants
export const PERMISSIONS = {
  // Quiz permissions
  QUIZ_CREATE: "quiz:create",
  QUIZ_READ: "quiz:read",
  QUIZ_UPDATE: "quiz:update",
  QUIZ_DELETE: "quiz:delete",
  QUIZ_PUBLISH: "quiz:publish",

  // User permissions
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // Subject permissions
  SUBJECT_CREATE: "subject:create",
  SUBJECT_READ: "subject:read",
  SUBJECT_UPDATE: "subject:update",
  SUBJECT_DELETE: "subject:delete",

  // Analytics permissions
  ANALYTICS_VIEW: "analytics:view",
  ANALYTICS_EXPORT: "analytics:export",
} as const;
