// API endpoints, timeouts, base URLs and configuration constants

export const API_CONFIG = {
  // URL API backend
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888/api",

  // Thời gian timeout cho các request (ms)
  TIMEOUT: 30000,

  // Thời gian hết hạn token (ms) - 1 giờ
  TOKEN_EXPIRY: 60 * 60 * 1000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  // User management
  USERS: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    LIST: "/users",
    DELETE: "/users",
  },

  // Quiz management
  QUIZZES: {
    LIST: "/quizzes",
    CREATE: "/quizzes",
    DETAIL: "/quizzes",
    UPDATE: "/quizzes",
    DELETE: "/quizzes",
    START: "/quizzes/start",
    SUBMIT: "/quizzes/submit",
    RESULTS: "/quizzes/results",
  },

  // Subject management
  SUBJECTS: {
    LIST: "/subjects",
    CREATE: "/subjects",
    UPDATE: "/subjects",
    DELETE: "/subjects",
  },

  // Learning Outcomes
  LEARNING_OUTCOMES: {
    LIST: "/learning-outcomes",
    CREATE: "/learning-outcomes",
    UPDATE: "/learning-outcomes",
    DELETE: "/learning-outcomes",
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
    QUIZ_RESULTS: "/analytics/quiz-results",
    STUDENT_PROGRESS: "/analytics/student-progress",
    ADVANCED: "/analytics/advanced",
  },

  // Gamification
  GAMIFICATION: {
    LEADERBOARD: "/gamification/leaderboard",
    USER_STATS: "/gamification/user-stats",
    ACHIEVEMENTS: "/gamification/achievements",
  },

  // Currency
  CURRENCY: {
    BALANCE: "/currency/balance",
    HISTORY: "/currency/history",
    TRANSFER: "/currency/transfer",
  },

  // Shop
  SHOP: {
    AVATARS: "/shop/avatars",
    FRAMES: "/shop/frames",
    EMOJIS: "/shop/emojis",
    PURCHASE: "/shop/purchase",
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// Request Headers
export const REQUEST_HEADERS = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
  ACCEPT: "Accept",
  USER_AGENT: "User-Agent",
};

// Content Types
export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  URL_ENCODED: "application/x-www-form-urlencoded",
  TEXT: "text/plain",
};

// Error Messages for API
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: "Đã xảy ra lỗi khi kết nối đến máy chủ.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền truy cập vào tài nguyên này.",
  NOT_FOUND: "Không tìm thấy tài nguyên yêu cầu.",
  SERVER_ERROR: "Đã xảy ra lỗi từ phía máy chủ.",
  BAD_REQUEST: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.",
  TIMEOUT: "Yêu cầu đã hết thời gian chờ.",
  RATE_LIMITED: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",

  // Chapter Analytics specific errors
  ANALYTICS_FETCH_FAILED: "Không thể tải dữ liệu phân tích. Vui lòng thử lại.",
  CHAPTER_ANALYSIS_FAILED: "Không thể phân tích dữ liệu theo chương.",
  COMPREHENSIVE_ANALYSIS_FAILED: "Không thể tải báo cáo phân tích tổng hợp.",
  TEACHER_ANALYTICS_FAILED: "Không thể tải dữ liệu phân tích cho giáo viên.",
};
