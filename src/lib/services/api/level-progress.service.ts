import api from "./client";
import type { LevelProgressData } from "@/lib/types/level-progress";

class LevelProgressService {
  async getLevelProgressTracker(): Promise<LevelProgressData> {
    const res = await api.get("/level-progress/tracker");
    return res.data.data || res.data; // chấp nhận cả 2 shape
  }

  async claimAvatar(level: number): Promise<{ success: boolean; message?: string }> {
    const res = await api.post("/level-progress/claim-avatar", { level });
    return res.data;
  }
}

export const levelProgressService = new LevelProgressService();
export default levelProgressService;

