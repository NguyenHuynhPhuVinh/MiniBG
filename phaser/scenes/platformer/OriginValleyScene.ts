import { BasePlatformerScene } from "./BasePlatformerScene";
import { IPlatformerRules, StandardRules } from "./rules";

/**
 * 🌿 ORIGIN VALLEY SCENE - Cấp 3: Scene cụ thể cho level khởi đầu
 *
 * KIẾN TRÚC MỚI với STRATEGY PATTERN:
 * - Chỉ cần chọn bộ quy tắc thông qua createRules()
 * - Tái sử dụng toàn bộ logic từ BasePlatformerScene
 */
export class OriginValleyScene extends BasePlatformerScene {
  // === SCENE CONFIGURATION - Implement abstract properties ===
  protected readonly TILEMAP_KEY = "OriginValleyScene";
  protected readonly TILEMAP_PATH =
    "/tiled-projects/exports/OriginValleyScene.json";
  protected readonly SCENE_NAME = "OriginValleyScene";

  constructor() {
    super({
      key: "OriginValleyScene",
      physics: {
        default: "arcade",
        arcade: {},
        matter: {
          gravity: { y: 0.8 },
          debug: false, // BẬT DEBUG ĐỂ XEM COLLISION BOUNDARIES!
        } as any,
      },
    });
  }

  /**
   * 🎯 CREATE RULES - Implementation của Strategy Pattern
   */
  protected createRules(): IPlatformerRules {
    console.log("🌿 OriginValleyScene: Using StandardRules");
    return new StandardRules();
  }

  /**
   * 📦 LOAD SCENE SPECIFIC ASSETS - Implement abstract method
   */
  protected loadSceneSpecificAssets(): void {
    console.log("🌿 Origin Valley scene: Using common platformer assets");
  }

  /**
   * ⚡ GET PLAYER PHYSICS CONFIG - Override nếu cần
   */
  public getPlayerPhysicsConfig() {
    return {
      speed: 200,
      jumpPower: 700,
      gravity: 800,
      bounce: 0.2,
    };
  }

  /**
   * 🎵 POST INITIALIZE - Hook optional
   */
  protected postInitialize(): void {
    super.postInitialize();
    console.log(
      "✅ OriginValleyScene: Basic setup completed with StandardRules"
    );
  }
}
