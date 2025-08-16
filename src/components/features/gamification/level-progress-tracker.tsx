"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Check, Lock, Gift } from "lucide-react";
import { levelProgressService } from "@/lib/services/api/level-progress.service";
import type { LevelProgressData } from "@/lib/types/level-progress";
import { cn } from "@/lib/utils";
import { getVietnameseTierName } from "@/lib/utils/tier-assets";

interface LevelProgressTrackerProps {
  className?: string;
}

export const LevelProgressTracker: React.FC<LevelProgressTrackerProps> = ({
  className,
}) => {
  const [data, setData] = useState<LevelProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTierIndex, setActiveTierIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await levelProgressService.getLevelProgressTracker();
        setData(res);
        const idx = res.tiers.findIndex(
          (t) => t.tier_name.toLowerCase() === res.current_tier.toLowerCase()
        );
        setActiveTierIndex(idx >= 0 ? idx : 0);
      } catch (e) {
        setError("Không thể tải tiến trình cấp độ");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentTier = useMemo(
    () => (data ? data.tiers[activeTierIndex] : null),
    [data, activeTierIndex]
  );

  // Tính toán tiến trình của tier hiện tại
  const tierProgress = useMemo(() => {
    if (!currentTier || !data) return { completed: 0, total: 0, percentage: 0 };

    const completed = currentTier.levels.filter(
      (level) => level.is_unlocked
    ).length;
    const total = currentTier.levels.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }, [currentTier, data]);

  // Tính toán XP progress cho level hiện tại (simplified version)
  const getCurrentLevelProgress = () => {
    if (!data || !currentTier) return null;

    const currentLevel = currentTier.levels.find((l) => l.is_current);
    if (!currentLevel) return null;

    // Giả sử progress dựa trên vị trí trong tier (demo purpose)
    const currentLevelIndex = currentTier.levels.findIndex((l) => l.is_current);
    const totalLevelsInTier = currentTier.levels.length;
    const percentage =
      currentLevelIndex >= 0
        ? ((currentLevelIndex + 0.7) / totalLevelsInTier) * 100
        : 0;

    return {
      percentage: Math.min(percentage, 100),
      currentLevel: currentLevel.level,
      requiredXP: currentLevel.xp_required,
    };
  };

  // Helper function để Việt hóa description
  const vietnamizeDescription = (description: string): string => {
    return description
      .replace(/tier Silver/gi, `tier ${getVietnameseTierName("Silver")}`)
      .replace(/tier Bronze/gi, `tier ${getVietnameseTierName("Bronze")}`)
      .replace(/tier Wood/gi, `tier ${getVietnameseTierName("Wood")}`)
      .replace(/tier Gold/gi, `tier ${getVietnameseTierName("Gold")}`)
      .replace(/tier Platinum/gi, `tier ${getVietnameseTierName("Platinum")}`)
      .replace(/tier Onyx/gi, `tier ${getVietnameseTierName("Onyx")}`)
      .replace(/tier Sapphire/gi, `tier ${getVietnameseTierName("Sapphire")}`)
      .replace(/tier Ruby/gi, `tier ${getVietnameseTierName("Ruby")}`)
      .replace(/tier Amethyst/gi, `tier ${getVietnameseTierName("Amethyst")}`)
      .replace(/tier Master/gi, `tier ${getVietnameseTierName("Master")}`);
  };

  const handlePrevTier = () => {
    setActiveTierIndex((i) => Math.max(0, i - 1));
  };
  const handleNextTier = () => {
    if (!data) return;
    setActiveTierIndex((i) => Math.min(data.tiers.length - 1, i + 1));
  };

  const claimReward = async (level: number) => {
    try {
      await levelProgressService.claimAvatar(level);
      setData((prev) => {
        if (!prev) return prev;
        const clone: LevelProgressData = JSON.parse(JSON.stringify(prev));
        for (const tier of clone.tiers) {
          const node = tier.levels.find((l) => l.level === level);
          if (node && node.avatar_reward) {
            node.reward_claimed = true;
            if (!clone.user_avatars.includes(node.avatar_reward.avatar)) {
              clone.user_avatars.push(node.avatar_reward.avatar);
            }
            break;
          }
        }
        return clone;
      });
    } catch (e) {
      // ignore for mock demo
    }
  };

  if (loading)
    return <div className={cn("p-4", className)}>Đang tải tiến trình...</div>;
  if (error)
    return <div className={cn("p-4 text-red-600", className)}>{error}</div>;
  if (!data || !currentTier) return null;

  const levelProgress = getCurrentLevelProgress();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header with tier navigation */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevTier}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={activeTierIndex === 0}
          >
            <ChevronUp className="w-4 h-4" />
            Bậc trước
          </button>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Bậc {getVietnameseTierName(currentTier.tier_name)}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Cấp {currentTier.min_level} - {currentTier.max_level}
            </p>
          </div>

          <button
            onClick={handleNextTier}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={activeTierIndex >= data.tiers.length - 1}
          >
            Bậc kế
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Tier Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tiến trình bậc
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {tierProgress.completed}/{tierProgress.total} cấp
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${tierProgress.percentage}%` }}
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {Math.round(tierProgress.percentage)}% hoàn thành
          </div>
        </div>
      </div>

      {/* Level Progress List */}
      <div className="space-y-4">
        {currentTier.levels.map((node) => (
          <div
            key={node.level}
            className={cn(
              "relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors",
              node.is_current &&
                "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20"
            )}
          >
            {/* Level Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Status Indicator - Simplified */}
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      node.is_current
                        ? "bg-blue-500 border-blue-500"
                        : node.is_unlocked && !node.is_current
                        ? "bg-green-500 border-green-500"
                        : "bg-slate-300 dark:bg-slate-600 border-slate-300 dark:border-slate-600"
                    )}
                  >
                    {/* Chỉ hiển thị icon cho level đã hoàn thành */}
                    {node.is_unlocked && !node.is_current && (
                      <Check className="w-2.5 h-2.5 text-white" />
                    )}
                    {!node.is_unlocked && (
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Cấp {node.level}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {node.xp_required.toLocaleString()} XP cần thiết
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge - Simplified */}
              <div className="flex items-center gap-2">
                {node.is_current && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                    Đang học
                  </span>
                )}
                {node.is_unlocked && !node.is_current && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                    Hoàn thành
                  </span>
                )}
                {!node.is_unlocked && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                    Chưa mở khóa
                  </span>
                )}
              </div>
            </div>

            {/* Current Level Progress Bar */}
            {node.is_current && levelProgress && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Tiến trình hiện tại
                  </span>
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    {Math.round(levelProgress.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${levelProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Avatar Reward */}
            {node.avatar_reward && (
              <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={node.avatar_reward.avatar_path}
                      alt={node.avatar_reward.avatar_name}
                      className={cn(
                        "w-12 h-12 rounded-lg object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600",
                        !node.is_unlocked && "opacity-50 grayscale"
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {node.avatar_reward.avatar_name}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {node.avatar_reward.description
                        .replace(
                          /tier Silver/gi,
                          `bậc ${getVietnameseTierName("Silver")}`
                        )
                        .replace(
                          /tier Bronze/gi,
                          `bậc ${getVietnameseTierName("Bronze")}`
                        )
                        .replace(
                          /tier Wood/gi,
                          `bậc ${getVietnameseTierName("Wood")}`
                        )
                        .replace(
                          /tier Gold/gi,
                          `bậc ${getVietnameseTierName("Gold")}`
                        )
                        .replace(
                          /tier Platinum/gi,
                          `bậc ${getVietnameseTierName("Platinum")}`
                        )
                        .replace(
                          /tier Onyx/gi,
                          `bậc ${getVietnameseTierName("Onyx")}`
                        )
                        .replace(
                          /tier Sapphire/gi,
                          `bậc ${getVietnameseTierName("Sapphire")}`
                        )
                        .replace(
                          /tier Ruby/gi,
                          `bậc ${getVietnameseTierName("Ruby")}`
                        )
                        .replace(
                          /tier Amethyst/gi,
                          `bậc ${getVietnameseTierName("Amethyst")}`
                        )
                        .replace(
                          /tier Master/gi,
                          `bậc ${getVietnameseTierName("Master")}`
                        )}
                    </p>
                  </div>

                  <div className="flex items-center">
                    {/* Logic sửa: Chỉ cho nhận khi đã hoàn thành level (is_unlocked && !is_current) */}
                    {node.is_unlocked && !node.is_current ? (
                      node.reward_claimed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                          <Check className="w-3 h-3" />
                          Đã nhận
                        </span>
                      ) : (
                        <button
                          onClick={() => claimReward(node.level)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors"
                        >
                          <Gift className="w-4 h-4" />
                          Nhận thưởng
                        </button>
                      )
                    ) : node.is_current ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                        Hoàn thành cấp để nhận
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                        <Lock className="w-3 h-3" />
                        Chưa khả dụng
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelProgressTracker;
