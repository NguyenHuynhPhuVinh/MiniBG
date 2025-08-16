// frontend/phaser/classes/platformer/index.ts

/**
 * 🎮 PLATFORMER CLASSES - Logic chuyên biệt cho dạng chơi Platformer
 *
 * Các lớp này chỉ được sử dụng trong các scene platformer.
 * Chúng quản lý các khía cạnh cụ thể của gameplay platformer như:
 * - Nhân vật và chuyển động (Player, AnimationManager, CharacterFrames)
 * - Camera và điều khiển (CameraManager, InputManager)
 * - Physics và interactions đặc trưng của platformer
 * - State Machine System (states/)
 */

export * from "./AnimationManager";
export * from "./CameraManager";
export * from "./CharacterFrames";
export * from "./InputManager";
export * from "./Player";

// Export State Machine System
export * from "./states";
