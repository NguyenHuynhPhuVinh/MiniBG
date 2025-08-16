import * as Phaser from 'phaser';
import { createGameConfig } from './config/gameConfig';

/**
 * 🚀 KHỞI TẠO PHASER GAME ENGINE
 *
 * CHỨC NĂNG:
 * - Tạo Phaser.Game instance với config đã setup
 * - Được gọi từ React component để mount game vào DOM
 *
 * LUỒNG:
 * 1. Nhận parent element ID từ React
 * 2. Tạo game config với parent đó
 * 3. Khởi tạo Phaser.Game → tự động chạy PreloadScene
 *
 * @param parent - ID của DOM element sẽ chứa game canvas
 * @returns Phaser.Game instance để React quản lý lifecycle
 */
const StartGame = (parent: string): Phaser.Game => {
  const config = createGameConfig(parent);
  return new Phaser.Game(config);
};

export default StartGame;


