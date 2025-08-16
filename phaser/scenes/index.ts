/**
 * 🎬 SCENES EXPORT - Tất cả scenes của game
 *
 * KIẾN TRÚC ĐA CẤP THEO DẠNG CHƠI (Genre-based Tiered Architecture):
 *
 * Cấp 1 - Base Game Scene:
 * - BaseGameScene: Logic chung nhất cho tất cả minigame
 *
 * Cấp 2 - Genre Base Scenes:
 * - BasePlatformerScene: Logic chung cho dạng chơi platformer
 * - (Future) BasePuzzleScene: Logic chung cho dạng chơi puzzle
 * - (Future) BaseRacingScene: Logic chung cho dạng chơi racing
 *
 * Cấp 3 - Concrete Scenes:
 * - ForestScene: Platformer scene với theme rừng (thay thế GameScene)
 * - DesertScene: Platformer scene với theme sa mạc (kiến trúc mới)
 * - (Future) CaveScene: Platformer scene với theme hang động
 *
 * Logic Cores:
 * - PlatformerLogicCore: Core logic cho platformer (Composition pattern)
 */

// === SYSTEM SCENES ===
export { PreloadScene } from "./PreloadScene";

// === NEW ARCHITECTURE SCENES ===
// Base classes
export { BaseGameScene } from "./BaseGameScene";

// Platformer genre - Kiến trúc mới
export {
  BasePlatformerScene,
  PlatformerLogicCore,
  ForestScene,
  DesertScene,
} from "./platformer";

// === FUTURE EXPANSIONS ===
// Export puzzle scenes when implemented:
// export { BasePuzzleScene, PuzzleLogicCore, MemoryGameScene, JigsawScene } from './puzzle';
//
// Export racing scenes when implemented:
// export { BaseRacingScene, RacingLogicCore, StreetRaceScene, OffRoadScene } from './racing';
