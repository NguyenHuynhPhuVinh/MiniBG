import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Kết hợp các lớp (className) với tailwind-merge và clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Lỗi khi format ngày tháng:", error);
    return "N/A";
  }
}
