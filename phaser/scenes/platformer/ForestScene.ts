import { BasePlatformerScene } from "./BasePlatformerScene";
import { IPlatformerRules, StandardRules } from "./rules";

/**
 * 🌲 FOREST SCENE - Cấp 3: Scene cụ thể cho Forest level
 *
 * KIẾN TRÚC MỚI với STRATEGY PATTERN:
 * - Chỉ cần chọn bộ quy tắc thông qua createRules()
 * - Cực kỳ đơn giản - chỉ 15-20 dòng code thay vì 400+ dòng cũ
 * - Tái sử dụng toàn bộ logic từ BasePlatformerScene
 *
 * TRÁCH NHIỆM:
 * - Cung cấp config: tilemap key, path, scene name
 * - Chọn bộ quy tắc: StandardRules cho forest
 * - (Optional) Load assets riêng cho forest nếu cần
 * - (Optional) Override behavior nếu forest có gì đặc biệt
 *
 * KIẾN TRÚC:
 * - Kế thừa từ BasePlatformerScene
 * - Strategy Pattern: Chọn StandardRules cho luật chơi
 * - Chỉ cần provide configuration và rules
 */
export class ForestScene extends BasePlatformerScene {
  // === SCENE CONFIGURATION - Implement abstract properties ===
  protected readonly TILEMAP_KEY = "level-1-forest";
  protected readonly TILEMAP_PATH =
    "/tiled-projects/exports/level-1-forest.json";
  protected readonly SCENE_NAME = "ForestScene";

  constructor() {
    super({ key: "ForestScene" });
  }

  /**
   * 🎯 CREATE RULES - Implementation của Strategy Pattern
   *
   * Chọn bộ quy tắc tiêu chuẩn cho màn chơi Forest.
   * Điểm mạnh: Có thể đổi thành bộ quy tắc khác chỉ bằng 1 dòng code!
   *
   * @returns StandardRules - Bộ quy tắc tiêu chuẩn
   */
  protected createRules(): IPlatformerRules {
    console.log("🌲 ForestScene: Using StandardRules");
    return new StandardRules();

    // Trong tương lai, nếu muốn forest có luật đặc biệt:
    // return new ForestSpecificRules();
  }

  /**
   * 📦 LOAD SCENE SPECIFIC ASSETS - Implement abstract method
   */
  protected loadSceneSpecificAssets(): void {
    console.log("🌲 Forest scene: Using common platformer assets");

    // Forest scene hiện tại dùng common platformer assets
    // Nếu cần assets riêng cho forest:
    // this.load.audio("forest-ambience", "/sounds/forest-ambience.ogg");
    // this.load.image("forest-particles", "/effects/forest-particles.png");
  }

  // === OPTIONAL CUSTOMIZATIONS - Có thể override nếu cần ===

  /**
   * ⚡ GET PLAYER PHYSICS CONFIG - Override nếu forest cần physics khác
   */
  public getPlayerPhysicsConfig() {
    return {
      speed: 200, // Standard speed
      jumpPower: 700, // Standard jump
      gravity: 800, // Standard gravity
      bounce: 0.2, // Standard bounce
    };

    // Trong tương lai, có thể custom cho forest:
    // return {
    //   speed: 220,      // Slightly faster in forest
    //   jumpPower: 750,  // Slightly higher jump (tree climbing?)
    //   gravity: 750,    // Slightly less gravity (magical forest?)
    //   bounce: 0.3,     // More bouncy (soft forest floor?)
    // };
  }

  /**
   * 🎵 POST INITIALIZE - Override để thêm forest-specific logic
   */
  protected postInitialize(): void {
    super.postInitialize();

    // Forest-specific enhancements có thể thêm sau
    console.log("� Forest scene: Basic setup completed with StandardRules");
  }
}
