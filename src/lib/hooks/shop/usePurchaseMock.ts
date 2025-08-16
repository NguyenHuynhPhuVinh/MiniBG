"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import shopService from "@/lib/services/api/shop.service";
import { useCurrency } from "@/lib/hooks/use-currency";
import type { PurchaseApiResponse } from "@/lib/services/api/shop.service";
import type { CurrencyUpdateEvent } from "@/lib/types/currency";

/**
 * Purchase result interface
 */
export interface PurchaseResult {
  success: boolean;
  message: string;
  data?: {
    itemId: string;
    itemType: "avatars" | "frames" | "emojis";
    newBalance: number;
    owned: boolean;
  };
  error?: string;
}

/**
 * Purchase hook return type
 */
export interface UsePurchaseMockReturn {
  purchase: (
    itemType: "avatars" | "frames" | "emojis",
    itemId: string
  ) => Promise<PurchaseResult>;
  loading: boolean;
  error: string | null;
  ownedItems: Set<string>;
  isOwned: (itemId: string) => boolean;
  refreshOwnedItems: () => void;
}

/**
 * Hook để handle purchase logic với optimistic updates (chỉ mock, không persist)
 */
export function usePurchaseMock(): UsePurchaseMockReturn {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());

  // Currency hook cho optimistic updates
  const { balance, updateOptimistically } = useCurrency({
    enableOptimisticUpdates: true,
  });

  // Refs for cleanup
  const mountedRef = useRef(true);

  /**
   * Check if item is owned (chỉ trong session hiện tại)
   */
  const isOwned = useCallback(
    (itemId: string): boolean => {
      return ownedItems.has(itemId);
    },
    [ownedItems]
  );

  /**
   * Refresh owned items (reset về empty cho mock)
   */
  const refreshOwnedItems = useCallback(() => {
    setOwnedItems(new Set());
  }, []);

  /**
   * Purchase item với optimistic updates và rollback logic
   */
  const purchase = useCallback(
    async (
      itemType: "avatars" | "frames" | "emojis",
      itemId: string
    ): Promise<PurchaseResult> => {
      if (!mountedRef.current) {
        return {
          success: false,
          message: "Component unmounted",
          error: "UNMOUNTED",
        };
      }

      // Check if already owned
      if (isOwned(itemId)) {
        return {
          success: false,
          message: "Item already owned",
          error: "ALREADY_OWNED",
        };
      }

      setLoading(true);
      setError(null);

      // Store original state cho rollback
      const originalBalance = balance?.SYNC?.balance || 0;
      let optimisticUpdateApplied = false;

      try {
        // Call shop service purchase
        const response = await shopService.purchase(itemType, itemId);

        if (!mountedRef.current) {
          return {
            success: false,
            message: "Component unmounted",
            error: "UNMOUNTED",
          };
        }

        if (response.success && response.data) {
          // Apply optimistic currency update
          const currencyUpdate: CurrencyUpdateEvent = {
            type: "SYNC",
            amount: response.data.newBalance - originalBalance, // This will be negative
            operation: "spent",
            reason: `Shop purchase: ${itemType} ${itemId}`,
            timestamp: new Date().toISOString(),
          };

          updateOptimistically(currencyUpdate);
          optimisticUpdateApplied = true;

          // Mark item as owned (chỉ trong session)
          setOwnedItems((prev) => new Set([...prev, itemId]));

          return {
            success: true,
            message: response.message,
            data: response.data,
          };
        } else {
          return {
            success: false,
            message: response.message || "Purchase failed",
            error: response.error || "PURCHASE_FAILED",
          };
        }
      } catch (err) {
        if (!mountedRef.current) {
          return {
            success: false,
            message: "Component unmounted",
            error: "UNMOUNTED",
          };
        }

        // Rollback optimistic updates if applied
        if (optimisticUpdateApplied) {
          // Rollback currency (add back the spent amount)
          const rollbackUpdate: CurrencyUpdateEvent = {
            type: "SYNC",
            amount: originalBalance - (balance?.SYNC?.balance || 0),
            operation: "earned",
            reason: `Purchase rollback: ${itemType} ${itemId}`,
            timestamp: new Date().toISOString(),
          };
          updateOptimistically(rollbackUpdate);
        }

        const errorMessage =
          err instanceof Error ? err.message : "Purchase failed";
        setError(errorMessage);

        return {
          success: false,
          message: errorMessage,
          error: "PURCHASE_ERROR",
        };
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [balance, isOwned, updateOptimistically]
  );

  // Initialize empty owned items (mock only)
  useEffect(() => {
    setOwnedItems(new Set());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    purchase,
    loading,
    error,
    ownedItems,
    isOwned,
    refreshOwnedItems,
  };
}
