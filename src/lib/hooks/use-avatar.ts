/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { avatarService } from "@/lib/services";
import {
  MyAvatarDataResponse,
  AvailableItemsResponse,
  UserCustomization,
  UserInventory,
  CollectionProgress,
  AvatarData,
  AvatarFrame,
  EquipItemRequest,
  ItemType,
} from "@/lib/types/avatar";

interface UseAvatarReturn {
  // Data
  myAvatarData: MyAvatarDataResponse["data"] | null;
  availableItems: AvailableItemsResponse["data"] | null;
  collectionProgress: CollectionProgress | null;

  // Loading states
  isLoading: boolean;
  isAvailableItemsLoading: boolean;
  isCollectionProgressLoading: boolean;
  isEquipping: boolean;

  // Error states
  error: string | null;
  availableItemsError: string | null;
  collectionProgressError: string | null;
  equipError: string | null;

  // Actions
  fetchMyAvatarData: () => Promise<void>;
  fetchAvailableItems: () => Promise<void>;
  fetchCollectionProgress: () => Promise<void>;
  equipItem: (request: EquipItemRequest) => Promise<boolean>;
  unequipFrame: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  invalidateCache: () => void;

  // Computed values
  equippedAvatar: AvatarData | null;
  equippedFrame: AvatarFrame | null;
  totalItems: number;
  completionRate: string;
  hasItems: boolean;

  // Additional utility methods
  hasItem: (itemType: "avatar" | "frame" | "emoji", itemId: number) => boolean;
  getRarityColor: (rarity: string) => string;
  getRarityDisplayName: (rarity: string) => string;
}

