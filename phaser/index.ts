/**
 * 📦 MAIN EXPORT FILE - Entry point cho Phaser game engine
 *
 * EXPORTS:
 * - StartGame: Function khởi tạo Phaser.Game
 * - EventBus: Communication bridge React ↔ Phaser
 * - Constants: Tất cả game config và constants
 * - Scenes: PreloadScene, GameScene
 * - Classes: Player, InputManager, CameraManager, AnimationManager, CharacterFrames
 *
 * SỬ DỤNG:
 * import { StartGame, EventBus } from './phaser';
 */
export { default as StartGame } from './GameEngine';
export { EventBus } from './EventBus';
export * from './config/constants';
export * from './scenes';
export * from './classes';
export * from './types/QuizTypes';
