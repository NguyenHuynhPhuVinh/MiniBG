/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  gamificationService,
  UserGamificationInfo,
  LeaderboardEntry,
} from "@/lib/services";
import { UserLevelProgress, TierInfo } from "@/lib/types/gamification";
import { getTierIconFromLevel } from "@/lib/utils/tier-assets";
import {
  handleGamificationApiError,
  logGamificationError,
} from "@/lib/utils/error-handling";

interface UseGamificationReturn {
  // Data
  userGamification: UserGamificationInfo | null;
  userLevelProgress: UserLevelProgress | null;
  tiers: TierInfo[];
  leaderboard: LeaderboardEntry[];

  // Loading states
  isLoading: boolean;
  isLeaderboardLoading: boolean;
  isTierDataLoading: boolean;

  // Error states
  error: string | null;
  leaderboardError: string | null;
  tierDataError: string | null;

  // Actions
  fetchUserGamification: () => Promise<void>;
  fetchLeaderboard: (limit?: number, timeframe?: string) => Promise<void>;
  fetchTierData: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Computed values
  levelProgress: number;
  levelName: string;
  levelColor: string;
  formattedPoints: string;
  accuracyRate: number;
  tierIcon: string;
  tierInfo: { tierName: string; levelInTier: number } | null;
}

