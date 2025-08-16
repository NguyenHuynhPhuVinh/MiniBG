/**
 * Khởi tạo lớp mock cho axios client.
 * Cách dùng an toàn: gọi initMocks() sớm trên client (vd: _app.tsx layout) hoặc trong service.
 * Tuy nhiên để tránh side-effect global, ta chỉ patch các hàm của service khi USE_MOCKS=true.
 */
import { MOCK_FLAGS } from "@/lib/constants/mock";
import {
  currencyMockHandlers,
  gamificationMockHandlers,
  shopMockHandlers,
} from "@/mocks/handlers";
import currencyServiceSingleton from "@/lib/services/api/currency.service";
import gamificationServiceSingleton from "@/lib/services/api/gamification.service";
import levelProgressServiceSingleton from "@/lib/services/api/level-progress.service";
import avatarServiceSingleton from "@/lib/services/api/avatar.service";
import shopServiceSingleton from "@/lib/services/api/shop.service";
let initialized = false;

export function initMocks() {
  if (initialized || !MOCK_FLAGS.USE_MOCKS) return;

  // Patch Currency Service
  const currencySvc: any = currencyServiceSingleton as any;
  if (currencySvc && typeof currencySvc.getCurrencyBalance === "function") {
    currencySvc.getCurrencyBalance = async () =>
      currencyMockHandlers.getBalance();
  }
  if (currencySvc && typeof currencySvc.getCurrencyHistory === "function") {
    currencySvc.getCurrencyHistory = async () =>
      currencyMockHandlers.getHistory();
  }
  if (currencySvc && typeof currencySvc.transferCurrency === "function") {
    currencySvc.transferCurrency = async () => currencyMockHandlers.transfer();
  }

  // Patch Gamification Service for Stories 3.1, 3.2, 3.3
  const gamificationSvc: any = gamificationServiceSingleton as any;
  if (
    gamificationSvc &&
    typeof gamificationSvc.getMyLevelProgress === "function"
  ) {
    gamificationSvc.getMyLevelProgress = async () =>
      gamificationMockHandlers.getMyLevelProgress();
  }
  if (gamificationSvc && typeof gamificationSvc.getAllTiers === "function") {
    gamificationSvc.getAllTiers = async () =>
      gamificationMockHandlers.getAllTiers();
  }

  // Patch Level Progress Tracker Service
  const levelSvc: any = levelProgressServiceSingleton as any;
  if (levelSvc && typeof levelSvc.getLevelProgressTracker === "function") {
    levelSvc.getLevelProgressTracker = async () =>
      (
        await import("@/mocks/handlers")
      ).levelProgressMockHandlers.getLevelProgressTracker();
  }
  if (levelSvc && typeof levelSvc.claimAvatar === "function") {
    levelSvc.claimAvatar = async (level: number) =>
      (await import("@/mocks/handlers")).levelProgressMockHandlers.claimAvatar(
        level
      );
  }

  // Patch Avatar Service
  const avatarSvc: any = avatarServiceSingleton as any;
  if (avatarSvc && typeof avatarSvc.getMyAvatarData === "function") {
    avatarSvc.getMyAvatarData = async () =>
      (await import("@/mocks/handlers")).avatarMockHandlers.getMyAvatarData();
  }
  if (avatarSvc && typeof avatarSvc.getAvailableItems === "function") {
    avatarSvc.getAvailableItems = async () =>
      (await import("@/mocks/handlers")).avatarMockHandlers.getAvailableItems();
  }
  if (avatarSvc && typeof avatarSvc.getAvailableItemsNew === "function") {
    avatarSvc.getAvailableItemsNew = async () =>
      (await import("@/mocks/handlers")).avatarMockHandlers.getAvailableItems();
  }
  if (avatarSvc && typeof avatarSvc.getCollectionProgress === "function") {
    avatarSvc.getCollectionProgress = async () =>
      (
        await import("@/mocks/handlers")
      ).avatarMockHandlers.getCollectionProgress();
  }
  if (avatarSvc && typeof avatarSvc.equipItem === "function") {
    avatarSvc.equipItem = async (payload: any) =>
      (await import("@/mocks/handlers")).avatarMockHandlers.equipItem(payload);
  }
  if (avatarSvc && typeof avatarSvc.unequipFrame === "function") {
    avatarSvc.unequipFrame = async () =>
      (await import("@/mocks/handlers")).avatarMockHandlers.unequipFrame();
  }

  // Patch Shop Service
  const shopSvc: any = shopServiceSingleton as any;
  if (shopSvc && typeof shopSvc.getAvatars === "function") {
    shopSvc.getAvatars = async () => {
      const data = await shopMockHandlers.getAvatars();
      return {
        success: true,
        message: "Avatars retrieved successfully",
        data,
      };
    };
  }
  if (shopSvc && typeof shopSvc.getFrames === "function") {
    shopSvc.getFrames = async () => {
      const data = await shopMockHandlers.getFrames();
      return {
        success: true,
        message: "Frames retrieved successfully",
        data,
      };
    };
  }
  if (shopSvc && typeof shopSvc.getEmojis === "function") {
    shopSvc.getEmojis = async () => {
      const data = await shopMockHandlers.getEmojis();
      return {
        success: true,
        message: "Emojis retrieved successfully",
        data,
      };
    };
  }
  if (shopSvc && typeof shopSvc.purchase === "function") {
    shopSvc.purchase = async (itemType: string, itemId: string) =>
      shopMockHandlers.purchase(itemType as any, itemId);
  }

  initialized = true;
}
