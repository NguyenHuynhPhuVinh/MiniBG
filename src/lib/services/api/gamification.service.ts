/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./client";
import {
  UserGamificationInfo,
  LeaderboardEntry,
  GamificationStats,
  AddPointsRequest,
  UserLevelProgress,
  UserLevelProgressResponse,
  TierInfo,
  TierInfoResponse,
} from "../../types/gamification";

class GamificationService {
  /**
   * Lấy thông tin gamification của user hiện tại
   */
  async getCurrentUserGamification(): Promise<UserGamificationInfo> {
    const response = await api.get("/gamification/me");
    return response.data.data;
  }

  /**
   * Lấy bảng xếp hạng
   */
  async getLeaderboard(
    limit: number = 10,
    timeframe: string = "all"
  ): Promise<LeaderboardEntry[]> {
    const response = await api.get("/gamification/leaderboard", {
      params: { limit, timeframe },
    });
    return response.data.data.leaderboard;
  }

  /**
   * Lấy thông tin gamification của user khác (Admin/Teacher only)
   */
  async getUserGamificationById(userId: number): Promise<UserGamificationInfo> {
    const response = await api.get(`/gamification/user/${userId}`);
    return response.data.data;
  }

  /**
   * Thêm điểm thủ công (Admin only)
   */
  async addPointsManually(data: AddPointsRequest): Promise<any> {
    const response = await api.post("/gamification/add-points", data);
    return response.data.data;
  }

  /**
   * Lấy thống kê tổng quan gamification (Admin only)
   */
  async getGamificationStats(): Promise<GamificationStats> {
    const response = await api.get("/gamification/stats");
    return response.data.data;
  }

  // NEW API METHODS FOR TIER SYSTEM

  /**
   * Lấy thông tin level progress của user hiện tại với tier system
   */
  async getMyLevelProgress(): Promise<UserLevelProgress> {
    const response: UserLevelProgressResponse = await api.get(
      "/gamification-level/my-progress"
    );
    return response.data;
  }

  /**
   * Lấy thông tin tất cả các tiers
   */
  async getAllTiers(): Promise<TierInfo[]> {
    const response: TierInfoResponse = await api.get(
      "/gamification-level/tiers"
    );
    return response.data.tiers;
  }

  /**
   * Tính toán level từ total points
   * @param totalPoints - Tổng điểm của user
   * @returns Level hiện tại (tối thiểu là 1)
   */
  calculateLevel(totalPoints: number | undefined | null): number {
    if (!totalPoints || totalPoints < 0) {
      return 1;
    }
    return Math.floor(totalPoints / 100) + 1;
  }

  /**
   * Tính toán experience points trong level hiện tại
   * @param totalPoints - Tổng điểm của user
   * @returns XP trong level hiện tại (0-99)
   */
  calculateExperienceInLevel(totalPoints: number | undefined | null): number {
    if (!totalPoints || totalPoints < 0) {
      return 0;
    }
    return totalPoints % 100;
  }

  /**
   * Tính toán phần trăm progress trong level
   * @param experiencePoints - XP trong level hiện tại
   * @returns Phần trăm progress (0-100)
   */
  calculateLevelProgress(experiencePoints: number | undefined | null): number {
    if (!experiencePoints || experiencePoints < 0) {
      return 0;
    }
    return Math.min(100, (experiencePoints / 100) * 100);
  }

  /**
   * Loại bỏ cơ chế level name theo yêu cầu — luôn trả rỗng
   */
  getLevelName(_level: number): string {
    return "";
  }

  /**
   * Lấy màu sắc cho level (giữ nguyên để dùng cho UI nếu cần)
   */
  getLevelColor(level: number): string {
    const colors = [
      "#9CA3AF", // Gray - Người mới
      "#10B981", // Green - Học viên tập sự
      "#3B82F6", // Blue - Học viên
      "#8B5CF6", // Purple - Học viên giỏi
      "#F59E0B", // Yellow - Chuyên gia nhỏ
      "#EF4444", // Red - Chuyên gia
      "#EC4899", // Pink - Thạc sĩ
      "#6366F1", // Indigo - Tiến sĩ
      "#F97316", // Orange - Giáo sư
      "#FBBF24", // Gold - Huyền thoại
    ];

    if (level <= 10) {
      return colors[level - 1] || "#FBBF24";
    }

    return "#FBBF24"; // Gold cho tất cả huyền thoại
  }

  /**
   * Format điểm số với dấu phẩy
   * @param points - Số điểm cần format
   * @returns Chuỗi điểm đã format hoặc "0" nếu invalid
   */
  formatPoints(points: number | undefined | null): string {
    if (points === undefined || points === null || isNaN(points)) {
      return "0";
    }
    return points.toLocaleString("vi-VN");
  }

  /**
   * Format thời gian response
   * @param milliseconds - Thời gian tính bằng milliseconds
   * @returns Chuỗi thời gian đã format
   */
  formatResponseTime(milliseconds: number | undefined | null): string {
    if (
      milliseconds === undefined ||
      milliseconds === null ||
      isNaN(milliseconds) ||
      milliseconds < 0
    ) {
      return "0ms";
    }
    if (milliseconds < 1000) {
      return `${Math.round(milliseconds)}ms`;
    }
    return `${(milliseconds / 1000).toFixed(1)}s`;
  }

  /**
   * Tính accuracy rate
   * @param correct - Số câu trả lời đúng
   * @param total - Tổng số câu hỏi
   * @returns Tỷ lệ chính xác (0-100)
   */
  calculateAccuracyRate(
    correct: number | undefined | null,
    total: number | undefined | null
  ): number {
    if (!correct || !total || total === 0 || correct < 0 || total < 0) {
      return 0;
    }
    const rate = (correct / total) * 100;
    return Math.round(Math.min(100, Math.max(0, rate))); // Ensure 0-100 range
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;
