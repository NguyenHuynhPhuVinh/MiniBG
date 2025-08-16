"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import shopService from "@/lib/services/api/shop.service";
import type {
  ShopItem,
  ShopApiResponse,
} from "@/lib/services/api/shop.service";

/**
 * Shop inventory hook options
 */
interface UseShopInventoryOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

/**
 * Shop inventory hook return type
 */
export interface UseShopInventoryReturn {
  avatars: ShopItem[];
  frames: ShopItem[];
  emojis: ShopItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Hook để quản lý shop inventory data
 * Fetch và cache dữ liệu từ shop service với error handling và loading states
 */
export function useShopInventory(
  options: UseShopInventoryOptions = {}
): UseShopInventoryReturn {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  // State management
  const [avatars, setAvatars] = useState<ShopItem[]>([]);
  const [frames, setFrames] = useState<ShopItem[]>([]);
  const [emojis, setEmojis] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch shop data từ service
   */
  const fetchShopData = useCallback(async () => {
    // Create new abort controller for this fetch
    abortControllerRef.current = new AbortController();

    try {
      console.log("fetchShopData: Starting fetch...");
      setLoading(true);
      setError(null);

      // Fetch tất cả shop data song song
      console.log("fetchShopData: Calling shop services...");
      const [avatarsResponse, framesResponse, emojisResponse] =
        await Promise.all([
          shopService.getAvatars(),
          shopService.getFrames(),
          shopService.getEmojis(),
        ]);
      console.log("fetchShopData: Responses received:", {
        avatarsResponse,
        framesResponse,
        emojisResponse,
      });

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log(
          "fetchShopData: Request was aborted, skipping state update"
        );
        return;
      }

      console.log("fetchShopData: Request not aborted, updating state...");

      // Cập nhật state với data từ response
      if (avatarsResponse.success) {
        console.log("Avatars loaded:", avatarsResponse.data);
        setAvatars(avatarsResponse.data);
      }
      if (framesResponse.success) {
        console.log("Frames loaded:", framesResponse.data);
        setFrames(framesResponse.data);
      }
      if (emojisResponse.success) {
        console.log("Emojis loaded:", emojisResponse.data);
        setEmojis(emojisResponse.data);
      }

      setLastUpdated(new Date());
      console.log("fetchShopData: State updated successfully");
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log("fetchShopData: Request was aborted in catch block");
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch shop data";
      setError(errorMessage);
      console.error("Error fetching shop inventory:", err);
    } finally {
      // Always set loading to false unless aborted
      if (!abortControllerRef.current?.signal.aborted) {
        console.log("fetchShopData: Setting loading to false");
        setLoading(false);
      } else {
        console.log(
          "fetchShopData: Request aborted, not setting loading to false"
        );
      }
    }
  }, []);

  /**
   * Refresh shop data manually
   */
  const refresh = useCallback(async () => {
    await fetchShopData();
  }, [fetchShopData]);

  // Initial data fetch
  useEffect(() => {
    console.log("useShopInventory: Starting initial fetch...");
    fetchShopData();
  }, []); // Empty dependency array - chỉ chạy một lần khi mount

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchShopData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [autoRefresh, refreshInterval]); // Loại bỏ fetchShopData để tránh infinite loop

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    avatars,
    frames,
    emojis,
    loading,
    error,
    refresh,
    lastUpdated,
  };
}
