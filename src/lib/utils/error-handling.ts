// Error handling utilities for gamification system

export interface GamificationError {
  type: "API_ERROR" | "NETWORK_ERROR" | "VALIDATION_ERROR" | "UNKNOWN_ERROR";
  message: string;
  originalError?: any;
  timestamp: number;
  context?: string;
}

/**
 * Create a standardized gamification error
 */
export function createGamificationError(
  type: GamificationError["type"],
  message: string,
  originalError?: any,
  context?: string
): GamificationError {
  return {
    type,
    message,
    originalError,
    timestamp: Date.now(),
    context,
  };
}

/**
 * Log gamification errors for debugging
 */
export function logGamificationError(error: GamificationError): void {
  const logData = {
    type: error.type,
    message: error.message,
    timestamp: new Date(error.timestamp).toISOString(),
    context: error.context,
    originalError: error.originalError?.message || error.originalError,
  };

  console.error("[Gamification Error]", logData);

  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === "production") {
    // Example: Send to logging service
    // logToService(logData);
  }
}

/**
 * Handle API errors with appropriate fallback messages
 */
export function handleGamificationApiError(
  error: any,
  context: string
): GamificationError {
  let errorType: GamificationError["type"] = "UNKNOWN_ERROR";
  let message = "Đã xảy ra lỗi không xác định";

  if (error?.response) {
    // API responded with error status
    errorType = "API_ERROR";
    const status = error.response.status;

    switch (status) {
      case 401:
        message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        break;
      case 403:
        message = "Bạn không có quyền truy cập tính năng này.";
        break;
      case 404:
        message = "Không tìm thấy dữ liệu yêu cầu.";
        break;
      case 429:
        message = "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
        break;
      case 500:
        message = "Lỗi máy chủ. Vui lòng thử lại sau.";
        break;
      default:
        message = error.response.data?.message || `Lỗi API (${status})`;
    }
  } else if (error?.request) {
    // Network error
    errorType = "NETWORK_ERROR";
    message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
  } else if (error?.message) {
    // Other error with message
    message = error.message;
  }

  const gamificationError = createGamificationError(
    errorType,
    message,
    error,
    context
  );

  logGamificationError(gamificationError);
  return gamificationError;
}

/**
 * Default fallback data for when APIs fail
 */
export const DEFAULT_FALLBACK_DATA = {
  userGamification: {
    user_id: 0,
    name: "Unknown User",
    total_points: 0,
    current_level: 1,
    experience_points: 0,
    experience_to_next_level: 100,
    stats: {
      total_quizzes_completed: 0,
      total_correct_answers: 0,
      total_questions_answered: 0,
      best_streak: 0,
      current_streak: 0,
      speed_bonus_earned: 0,
      perfect_scores: 0,
      average_response_time: 0,
    },
  },
  tiers: [
    {
      tier_name: "wood",
      tier_color: "#8B4513",
      min_level: 1,
      max_level: 12,
      min_xp: 0,
      max_xp: 1200,
    },
  ],
  userTitles: [],
  userBadges: [],
  leaderboard: [],
};

/**
 * Get fallback tier icon when image mapping fails
 */
export function getErrorFallbackTierIcon(tierName?: string): string {
  const defaultTier = tierName?.toLowerCase() || "wood";
  return `/vector-ranks-pack/wood/diamond-wood-1.png`; // Always fallback to wood level 1
}

/**
 * Validate API response structure
 */
export function validateApiResponse(
  response: any,
  expectedFields: string[]
): boolean {
  if (!response || typeof response !== "object") {
    return false;
  }

  return expectedFields.every((field) => {
    const fieldPath = field.split(".");
    let current = response;

    for (const path of fieldPath) {
      if (current === null || current === undefined || !(path in current)) {
        return false;
      }
      current = current[path];
    }

    return true;
  });
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Safe API call wrapper with error handling and fallback
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  context: string,
  retries: number = 1
): Promise<{ data: T; error: GamificationError | null }> {
  try {
    const data = await retryWithBackoff(apiCall, retries);
    return { data, error: null };
  } catch (error) {
    const gamificationError = handleGamificationApiError(error, context);
    return { data: fallbackValue, error: gamificationError };
  }
}

/**
 * Check if error is recoverable (can retry)
 */
export function isRecoverableError(error: GamificationError): boolean {
  return (
    error.type === "NETWORK_ERROR" ||
    (error.type === "API_ERROR" && error.originalError?.response?.status >= 500)
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: GamificationError): string {
  switch (error.type) {
    case "NETWORK_ERROR":
      return "Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.";
    case "API_ERROR":
      return error.message;
    case "VALIDATION_ERROR":
      return "Dữ liệu không hợp lệ. Vui lòng thử lại.";
    default:
      return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
  }
}
