"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { currencyService } from "@/lib/services/api/currency.service";
import type {
  CurrencyBalance,
  CurrencyError,
  CurrencyUpdateEvent,
} from "@/lib/types/currency";

interface UseCurrencyOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableOptimisticUpdates?: boolean;
}

interface UseCurrencyReturn {
  balance: CurrencyBalance | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  updateOptimistically: (event: CurrencyUpdateEvent) => void;
  isStale: boolean;
}

/**
 * Custom hook for managing currency data
 * Features:
 * - Auto-refresh every 30 seconds (configurable)
 * - Optimistic updates
 * - Error handling and loading states
 * - Cache management
 */
export function useCurrency(
  options: UseCurrencyOptions = {}
): UseCurrencyReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableOptimisticUpdates = true,
  } = options;

  const [balance, setBalance] = useState<CurrencyBalance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);

  /**
   * Fetch currency balance from API
   */
  const fetchBalance = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!mountedRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const response = await currencyService.getCurrencyBalance(forceRefresh);

        if (!mountedRef.current) return;

        if (response.success && response.data) {
          setBalance(response.data);
          setLastUpdated(new Date());
          setIsStale(false);
        } else {
          throw new Error(
            response.message || "Failed to fetch currency balance"
          );
        }
      } catch (err) {
        if (!mountedRef.current) return;

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Currency fetch error:", err);

        // Mark data as stale if we have cached data
        setIsStale(true);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [] // Loại bỏ balance dependency để tránh infinite loop
  );

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchBalance(true);
  }, [fetchBalance]);

  /**
   * Optimistic update for currency changes
   */
  const updateOptimistically = useCallback(
    (event: CurrencyUpdateEvent) => {
      if (!enableOptimisticUpdates || !balance) return;

      setBalance((prevBalance) => {
        if (!prevBalance) return prevBalance;

        const newBalance = { ...prevBalance };
        const currencyData = newBalance[event.type];

        if (event.operation === "earned") {
          currencyData.balance += event.amount;
          currencyData.total_earned += event.amount;
          currencyData.daily_earned_today += event.amount;
        } else if (event.operation === "spent") {
          currencyData.balance = Math.max(
            0,
            currencyData.balance - event.amount
          );
          currencyData.total_spent += event.amount;
        }

        return newBalance;
      });

      // Mark as potentially stale since this is optimistic
      setIsStale(true);

      // Refresh from server after a short delay to sync
      setTimeout(() => {
        fetchBalance(true);
      }, 1000);
    },
    [balance, enableOptimisticUpdates, fetchBalance]
  );

  /**
   * Setup auto-refresh interval
   */
  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = setInterval(() => {
      fetchBalance(false);
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, fetchBalance]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    fetchBalance(false);
  }, [fetchBalance]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Listen for window focus to refresh stale data
   */
  useEffect(() => {
    const handleFocus = () => {
      if (isStale || !currencyService.isCacheValid()) {
        fetchBalance(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isStale, fetchBalance]);

  /**
   * Check for stale data periodically
   */
  useEffect(() => {
    const checkStaleData = () => {
      if (lastUpdated) {
        const now = new Date();
        const timeDiff = now.getTime() - lastUpdated.getTime();
        const isDataStale = timeDiff > refreshInterval * 2; // Consider stale after 2x refresh interval

        if (isDataStale !== isStale) {
          setIsStale(isDataStale);
        }
      }
    };

    const staleCheckInterval = setInterval(checkStaleData, 10000); // Check every 10 seconds
    return () => clearInterval(staleCheckInterval);
  }, [lastUpdated, refreshInterval, isStale]);

  return {
    balance,
    loading,
    error,
    lastUpdated,
    refresh,
    updateOptimistically,
    isStale,
  };
}

/**
 * Hook for currency balance only (lighter version)
 */
export function useCurrencyBalance() {
  const { balance, loading, error } = useCurrency({
    autoRefresh: true,
    enableOptimisticUpdates: false,
  });

  return { balance, loading, error };
}

/**
 * Hook for specific currency type
 */
export function useSpecificCurrency(type: "SYNC") {
  const { balance, loading, error, refresh } = useCurrency();

  const specificBalance = balance ? balance[type] : null;

  return {
    balance: specificBalance,
    loading,
    error,
    refresh,
  };
}

export default useCurrency;
