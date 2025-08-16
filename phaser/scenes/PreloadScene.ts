import { Scene } from "phaser";
import { SCENE_KEYS, COLORS } from "../config/constants";
import { RoundManager } from "../classes/core/RoundManager";
import { EventBus } from "../EventBus";

/**
 * ⏳ PRELOAD SCENE - Scene khởi tạo và quản lý game
 *
 * LUỒNG HOẠT ĐỘNG:
 * 1. Khởi tạo RoundManager và SceneManager
 * 2. Setup game logic và random scenes
 * 3. Không load assets - để từng minigame tự load
 * 4. Chuyển sang round đầu tiên
 */
export class PreloadScene extends Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  /**
   * 🎬 CREATE - Setup sau khi assets load xong
   */
  create(): void {
    console.log("✅ PreloadScene: Assets loaded, setting up round manager");

    const roundManager = RoundManager.getInstance();
    this.setupEventListeners();

    // Emit scene ready
    EventBus.emit("current-scene-ready", this);
  }

  /**
   * 📦 PRELOAD - Setup only, no asset loading
   */
  preload(): void {
    // Không load assets - để từng scene tự load
    console.log("⏳ PreloadScene: Setup only, no asset loading");
  }

  /**
   * 🎧 SETUP EVENT LISTENERS
   */
  private setupEventListeners(): void {
    // Lắng nghe quiz data từ React
    EventBus.on("quiz-data-loaded", (data: any) => {
      const roundManager = RoundManager.getInstance();
      roundManager.setScene(this);
      roundManager.initialize(data);
    });
  }
}
