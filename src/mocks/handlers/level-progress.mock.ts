import tracker from "@/mocks/data/level-progress.tracker.mock.json" assert { type: "json" };
import type { LevelProgressData } from "@/lib/types/level-progress";

export const levelProgressMockHandlers = {
  async getLevelProgressTracker(): Promise<LevelProgressData> {
    return JSON.parse(JSON.stringify(tracker));
  },
  async claimAvatar(level: number): Promise<{ success: boolean; message?: string }> {
    // giả lập claim thành công nếu level có reward và chưa claim
    const node = (tracker.tiers as any[])
      .flatMap((t: any) => t.levels as any[])
      .find((l: any) => l.level === level && l.avatar_reward);
    if (!node) return { success: false, message: "Không có phần thưởng ở cấp này" };
    if (node.reward_claimed) return { success: false, message: "Đã nhận trước đó" };
    node.reward_claimed = true;
    return { success: true };
  },
};

