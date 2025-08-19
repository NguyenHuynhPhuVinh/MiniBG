import * as Phaser from "phaser";
import { GAME_CONFIG } from "./constants";
import { PreloadScene } from "../scenes/PreloadScene";
import { ForestScene, DesertScene } from "../scenes/platformer";

/**
 * 🎮 TẠO CẤU HÌNH PHASER GAME
 *
 * CHỨC NĂNG:
 * - Tạo config cho Phaser.Game instance
 * - Setup responsive full screen
 * - Cấu hình physics (gravity, collision)
 * - Định nghĩa thứ tự scenes
 *
 * @param parent - ID của DOM element chứa game
 * @returns Phaser game configuration object
 */
export const createGameConfig = (
  parent: string
): Phaser.Types.Core.GameConfig => {
  return {
    // === CẤU HÌNH CƠ BẢN ===
    type: Phaser.AUTO, // Tự động chọn WebGL hoặc Canvas
    width: "100%", // Full width responsive
    height: "100%", // Full height responsive
    parent: parent, // DOM container element
    backgroundColor: GAME_CONFIG.BACKGROUND_COLOR, // Sky blue background

    // === CẤU HÌNH RESPONSIVE ===
    scale: {
      mode: Phaser.Scale.RESIZE, // Tự động resize theo container
      autoCenter: Phaser.Scale.CENTER_BOTH, // Center game trong container
      width: "100%",
      height: "100%",
      zoom: 1, // Không zoom, giữ tỷ lệ gốc
    },

    // === DANH SÁCH SCENES (thứ tự chạy) ===
    scene: [PreloadScene, ForestScene, DesertScene], // PreloadScene → Random(ForestScene/DesertScene)

    // === CẤU HÌNH PHYSICS ===
    physics: {
      default: "arcade", // Sử dụng Arcade Physics (đơn giản, nhanh)
      arcade: {
        gravity: { y: 800, x: 0 }, // Trọng lực hướng xuống (800 = mạnh)
        debug: false, // Tắt debug graphics (bật = true để debug)
      },
    },

    // === CẤU HÌNH RENDER ===
    render: {
      antialias: true, // Bật antialias cho đồ họa mượt
      pixelArt: false, // Tắt pixel art mode (bật nếu dùng pixel art)
      powerPreference: "high-performance", // Ưu tiên GPU mạnh để render
      clearBeforeRender: true, // Clear canvas trước mỗi frame
      preserveDrawingBuffer: false, // Tối ưu performance
      failIfMajorPerformanceCaveat: false, // Cho phép fallback
      // Thêm config cho text rendering tốt hơn
      transparent: false, // Không cần transparency cho background
      roundPixels: true, // Làm tròn pixel để text sắc nét hơn
    },
  };
};
