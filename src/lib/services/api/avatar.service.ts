/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./client";
import {
  MyAvatarDataResponse,
  AvailableItemsResponse,
  EquipItemRequest,
  EquipItemResponse,
  CollectionProgressResponse,
  UserCustomization,
  UserInventory,
  CollectionProgress,
  AvatarData,
  AvatarFrame,
  EmojiData,
  AvatarRarity,
  ItemType,
} from "../../types/avatar";

// Constants for better maintainability
const AVATAR_ENDPOINTS = {
  MY_DATA: "/avatar/my-data",
  AVAILABLE_ITEMS: "/avatar/available-items",
  EQUIP: "/avatar/equip",
  UNEQUIP_FRAME: "/avatar/unequip-frame",
  COLLECTION_PROGRESS: "/avatar/collection-progress",
} as const;

const VALID_ITEM_TYPES: ItemType[] = [
  "avatar",
  "frame",
  "name_effect",
  "emoji",
];

const RARITY_COLORS: Record<AvatarRarity, string> = {
  COMMON: "#9CA3AF", // Gray
  UNCOMMON: "#10B981", // Green
  RARE: "#3B82F6", // Blue
  EPIC: "#8B5CF6", // Purple
  LEGENDARY: "#F59E0B", // Gold
};

const RARITY_DISPLAY_NAMES: Record<AvatarRarity, string> = {
  COMMON: "Thông thường",
  UNCOMMON: "Không phổ biến",
  RARE: "Hiếm",
  EPIC: "Sử thi",
  LEGENDARY: "Huyền thoại",
};

