// frontend/phaser/classes/core/index.ts

/**
 * 🎯 CORE CLASSES - Logic lõi chung cho mọi dạng chơi
 *
 * Các lớp này không phụ thuộc vào bất kỳ dạng chơi cụ thể nào.
 * Chúng quản lý logic game tổng quát như:
 * - Quản lý rounds và scoring (MinigameCore, RoundManager)
 * - Quản lý thời gian (TimerManager)
 * - Utilities cho scene management (SceneManager)
 */

export * from "./MinigameCore";
export * from "./RoundManager";
export * from "./SceneManager";
export * from "./TimerManager";
