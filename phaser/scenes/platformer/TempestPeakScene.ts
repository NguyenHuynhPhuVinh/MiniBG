import { BasePlatformerScene } from "./BasePlatformerScene";
import { IPlatformerRules, DesertSpecificRules } from "./rules";
import { WindEffect } from "../../classes/platformer/effects";

/**
 * ⛰️ TEMPEST PEAK SCENE - Cấp 3: Scene cụ thể cho level gió bão leo dọc
 */
export class TempestPeakScene extends BasePlatformerScene {
  // === SCENE CONFIGURATION - Implement abstract properties ===
  protected readonly TILEMAP_KEY = "TempestPeakScene";
  protected readonly TILEMAP_PATH =
    "/tiled-projects/exports/TempestPeakScene.json";
  protected readonly SCENE_NAME = "TempestPeakScene";

  constructor() {
    super({
      key: "TempestPeakScene",
      physics: {
        default: "arcade",
        arcade: {},
        matter: {
          gravity: { y: 0.8 },
          debug: false,
        } as any,
      },
    });
  }

  /**
   * 🎯 CREATE RULES - Implementation của Strategy Pattern
   */
  protected createRules(): IPlatformerRules {
    console.log("⛰️ TempestPeakScene: Using DesertSpecificRules");
    return new DesertSpecificRules();
  }

  /**
   * 📦 LOAD SCENE SPECIFIC ASSETS - Implement abstract method
   */
  protected loadSceneSpecificAssets(): void {
    console.log("⛰️ Tempest Peak scene: Using common platformer assets");
  }

  /**
   * 🎬 INITIALIZE SCENE - Ghi đè để thêm hiệu ứng môi trường
   */
  protected initializeScene(): void {
    super.initializeScene();
    console.log(`🌪️ TempestPeakScene: Activating WindEffect.`);
    this.environmentalEffect = new WindEffect();
    this.environmentalEffect.initialize(this);
  }

  /**
   * 🎵 POST INITIALIZE - Hook optional
   */
  protected postInitialize(): void {
    super.postInitialize();
    console.log(
      "✅ TempestPeakScene: Setup completed with DesertSpecificRules"
    );
  }
}
