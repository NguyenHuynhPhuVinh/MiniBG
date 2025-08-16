import api from "./client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type {
  CurrencyBalance,
  CurrencyApiResponse,
  CurrencyCacheData,
  CurrencyError,
} from "@/lib/types/currency";

/**
 * Currency Service - Handles all currency-related API operations
 * Implements 5-minute caching strategy and error handling
 */
class CurrencyService {
  private cache: Map<string, CurrencyCacheData> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly CACHE_KEY = "currency_balance";

  /**
   * Get current user's currency balance
   * Implements 5-minute caching strategy
   */
  async getCurrencyBalance(
    forceRefresh: boolean = false
  ): Promise<CurrencyApiResponse> {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = this.getCachedData();
        if (cachedData) {
          return {
            success: true,
            message: "Currency balance retrieved from cache",
            data: cachedData.data,
          };
        }
      }

      // Fetch from API
      const response = await api.get(API_ENDPOINTS.CURRENCY.BALANCE);
      const apiResponse: CurrencyApiResponse = response.data;
      console.log(apiResponse);
      // Cache the response
      if (apiResponse.success && apiResponse.data) {
        this.setCachedData(apiResponse.data);
      }

      return apiResponse;
    } catch (error) {
      console.error("Error fetching currency balance:", error);

      // Try to return cached data if available during error
      const cachedData = this.getCachedData();
      if (cachedData) {
        return {
          success: true,
          message: "Currency balance retrieved from cache (API error)",
          data: cachedData.data,
        };
      }

      // Re-throw error if no cache available
      throw this.handleError(error);
    }
  }

  /**
   * Get currency transaction history
   */
  async getCurrencyHistory(params?: {
    page?: number;
    limit?: number;
    type?: "SYNC" | "KRIS";
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      // GAME_SYSTEM: Single currency (SYNC) - bỏ tham số type
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);

      const url = queryParams.toString()
        ? `${API_ENDPOINTS.CURRENCY.HISTORY}?${queryParams.toString()}`
        : API_ENDPOINTS.CURRENCY.HISTORY;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching currency history:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Transfer currency between users (if supported)
   */
  async transferCurrency(data: {
    toUserId: string;
    amount: number;
    currencyType: "SYNC" | "KRIS";
    reason?: string;
  }): Promise<any> {
    try {
      const response = await api.post(API_ENDPOINTS.CURRENCY.TRANSFER, data);

      // Invalidate cache after successful transfer
      this.invalidateCache();

      return response.data;
    } catch (error) {
      console.error("Error transferring currency:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Invalidate currency cache
   */
  invalidateCache(): void {
    this.cache.delete(this.CACHE_KEY);
  }

  /**
   * Get cached currency data if valid
   */
  private getCachedData(): CurrencyCacheData | null {
    const cached = this.cache.get(this.CACHE_KEY);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now > cached.expiresAt) {
      this.cache.delete(this.CACHE_KEY);
      return null;
    }

    return cached;
  }

  /**
   * Cache currency data with expiration
   */
  private setCachedData(data: CurrencyBalance): void {
    const now = Date.now();
    const cacheData: CurrencyCacheData = {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
    };

    this.cache.set(this.CACHE_KEY, cacheData);
  }

  /**
   * Handle and format API errors
   */
  private handleError(error: any): CurrencyError {
    if (error.response) {
      return {
        code: error.response.status.toString(),
        message: error.response.data?.message || "Currency API error",
        details: error.response.data,
      };
    } else if (error.request) {
      return {
        code: "NETWORK_ERROR",
        message: "Network error while fetching currency data",
        details: error.request,
      };
    } else {
      return {
        code: "UNKNOWN_ERROR",
        message: error.message || "Unknown currency service error",
        details: error,
      };
    }
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(): boolean {
    const cached = this.cache.get(this.CACHE_KEY);
    if (!cached) return false;

    return Date.now() <= cached.expiresAt;
  }

  /**
   * Get cache expiration time
   */
  getCacheExpirationTime(): number | null {
    const cached = this.cache.get(this.CACHE_KEY);
    return cached ? cached.expiresAt : null;
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();
export default currencyService;
