"use client";

import React, { useEffect } from "react";
import { Progress } from "@/components/ui/feedback";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/feedback";
import { useGamification } from "@/lib/hooks/use-gamification";
import { cn } from "@/lib/utils";
import {
  getTierIconFromLevel,
  getTierInfo,
  preloadTierIcon,
  preloadCommonTierIcons,
  getVietnameseTierName,
  toRomanNumeral,
} from "@/lib/utils/tier-assets";
import { TierIcon } from "@/lib/hooks/use-tier-icon";

interface UserLevelBadgeProps {
  variant?: "default" | "compact" | "detailed";
  showProgress?: boolean;
  showPoints?: boolean;
  className?: string;
}

export const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({
  variant = "default",
  showProgress = true,
  showPoints = true,
  className,
}) => {
  const {
    userGamification,
    userLevelProgress,
    isLoading,
    levelProgress,
    levelName,
    formattedPoints,
    tierIcon,
    tierInfo,
  } = useGamification();

  // Get tier information for current level (moved before early returns)
  const currentLevel = userGamification?.current_level || 1;
  const currentTierInfo = getTierInfo(currentLevel);
  const tierIconPath = getTierIconFromLevel(currentLevel);

  // Get tier name from userLevelProgress or fallback to calculated tier
  const tierName =
    userLevelProgress?.tier_info?.tier_name || currentTierInfo.tierName;
  const levelInTier =
    userLevelProgress?.tier_info?.level_in_tier || currentTierInfo.levelInTier;

  // Memoized preload dependencies to prevent unnecessary re-renders
  const preloadDeps = React.useMemo(
    () => ({
      currentIconPath: tierIconPath,
      nextLevelIcon: userLevelProgress?.next_level_info?.level
        ? getTierIconFromLevel(userLevelProgress.next_level_info.level)
        : null,
    }),
    [tierIconPath, userLevelProgress?.next_level_info?.level]
  );

  // Memoized tier icon component for performance (moved before early returns)
  const getTierIcon = React.useCallback(
    (level: number, size: "sm" | "md" | "lg" = "sm") => {
      return (
        <TierIcon
          level={level}
          size={size}
          tierName={tierName}
          levelInTier={levelInTier}
        />
      );
    },
    [tierName, levelInTier]
  );

  // Preload tier icons for performance (moved before early returns)
  useEffect(() => {
    const preloadImages = async () => {
      try {
        // Preload current tier icon
        await preloadTierIcon(preloadDeps.currentIconPath);

        // Preload next level icon if available
        if (preloadDeps.nextLevelIcon) {
          await preloadTierIcon(preloadDeps.nextLevelIcon);
        }

        // Preload common tier icons for better performance
        await preloadCommonTierIcons();
      } catch (error) {
        console.warn("Failed to preload some tier icons:", error);
      }
    };

    preloadImages();
  }, [preloadDeps.currentIconPath, preloadDeps.nextLevelIcon]);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-6 bg-gray-200 rounded-md w-20"></div>
      </div>
    );
  }

  if (!userGamification) {
    return null;
  }

  // Get tier color based on tier name
  const getTierColor = (tierName: string) => {
    const tierColors: Record<string, string> = {
      wood: "text-amber-700",
      bronze: "text-orange-600",
      silver: "text-gray-500",
      gold: "text-yellow-500",
      platinum: "text-slate-400",
      onyx: "text-gray-800",
      sapphire: "text-blue-500",
      ruby: "text-red-500",
      amethyst: "text-purple-500",
      master: "text-gradient-to-r from-purple-500 to-pink-500",
    };
    return tierColors[tierName.toLowerCase()] || "text-slate-600";
  };

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-border cursor-pointer",
                className
              )}
            >
              {getTierIcon(currentLevel, "sm")}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  Lv.{currentLevel}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium truncate",
                    getTierColor(tierName)
                  )}
                >
                  {getVietnameseTierName(tierName)}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getTierIcon(currentLevel, "md")}
                <div>
                  <p className="font-semibold text-sm">
                    Hạng {getVietnameseTierName(tierName)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cấp {levelInTier}/12 trong hạng
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {formattedPoints} Điểm kiến thức
                </p>
                <p className="text-xs text-muted-foreground">
                  {userGamification?.experience_points || 0} XP hiện tại
                </p>
                {userLevelProgress?.next_level_info && (
                  <p className="text-xs text-muted-foreground">
                    Cần {userLevelProgress.next_level_info.xp_required} XP để
                    lên level {userLevelProgress.next_level_info.level}
                  </p>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={cn("p-6 rounded-xl border-2 border-border", className)}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div
              className={cn(
                "w-24 h-24 rounded-xl border-2 flex items-center justify-center",
                "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-1"
              )}
            >
              {getTierIcon(currentLevel, "lg")}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Hạng {getVietnameseTierName(tierName)}{" "}
                  <span
                    className={cn(
                      "text-base align-baseline",
                      getTierColor(tierName)
                    )}
                  >
                    {toRomanNumeral(levelInTier)}
                  </span>
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Cấp độ {currentLevel}
              </p>
              {userLevelProgress?.next_level_info && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tiếp theo: Hạng{" "}
                  {getVietnameseTierName(
                    userLevelProgress.next_level_info.tier_name
                  )}{" "}
                  <span className="font-medium">
                    {toRomanNumeral(
                      (userLevelProgress.tier_info?.level_in_tier ||
                        levelInTier) + 1
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>
          {showPoints && (
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formattedPoints}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Điểm kiến thức
              </p>
            </div>
          )}
        </div>

        {/* Progress Section */}
        {showProgress && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tiến độ trong hạng
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {userLevelProgress?.tier_info?.xp_in_tier ||
                  userGamification?.experience_points ||
                  0}
                /{userLevelProgress?.tier_info?.xp_required_for_tier || 100} XP
              </span>
            </div>
            <div className="space-y-2">
              <Progress
                value={
                  userLevelProgress?.tier_info
                    ? (userLevelProgress.tier_info.xp_in_tier /
                        userLevelProgress.tier_info.xp_required_for_tier) *
                      100
                    : levelProgress
                }
                className="h-3 bg-slate-200 dark:bg-slate-700"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Cấp {levelInTier}/12 trong hạng{" "}
                  {getVietnameseTierName(tierName)}
                </span>
                {userLevelProgress?.next_level_info && (
                  <span>
                    Cần {userLevelProgress.next_level_info.xp_required} XP để
                    lên level {userLevelProgress.next_level_info.level}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {userGamification?.stats?.total_correct_answers || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Câu đúng
            </p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {userGamification?.stats?.best_streak || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Streak tốt nhất
            </p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {userGamification?.stats?.perfect_scores || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Điểm tuyệt đối
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-4",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border",
          "min-w-0 flex-shrink-0"
        )}
      >
        {getTierIcon(currentLevel, "sm")}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            Lv.{currentLevel}
          </span>
          <span
            className={cn(
              "text-xs font-medium truncate",
              getTierColor(tierName)
            )}
          >
            {getVietnameseTierName(tierName)}
          </span>
        </div>
      </div>

      {showPoints && (
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formattedPoints}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            điểm
          </span>
        </div>
      )}

      {showProgress && (
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Hạng {getVietnameseTierName(tierName)} • {levelName}
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {userLevelProgress?.tier_info?.xp_in_tier ||
                userGamification?.experience_points ||
                0}
              /{userLevelProgress?.tier_info?.xp_required_for_tier || 100} XP
            </span>
          </div>
          <Progress
            value={
              userLevelProgress?.tier_info
                ? (userLevelProgress.tier_info.xp_in_tier /
                    userLevelProgress.tier_info.xp_required_for_tier) *
                  100
                : levelProgress
            }
            className="h-2 bg-slate-200 dark:bg-slate-700"
          />
        </div>
      )}
    </div>
  );
};

export default UserLevelBadge;