export const useAvatar = (): UseAvatarReturn => {
  // Data states
  const [myAvatarData, setMyAvatarData] = useState<
    MyAvatarDataResponse["data"] | null
  >(null);
  const [availableItems, setAvailableItems] = useState<
    AvailableItemsResponse["data"] | null
  >(null);
  const [collectionProgress, setCollectionProgress] =
    useState<CollectionProgress | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailableItemsLoading, setIsAvailableItemsLoading] = useState(false);
  const [isCollectionProgressLoading, setIsCollectionProgressLoading] =
    useState(false);
  const [isEquipping, setIsEquipping] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [availableItemsError, setAvailableItemsError] = useState<string | null>(
    null
  );
  const [collectionProgressError, setCollectionProgressError] = useState<
    string | null
  >(null);
  const [equipError, setEquipError] = useState<string | null>(null);

  // Cache management
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes TTL

  // Fetch my avatar data
  const fetchMyAvatarData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await avatarService.getMyAvatarData();
      console.log("🔍 [Avatar API] My Avatar Data Response:", data);
      console.log("🔍 [Avatar API] Customization:", data?.customization);
      console.log("🔍 [Avatar API] Inventory:", data?.inventory);
      setMyAvatarData(data);
      setLastFetchTime(Date.now());
    } catch (err: any) {
      const errorMessage = err.message || "Không thể tải dữ liệu avatar";
      setError(errorMessage);
      console.error("❌ [Avatar API] Error fetching my avatar data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch available items (sử dụng API mới)
  const fetchAvailableItems = useCallback(async () => {
    try {
      setIsAvailableItemsLoading(true);
      setAvailableItemsError(null);

      // Sử dụng method mới cho API structure mới
      const data = await avatarService.getAvailableItemsNew();
      console.log("🔍 [Avatar API] Available Items Response:", data);
      console.log("🔍 [Avatar API] Avatars (owned, locked):", data?.avatars);
      console.log("🔍 [Avatar API] Frames (owned, locked):", data?.frames);
      console.log("🔍 [Avatar API] Emojis (owned, locked):", data?.emojis);
      setAvailableItems(data as any); // Cast để tương thích với type hiện tại
    } catch (err: any) {
      const errorMessage = err.message || "Không thể tải danh sách items";
      setAvailableItemsError(errorMessage);
      console.error("❌ [Avatar API] Error fetching available items:", err);
    } finally {
      setIsAvailableItemsLoading(false);
    }
  }, []);

  // Fetch collection progress
  const fetchCollectionProgress = useCallback(async () => {
    try {
      setIsCollectionProgressLoading(true);
      setCollectionProgressError(null);

      const data = await avatarService.getCollectionProgress();
      setCollectionProgress(data);
    } catch (err: any) {
      const errorMessage = err.message || "Không thể tải tiến độ sưu tập";
      setCollectionProgressError(errorMessage);
      console.error("Error fetching collection progress:", err);
    } finally {
      setIsCollectionProgressLoading(false);
    }
  }, []);

  // Equip item
  const equipItem = useCallback(
    async (request: EquipItemRequest): Promise<boolean> => {
      try {
        setIsEquipping(true);
        setEquipError(null);

        const updatedCustomization = await avatarService.equipItem(request);

        // Update local state with new customization
        if (myAvatarData) {
          setMyAvatarData({
            ...myAvatarData,
            customization: updatedCustomization,
          });
        }

        // Invalidate cache to force refresh on next data fetch
        setLastFetchTime(0);

        return true;
      } catch (err: any) {
        const errorMessage = err.message || "Không thể trang bị item";
        setEquipError(errorMessage);
        console.error("Error equipping item:", err);
        return false;
      } finally {
        setIsEquipping(false);
      }
    },
    [myAvatarData]
  );

  // Unequip frame (only for frames, not avatars)
  const unequipFrame = useCallback(async (): Promise<boolean> => {
    try {
      setIsEquipping(true);
      setEquipError(null);

      const updatedCustomization = await avatarService.unequipFrame();

      // Update local state with new customization
      if (myAvatarData) {
        setMyAvatarData({
          ...myAvatarData,
          customization: updatedCustomization,
        });
      }

      // Invalidate cache to force refresh on next data fetch
      setLastFetchTime(0);

      return true;
    } catch (err: any) {
      const errorMessage = err.message || "Không thể bỏ trang bị frame";
      setEquipError(errorMessage);
      console.error("Error unequipping frame:", err);
      return false;
    } finally {
      setIsEquipping(false);
    }
  }, [myAvatarData]);

  // Refresh all data with caching
  const refreshData = useCallback(async () => {
    const now = Date.now();
    const shouldRefresh = now - lastFetchTime > CACHE_DURATION;

    if (shouldRefresh || lastFetchTime === 0) {
      await Promise.all([
        fetchMyAvatarData(),
        fetchAvailableItems(),
        fetchCollectionProgress(),
      ]);
    }
  }, [
    fetchMyAvatarData,
    fetchAvailableItems,
    fetchCollectionProgress,
    lastFetchTime,
    CACHE_DURATION,
  ]);

  // Invalidate cache manually
  const invalidateCache = useCallback(() => {
    setLastFetchTime(0);
  }, []);

  // Computed values
  const equippedAvatar = useMemo(() => {
    if (!myAvatarData?.customization || !myAvatarData?.inventory) return null;
    return avatarService.getEquippedAvatar(
      myAvatarData.customization,
      myAvatarData.inventory
    );
  }, [myAvatarData?.customization, myAvatarData?.inventory]);

  const equippedFrame = useMemo(() => {
    if (!myAvatarData?.customization || !myAvatarData?.inventory) return null;
    return avatarService.getEquippedFrame(
      myAvatarData.customization,
      myAvatarData.inventory
    );
  }, [myAvatarData?.customization, myAvatarData?.inventory]);

  const totalItems = useMemo(() => {
    if (!myAvatarData?.inventory) return 0;
    return (
      myAvatarData.inventory.avatars.length +
      myAvatarData.inventory.frames.length +
      myAvatarData.inventory.emojis.length
    );
  }, [myAvatarData?.inventory]);

  const completionRate = useMemo(() => {
    if (!myAvatarData?.statistics?.completion_rate) return "0%";
    return avatarService.formatCompletionRate(
      myAvatarData.statistics.completion_rate
    );
  }, [myAvatarData?.statistics?.completion_rate]);

  const hasItems = useMemo(() => {
    return totalItems > 0;
  }, [totalItems]);

  // Additional utility methods
  const hasItem = useCallback(
    (itemType: "avatar" | "frame" | "emoji", itemId: number): boolean => {
      if (!myAvatarData?.inventory) return false;
      return avatarService.hasItem(itemType, itemId, myAvatarData.inventory);
    },
    [myAvatarData?.inventory]
  );

  const getRarityColor = useCallback((rarity: string): string => {
    return avatarService.getRarityColor(rarity);
  }, []);

  const getRarityDisplayName = useCallback((rarity: string): string => {
    return avatarService.getRarityDisplayName(rarity);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchMyAvatarData();
    fetchAvailableItems();
    fetchCollectionProgress();
  }, [fetchMyAvatarData, fetchAvailableItems, fetchCollectionProgress]);

  return {
    // Data
    myAvatarData,
    availableItems,
    collectionProgress,

    // Loading states
    isLoading,
    isAvailableItemsLoading,
    isCollectionProgressLoading,
    isEquipping,

    // Error states
    error,
    availableItemsError,
    collectionProgressError,
    equipError,

    // Actions
    fetchMyAvatarData,
    fetchAvailableItems,
    fetchCollectionProgress,
    equipItem,
    unequipFrame,
    refreshData,
    invalidateCache,

    // Computed values
    equippedAvatar,
    equippedFrame,
    totalItems,
    completionRate,
    hasItems,

    // Additional utility methods
    hasItem,
    getRarityColor,
    getRarityDisplayName,
  };
};

export default useAvatar;
