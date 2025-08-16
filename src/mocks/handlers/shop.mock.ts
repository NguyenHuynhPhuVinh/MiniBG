import shopInventoryMock from "@/mocks/data/shop.inventory.mock.json" assert { type: "json" };

/**
 * Shop item interface
 */
interface ShopItem {
  id: string;
  price: number;
  asset: string;
  available?: boolean;
}

/**
 * Purchase response interface
 */
interface PurchaseResponse {
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
 * Mock handler cho shop endpoints
 * Mô phỏng độ trễ 150-300ms và 5% lỗi ngẫu nhiên
 */
export const shopMockHandlers = {
  /**
   * Lấy danh sách avatars có sẵn trong shop
   */
  async getAvatars(): Promise<ShopItem[]> {
    // Mô phỏng độ trễ ngẫu nhiên 150-300ms
    const delay = Math.floor(Math.random() * 150) + 150;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Mô phỏng 5% lỗi ngẫu nhiên
    if (Math.random() < 0.05) {
      throw new Error("Mock error: Failed to fetch avatars");
    }

    // Deep-clone để tránh mutation
    return JSON.parse(JSON.stringify(shopInventoryMock.avatars));
  },

  /**
   * Lấy danh sách frames có sẵn trong shop
   */
  async getFrames(): Promise<ShopItem[]> {
    // Mô phỏng độ trễ ngẫu nhiên 150-300ms
    const delay = Math.floor(Math.random() * 150) + 150;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Mô phỏng 5% lỗi ngẫu nhiên
    if (Math.random() < 0.05) {
      throw new Error("Mock error: Failed to fetch frames");
    }

    // Deep-clone để tránh mutation
    return JSON.parse(JSON.stringify(shopInventoryMock.frames));
  },

  /**
   * Lấy danh sách emojis có sẵn trong shop
   */
  async getEmojis(): Promise<ShopItem[]> {
    // Mô phỏng độ trễ ngẫu nhiên 150-300ms
    const delay = Math.floor(Math.random() * 150) + 150;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Mô phỏng 5% lỗi ngẫu nhiên
    if (Math.random() < 0.05) {
      throw new Error("Mock error: Failed to fetch emojis");
    }

    // Deep-clone để tránh mutation
    return JSON.parse(JSON.stringify(shopInventoryMock.emojis));
  },

  /**
   * Mua item từ shop (mock implementation)
   */
  async purchase(
    itemType: "avatars" | "frames" | "emojis",
    itemId: string
  ): Promise<PurchaseResponse> {
    // Mô phỏng độ trễ ngẫu nhiên 150-300ms
    const delay = Math.floor(Math.random() * 150) + 150;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Mô phỏng 5% lỗi ngẫu nhiên
    if (Math.random() < 0.05) {
      return {
        success: false,
        message: "Mock error: Purchase failed",
        error: "PURCHASE_FAILED",
      };
    }

    // Tìm item trong mock data
    const items = shopInventoryMock[itemType] as ShopItem[];
    const item = items.find((i) => i.id === itemId);

    if (!item) {
      return {
        success: false,
        message: "Item not found",
        error: "ITEM_NOT_FOUND",
      };
    }

    // Mô phỏng kiểm tra số dư (giả sử user có đủ tiền)
    const mockCurrentBalance = 1000; // Mock balance
    if (mockCurrentBalance < item.price) {
      return {
        success: false,
        message: "Insufficient balance",
        error: "INSUFFICIENT_BALANCE",
      };
    }

    // Mô phỏng purchase thành công
    const newBalance = mockCurrentBalance - item.price;

    // Cập nhật owned state tạm thời (trong localStorage)
    if (typeof window !== "undefined") {
      const ownedKey = `mock_owned_${itemType}`;
      const owned = JSON.parse(localStorage.getItem(ownedKey) || "[]");
      if (!owned.includes(itemId)) {
        owned.push(itemId);
        localStorage.setItem(ownedKey, JSON.stringify(owned));
      }
    }

    return {
      success: true,
      message: "Purchase successful",
      data: {
        itemId,
        itemType,
        newBalance,
        owned: true,
      },
    };
  },
};
