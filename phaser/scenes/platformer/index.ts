/**
 * 🎮 PLATFORMER SCENES - Export tất cả platformer-related scenes và specialists
 *
 * Kiến trúc đa cấp theo dạng chơi (đã tái cấu trúc):
 * - BaseGameScene (Cấp 1): Logic chung nhất cho tất cả minigame
 * - BasePlatformerScene (Cấp 2): Logic chung cho dạng chơi platformer (đã được tinh gọn)
 * - ForestScene, DesertScene (Cấp 3): Scene cụ thể với config riêng
 * - PlatformerLogicCore: Core logic tách biệt (Composition pattern)
 *
 * CÁC CHUYÊN GIA HELPERS (mới):
 * - PlatformerWorldBuilder: Chuyên gia xây dựng thế giới từ Tiled
 * - PlatformerPlayerHandler: Chuyên gia về người chơi và physics
 */

// === BASE CLASSES ===
export { BaseGameScene } from "../BaseGameScene";
export { BasePlatformerScene } from "./BasePlatformerScene";

// === LOGIC CORE ===
export { PlatformerLogicCore } from "./PlatformerLogicCore";

// === CHUYÊN GIA HELPERS ===
export { PlatformerWorldBuilder } from "./PlatformerWorldBuilder";
export { PlatformerPlayerHandler } from "./PlatformerPlayerHandler";

// === CONCRETE SCENES ===
export { ForestScene } from "./ForestScene";
export { DesertScene } from "./DesertScene";

// === TYPE DEFINITIONS ===
export interface PlatformerSceneConfig {
  tilemapKey: string;
  tilemapPath: string;
  sceneName: string;
  customPhysics?: {
    speed?: number;
    jumpPower?: number;
    gravity?: number;
    bounce?: number;
  };
}

export interface PlatformerStats {
  coinsCollected: number;
  secretsFound: number;
  timeRemaining: number;
  completionBonus: number;
}
