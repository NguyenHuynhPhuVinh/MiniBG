import type { UserLevelProgress, TierInfo } from "@/lib/types/gamification";
import levelProgress from "@/mocks/data/gamification.level-progress.mock.json" assert { type: "json" };
import tiersData from "@/mocks/data/gamification.tiers.mock.json" assert { type: "json" };

export const gamificationMockHandlers = {
  async getMyLevelProgress(): Promise<UserLevelProgress> {
    return JSON.parse(JSON.stringify(levelProgress));
  },

  async getAllTiers(): Promise<TierInfo[]> {
    return JSON.parse(JSON.stringify(tiersData));
  },
};
