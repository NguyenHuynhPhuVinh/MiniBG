/**
 * 🎮 CLASSES EXPORT - Tái cấu trúc theo lĩnh vực (Core & Platformer)
 *
 * KIẾN TRÚC MỚI:
 * - Core: Các lớp quản lý game chung (MinigameCore, RoundManager, TimerManager, SceneManager)
 * - Platformer: Các lớp chuyên biệt cho dạng chơi platformer (Player, CameraManager, InputManager, etc.)
 *
 * EXPORTS:
 * - Tất cả classes và types từ core/ và platformer/
 * - Backwards compatibility: Các import cũ vẫn hoạt động bình thường
 * - Clear separation: Có thể import trực tiếp từ core/ hoặc platformer/ nếu muốn rõ ràng
 *
 * USAGE:
 * - Legacy (still works): import { Player, MinigameCore } from "../../classes";
 * - Explicit (recommended): import { Player } from "../../classes/platformer";
 *                          import { MinigameCore } from "../../classes/core";
 */

// === CORE CLASSES - Logic lõi chung cho mọi dạng chơi ===
export * from "./core";

// === PLATFORMER CLASSES - Logic chuyên biệt cho platformer ===
export * from "./platformer";

// === UTILITIES - Shared utilities ===
export {
  SeededRandom,
  SeedGenerator,
  SeededSceneSelector,
} from "../utils/SeededRandom";