export const useGamification = (): UseGamificationReturn => {
  // Existing states
  const [userGamification, setUserGamification] =
    useState<UserGamificationInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // New states for tier system
  const [userLevelProgress, setUserLevelProgress] =
    useState<UserLevelProgress | null>(null);
  const [tiers, setTiers] = useState<TierInfo[]>([]);
  const [isTierDataLoading, setIsTierDataLoading] = useState(false);
  const [tierDataError, setTierDataError] = useState<string | null>(null);

  // Cache timestamps for data freshness
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Fetch user gamification data with new API and fallback
  const fetchUserGamification = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try new API first
      try {
        const levelProgressData =
          await gamificationService.getMyLevelProgress();
        setUserLevelProgress(levelProgressData);

        // Transform new API response to maintain backward compatibility
        const transformedData: UserGamificationInfo = {
          user_id: levelProgressData.user_id,
          name: levelProgressData.name,
          total_points: levelProgressData.total_points,
          current_level: levelProgressData.current_level,
          experience_points: levelProgressData.experience_points,
          experience_to_next_level: levelProgressData.experience_to_next_level,
          tier_info: levelProgressData.tier_info,
          next_level_info: levelProgressData.next_level_info,
          stats: levelProgressData.stats,
        };
        setUserGamification(transformedData);
      } catch (newApiError) {
        console.warn("New API failed, falling back to old API:", newApiError);
        // Fallback to old API
        const data = await gamificationService.getCurrentUserGamification();
        setUserGamification(data);
      }

      setLastFetchTime(Date.now());
    } catch (err: any) {
      const gamificationError = handleGamificationApiError(
        err,
        "fetchUserGamification"
      );
      setError(gamificationError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(
    async (limit: number = 10, timeframe: string = "all") => {
      try {
        setIsLeaderboardLoading(true);
        setLeaderboardError(null);

        const data = await gamificationService.getLeaderboard(limit, timeframe);
        setLeaderboard(data);
      } catch (err: any) {
        const gamificationError = handleGamificationApiError(
          err,
          "fetchLeaderboard"
        );
        setLeaderboardError(gamificationError.message);
      } finally {
        setIsLeaderboardLoading(false);
      }
    },
    []
  );

  // Fetch tier data (tiers only)
  const fetchTierData = useCallback(async () => {
    try {
      setIsTierDataLoading(true);
      setTierDataError(null);

      const tiersData = await gamificationService.getAllTiers();
      setTiers(tiersData);
    } catch (err: any) {
      const gamificationError = handleGamificationApiError(
        err,
        "fetchTierData"
      );
      setTierDataError(gamificationError.message);
    } finally {
      setIsTierDataLoading(false);
    }
  }, []);

  // Refresh all data with caching
  const refreshData = useCallback(async () => {
    const now = Date.now();
    const shouldRefresh = now - lastFetchTime > CACHE_DURATION;

    if (shouldRefresh) {
      await Promise.all([
        fetchUserGamification(),
        fetchLeaderboard(),
        fetchTierData(),
      ]);
    }
  }, [
    fetchUserGamification,
    fetchLeaderboard,
    fetchTierData,
    lastFetchTime,
    CACHE_DURATION,
  ]);

  // Computed values with defensive programming
  const levelProgress =
    userGamification?.experience_points !== undefined
      ? gamificationService.calculateLevelProgress(
          userGamification.experience_points
        )
      : 0;

  const levelName =
    userGamification?.current_level !== undefined
      ? gamificationService.getLevelName(userGamification.current_level)
      : "";

  const levelColor =
    userGamification?.current_level !== undefined
      ? gamificationService.getLevelColor(userGamification.current_level)
      : "#9CA3AF";

  const formattedPoints =
    userGamification?.total_points !== undefined
      ? gamificationService.formatPoints(userGamification.total_points)
      : "0";

  const accuracyRate = userGamification?.stats
    ? gamificationService.calculateAccuracyRate(
        userGamification.stats.total_correct_answers,
        userGamification.stats.total_questions_answered
      )
    : 0;

  // New computed values for tier system with defensive programming
  const tierIcon = useMemo(() => {
    const level = userGamification?.current_level;
    if (level !== undefined && level > 0) {
      return getTierIconFromLevel(level);
    }
    return getTierIconFromLevel(1); // Default to level 1 icon
  }, [userGamification?.current_level]);

  const tierInfo = useMemo(() => {
    if (
      userLevelProgress?.tier_info?.tier_name &&
      userLevelProgress?.current_level !== undefined
    ) {
      // Calculate level within tier from tier info
      const tierName = userLevelProgress.tier_info.tier_name;
      const currentLevel = userLevelProgress.current_level;

      // Find tier range to calculate level within tier
      const tierRanges: Record<string, { min: number; max: number }> = {
        wood: { min: 1, max: 12 },
        bronze: { min: 13, max: 24 },
        silver: { min: 25, max: 36 },
        gold: { min: 37, max: 48 },
        platinum: { min: 49, max: 60 },
        onyx: { min: 61, max: 72 },
        sapphire: { min: 73, max: 84 },
        ruby: { min: 85, max: 96 },
        amethyst: { min: 97, max: 108 },
        master: { min: 109, max: 120 },
      };

      const tierRange = tierRanges[tierName.toLowerCase()];
      const levelInTier =
        tierRange && currentLevel >= tierRange.min
          ? currentLevel - tierRange.min + 1
          : 1;

      return {
        tierName,
        levelInTier: Math.max(1, Math.min(12, levelInTier)),
      };
    }
    return null;
  }, [
    userLevelProgress?.tier_info?.tier_name,
    userLevelProgress?.current_level,
  ]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchUserGamification();
    fetchLeaderboard();
    fetchTierData();
  }, [fetchUserGamification, fetchLeaderboard, fetchTierData]);

  return {
    // Data
    userGamification,
    userLevelProgress,
    tiers,
    leaderboard,

    // Loading states
    isLoading,
    isLeaderboardLoading,
    isTierDataLoading,

    // Error states
    error,
    leaderboardError,
    tierDataError,

    // Actions
    fetchUserGamification,
    fetchLeaderboard,
    fetchTierData,
    refreshData,

    // Computed values
    levelProgress,
    levelName,
    levelColor,
    formattedPoints,
    accuracyRate,
    tierIcon,
    tierInfo,
  };
};

// Hook for admin gamification stats
interface UseGamificationStatsReturn {
  stats: any;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useGamificationStats = (): UseGamificationStatsReturn => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await gamificationService.getGamificationStats();
      setStats(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Không thể tải thống kê gamification";
      setError(errorMessage);
      console.error("Error fetching gamification stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
};

export default useGamification;