class AvatarService {
  /**
   * Lấy dữ liệu avatar hoàn chỉnh của user hiện tại
   * GET /api/avatar/my-data
   */
  async getMyAvatarData(): Promise<MyAvatarDataResponse["data"]> {
    try {
      console.log("🚀 [Avatar Service] Calling API:", AVATAR_ENDPOINTS.MY_DATA);
      const response = await api.get(AVATAR_ENDPOINTS.MY_DATA);
      console.log("📡 [Avatar Service] Raw API Response:", response);
      const data: MyAvatarDataResponse = response.data;
      console.log("📦 [Avatar Service] Parsed Response Data:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch avatar data");
      }

      console.log("✅ [Avatar Service] Returning data:", data.data);
      return data.data;
    } catch (error: any) {
      console.error(
        "❌ [Avatar Service] Error fetching my avatar data:",
        error
      );
      console.error(
        "❌ [Avatar Service] Error response:",
        error.response?.data
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải dữ liệu avatar"
      );
    }
  }

  /**
   * Lấy danh sách items có thể mở khóa
   * GET /api/avatar/available-items
   */
  async getAvailableItems(): Promise<AvailableItemsResponse["data"]> {
    try {
      console.log(
        "🚀 [Avatar Service] Calling API:",
        AVATAR_ENDPOINTS.AVAILABLE_ITEMS
      );
      const response = await api.get(AVATAR_ENDPOINTS.AVAILABLE_ITEMS);
      console.log("📡 [Avatar Service] Raw API Response:", response);
      const data: AvailableItemsResponse = response.data;
      console.log("📦 [Avatar Service] Parsed Response Data:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch available items");
      }

      console.log("✅ [Avatar Service] Returning data:", data.data);
      return data.data;
    } catch (error: any) {
      console.error(
        "❌ [Avatar Service] Error fetching available items:",
        error
      );
      console.error(
        "❌ [Avatar Service] Error response:",
        error.response?.data
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách items"
      );
    }
  }

  /**
   * Lấy danh sách items với cấu trúc API mới (trực tiếp từ API response)
   * GET /api/avatar/available-items
   * Sử dụng method này thay vì getAvailableItems() cho API mới
   */
  async getAvailableItemsNew(): Promise<{
    user_level: number;
    user_tier: string;
    avatars: {
      owned: AvatarData[];
      unlockable: AvatarData[];
      locked: AvatarData[];
    };
    frames: {
      owned: AvatarFrame[];
      unlockable: AvatarFrame[];
      locked: AvatarFrame[];
      shop: AvatarFrame[];
    };
    name_effects: {
      owned: any[];
      unlockable: any[];
      locked: any[];
    };
    emojis: {
      owned: EmojiData[];
      unlockable: EmojiData[];
      locked: EmojiData[];
    };
  }> {
    try {
      console.log(
        "🚀 [Avatar Service] Calling new API structure:",
        AVATAR_ENDPOINTS.AVAILABLE_ITEMS
      );
      const response = await api.get(AVATAR_ENDPOINTS.AVAILABLE_ITEMS);
      console.log("📡 [Avatar Service] Raw API Response (New):", response.data);

      // API mới trả về trực tiếp data structure, không cần chuẩn hóa
      const data = response.data.data;
      console.log("✅ [Avatar Service] Returning new structure:", data);
      return data;
    } catch (error: any) {
      console.error(
        "❌ [Avatar Service] Error fetching available items (new):",
        error
      );
      console.error(
        "❌ [Avatar Service] Error response:",
        error.response?.data
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách items"
      );
    }
  }

  /**
   * Trang bị item cho user
   * POST /api/avatar/equip
   */
  async equipItem(request: EquipItemRequest): Promise<UserCustomization> {
    try {
      // Validate request
      this.validateEquipRequest(request);

      const response = await api.post(AVATAR_ENDPOINTS.EQUIP, request);
      const data: EquipItemResponse = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to equip item");
      }

      return data.data.customization;
    } catch (error: any) {
      console.error("Error equipping item:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Không thể trang bị item"
      );
    }
  }

  /**
   * Bỏ trang bị frame (chỉ áp dụng cho frame)
   * POST /api/avatar/unequip-frame
   */
  async unequipFrame(): Promise<UserCustomization> {
    try {
      const response = await api.post(AVATAR_ENDPOINTS.UNEQUIP_FRAME);
      const data: EquipItemResponse = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to unequip frame");
      }

      return data.data.customization;
    } catch (error: any) {
      console.error("Error unequipping frame:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Không thể bỏ trang bị frame"
      );
    }
  }

  /**
   * Private method: Validate equip item request
   */
  private validateEquipRequest(request: EquipItemRequest): void {
    if (!request.itemType || !request.itemId) {
      throw new Error("Item type và item ID là bắt buộc");
    }

    if (!VALID_ITEM_TYPES.includes(request.itemType)) {
      throw new Error(
        `Item type không hợp lệ. Chỉ chấp nhận: ${VALID_ITEM_TYPES.join(", ")}`
      );
    }

    if (request.itemId <= 0) {
      throw new Error("Item ID phải là số dương");
    }
  }

  /**
   * Lấy tiến độ sưu tập của user
   * GET /api/avatar/collection-progress
   */
  async getCollectionProgress(): Promise<CollectionProgress> {
    try {
      const response = await api.get(AVATAR_ENDPOINTS.COLLECTION_PROGRESS);
      const data: CollectionProgressResponse = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch collection progress");
      }

      return data.data;
    } catch (error: any) {
      console.error("Error fetching collection progress:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải tiến độ sưu tập"
      );
    }
  }

  /**
   * Utility method: Lấy avatar hiện tại đang trang bị từ inventory
   */
  getEquippedAvatar(
    customization: UserCustomization,
    inventory: UserInventory
  ): AvatarData | null {
    if (!customization.equipped_avatar_id) return null;

    const avatarItem = inventory.avatars.find(
      (item) => item.Avatar.avatar_id === customization.equipped_avatar_id
    );

    return avatarItem?.Avatar || null;
  }

  /**
   * Utility method: Lấy frame hiện tại đang trang bị từ inventory
   */
  getEquippedFrame(
    customization: UserCustomization,
    inventory: UserInventory
  ): AvatarFrame | null {
    // Nếu equipped_frame_id là 0 hoặc null, không có frame nào được trang bị
    if (
      !customization.equipped_frame_id ||
      customization.equipped_frame_id === 0
    ) {
      return null;
    }

    const frameItem = inventory.frames.find(
      (item) => item.Frame.frame_id === customization.equipped_frame_id
    );

    return frameItem?.Frame || null;
  }

  /**
   * Utility method: Kiểm tra user có sở hữu item không
   */
  hasItem(
    itemType: "avatar" | "frame" | "emoji",
    itemId: number,
    inventory: UserInventory
  ): boolean {
    switch (itemType) {
      case "avatar":
        return inventory.avatars.some(
          (item) => item.Avatar.avatar_id === itemId
        );
      case "frame":
        return inventory.frames.some((item) => item.Frame.frame_id === itemId);
      case "emoji":
        return inventory.emojis.some((item) => item.Emoji.emoji_id === itemId);
      default:
        return false;
    }
  }

  /**
   * Utility method: Format completion rate
   */
  formatCompletionRate(rate: string): string {
    try {
      const numRate = parseFloat(rate);
      if (isNaN(numRate)) return "0%";
      return `${Math.round(numRate)}%`;
    } catch {
      return "0%";
    }
  }

  /**
   * Utility method: Lấy màu sắc theo rarity
   */
  getRarityColor(rarity: string): string {
    return RARITY_COLORS[rarity as AvatarRarity] || RARITY_COLORS.COMMON;
  }

  /**
   * Utility method: Lấy tên hiển thị cho rarity
   */
  getRarityDisplayName(rarity: string): string {
    return RARITY_DISPLAY_NAMES[rarity as AvatarRarity] || "Không xác định";
  }

  /**
   * Utility method: Kiểm tra rarity có hợp lệ không
   */
  isValidRarity(rarity: string): rarity is AvatarRarity {
    return Object.keys(RARITY_COLORS).includes(rarity);
  }

  /**
   * Utility method: Lấy tất cả rarities có sẵn
   */
  getAllRarities(): AvatarRarity[] {
    return Object.keys(RARITY_COLORS) as AvatarRarity[];
  }
}

export const avatarService = new AvatarService();
export default avatarService;
