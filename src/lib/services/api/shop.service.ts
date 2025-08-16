import api from "./client";
import { API_ENDPOINTS } from "@/lib/constants/api";

/**
 * Shop item interface
 */
export interface ShopItem {
  id: string;
  name: string;
  price: number;
  asset: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  description: string;
}

/**
 * Shop API response structure
 */
export interface ShopApiResponse {
  success: boolean;
  message: string;
  data: ShopItem[];
}

/**
 * Purchase API response structure
 */
export interface PurchaseApiResponse {
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
 * Shop error interface
 */
export interface ShopError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Shop Service - Handles all shop-related API operations
 * Implements singleton pattern for consistent state management
 */
class ShopService {
  /**
   * Get available avatars from shop
   */
  async getAvatars(): Promise<ShopApiResponse> {
    try {
      const response = await api.get(API_ENDPOINTS.SHOP.AVATARS);
      return response.data;
    } catch (error) {
      console.error("Error fetching avatars:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get available frames from shop
   */
  async getFrames(): Promise<ShopApiResponse> {
    try {
      const response = await api.get(API_ENDPOINTS.SHOP.FRAMES);
      return response.data;
    } catch (error) {
      console.error("Error fetching frames:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get available emojis from shop
   */
  async getEmojis(): Promise<ShopApiResponse> {
    try {
      const response = await api.get(API_ENDPOINTS.SHOP.EMOJIS);
      return response.data;
    } catch (error) {
      console.error("Error fetching emojis:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Purchase an item from shop
   */
  async purchase(
    itemType: "avatars" | "frames" | "emojis",
    itemId: string
  ): Promise<PurchaseApiResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.SHOP.PURCHASE, {
        itemType,
        itemId,
      });
      return response.data;
    } catch (error) {
      console.error("Error purchasing item:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle and format API errors
   */
  private handleError(error: any): ShopError {
    if (error.response) {
      return {
        code: error.response.status.toString(),
        message: error.response.data?.message || "Shop API error",
        details: error.response.data,
      };
    } else if (error.request) {
      return {
        code: "NETWORK_ERROR",
        message: "Network error while fetching shop data",
        details: error.request,
      };
    } else {
      return {
        code: "UNKNOWN_ERROR",
        message: error.message || "Unknown shop service error",
        details: error,
      };
    }
  }
}

// Export singleton instance
export default new ShopService();
