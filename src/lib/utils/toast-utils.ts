/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { API_ERROR_MESSAGES, DEFAULTS } from "@/lib/constants";

interface ErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

/**
 * Hiển thị thông báo lỗi từ API bằng toast
 * @param error - Lỗi từ API hoặc chuỗi thông báo lỗi
 */
export const showErrorToast = (error: any): void => {
  let errorMessage = "Đã xảy ra lỗi không xác định";

  if (typeof error === "string") {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message || "Đã xảy ra lỗi không xác định";
  } else if (error?.response?.data) {
    const errorData: ErrorResponse = error.response.data;
    errorMessage =
      errorData.error ||
      errorData.message ||
      `Lỗi API: ${error.response.status}`;
  }

  toast.error(errorMessage, {
    duration: DEFAULTS.TOAST_DURATION,
    id: `error-${Date.now()}`, // Đảm bảo mỗi toast có ID duy nhất
  });
};

/**
 * Hiển thị thông báo thành công bằng toast
 * @param message - Thông báo thành công
 */
export const showSuccessToast = (message: string): void => {
  toast.success(message, {
    duration: DEFAULTS.TOAST_DURATION,
    id: `success-${Date.now()}`,
  });
};

/**
 * Hiển thị thông báo cảnh báo bằng toast
 * @param message - Thông báo cảnh báo
 */
export const showWarningToast = (message: string): void => {
  toast.warning(message, {
    duration: DEFAULTS.TOAST_DURATION,
    id: `warning-${Date.now()}`,
  });
};

/**
 * Hiển thị thông báo thông tin bằng toast
 * @param message - Thông báo thông tin
 */
export const showInfoToast = (message: string): void => {
  toast.info(message, {
    duration: DEFAULTS.TOAST_DURATION,
    id: `info-${Date.now()}`,
  });
};

/**
 * Xử lý lỗi API và hiển thị thông báo lỗi phù hợp
 * @param error - Lỗi từ API
 * @returns Thông báo lỗi đã xử lý
 */
export const handleApiError = (error: any): string => {
  let errorMessage = "Đã xảy ra lỗi không xác định";

  if (error?.response) {
    // Lỗi có response từ server
    const status = error.response.status;
    const errorData = error.response.data;

    switch (status) {
      case 400:
        errorMessage =
          errorData?.error ||
          errorData?.message ||
          API_ERROR_MESSAGES.BAD_REQUEST;
        break;
      case 401:
        errorMessage =
          errorData?.error ||
          errorData?.message ||
          API_ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 403:
        errorMessage =
          errorData?.error ||
          errorData?.message ||
          API_ERROR_MESSAGES.FORBIDDEN;
        break;
      case 404:
        errorMessage =
          errorData?.error ||
          errorData?.message ||
          API_ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
        errorMessage =
          errorData?.error ||
          errorData?.message ||
          API_ERROR_MESSAGES.SERVER_ERROR;
        break;
      default:
        errorMessage =
          errorData?.error || errorData?.message || `Lỗi API: ${status}`;
    }
  } else if (error?.request) {
    // Yêu cầu đã được gửi nhưng không nhận được phản hồi
    errorMessage = API_ERROR_MESSAGES.NETWORK_ERROR;
  } else if (error instanceof Error) {
    // Lỗi JavaScript thông thường
    errorMessage = error.message;
  }

  // Hiển thị toast lỗi
  showErrorToast(errorMessage);

  return errorMessage;
};
