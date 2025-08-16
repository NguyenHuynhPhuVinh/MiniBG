import { BasePlatformerScene } from "./BasePlatformerScene";
import { IPlatformerRules, DesertSpecificRules } from "./rules";

/**
 * 🏜️ DESERT SCENE - Cấp 3: Scene cụ thể cho Desert level
 *
 * KIẾN TRÚC MỚI với STRATEGY PATTERN:
 * - Sử dụng StandardRules như ForestScene (có thể đổi sau)
 * - Custom physics cho desert environment (sand effects)
 * - Thêm desert-specific visual và audio effects
 * - Tách biệt hoàn toàn "luật chơi" và "theme effects"
 *
 * TRÁCH NHIỆM:
 * - Cung cấp config cho desert level
 * - Chọn bộ quy tắc: StandardRules (hoặc DesertRules sau này)
 * - Custom physics cho desert environment
 * - Thêm desert-specific effects và mechanics
 *
 * KIẾN TRÚC:
 * - Kế thừa từ BasePlatformerScene
 * - Strategy Pattern: Sử dụng StandardRules (có thể đổi)
 * - Override một số methods để custom behavior
 * - Thêm desert-specific features
 */
export class DesertScene extends BasePlatformerScene {
  // === SCENE CONFIGURATION - Implement abstract properties ===
  protected readonly TILEMAP_KEY = "level-2-desert";
  protected readonly TILEMAP_PATH =
    "/tiled-projects/exports/level-2-desert.json";
  protected readonly SCENE_NAME = "DesertScene";

  // === DESERT-SPECIFIC STATE ===
  private sandstormActive = false;
  private heatWaveTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: "DesertScene" });
  }

  /**
   * 🎯 CREATE RULES - Implementation của Strategy Pattern
   *
   * Hiện tại dùng StandardRules như ForestScene.
   * Trong tương lai có thể tạo DesertSpecificRules nếu cần logic riêng.
   *
   * @returns StandardRules - Bộ quy tắc tiêu chuẩn
   */
  protected createRules(): IPlatformerRules {
    console.log(
      "🏜️ DesertScene: Using StandardRules (can be changed to DesertSpecificRules later)"
    );
    return new DesertSpecificRules();

    // Trong tương lai, nếu muốn desert có luật đặc biệt:
    // return new DesertSpecificRules();
    // - Xu có giá trị 15 thay vì 10 (khó tìm trong sa mạc)
    // - Power-up có giá trị 25 thay vì 20
    // - Trap penalty 10 thay vì 5 (sa mạc khắc nghiệt)
    // - Completion bonus 100 thay vì 50 (vượt qua sa mạc khó)
    // - Secret bonus 50 thay vì 25 (ốc đảo hiếm)
  }

  /**
   * 📦 LOAD SCENE SPECIFIC ASSETS - Desert assets
   */
  protected loadSceneSpecificAssets(): void {
    console.log(
      "🏜️ Desert scene: Loading desert-specific assets (placeholder)"
    );

    // Desert-specific sound effects (placeholder)
    // this.load.audio("desert-wind", "/sounds/desert-wind.ogg");
    // this.load.audio("sandstorm", "/sounds/sandstorm.ogg");

    // Desert-specific visual effects (placeholder)
    // this.load.image("sand-particles", "/effects/sand-particles.png");
    // this.load.image("heat-wave", "/effects/heat-wave.png");
  }

  /**
   * ⚡ GET PLAYER PHYSICS CONFIG - Custom physics cho desert
   *
   * Desert có sand nên:
   * - Slower movement (sand resistance)
   * - Slightly higher jump (sand gives more spring)
   * - Less bounce (sand absorbs impact)
   */
  public getPlayerPhysicsConfig() {
    return {
      speed: 180, // Slower due to sand
      jumpPower: 720, // Slightly higher jump (sand spring effect)
      gravity: 800, // Same gravity
      bounce: 0.1, // Less bounce (sand absorbs)
    };
  }

  /**
   * 🎵 POST INITIALIZE - Desert-specific enhancements
   */
  protected postInitialize(): void {
    super.postInitialize();

    // Desert-specific setup
    this.setupDesertAmbience();
    this.setupDesertEffects();
    this.startDesertWeatherCycle();

    console.log(
      "🏜️ Desert scene: Enhanced with desert-specific features using StandardRules"
    );
  }

  // === DESERT-SPECIFIC VISUAL & AUDIO EFFECTS ===
  // (Tách biệt hoàn toàn với game logic - chỉ là theme effects)

  /**
   * 🎵 SETUP DESERT AMBIENCE - Âm thanh môi trường sa mạc
   */
  private setupDesertAmbience(): void {
    console.log("🎵 Desert wind ambience setup (placeholder)");
    // this.sound.play("desert-wind", { loop: true, volume: 0.4 });
  }

  /**
   * ✨ SETUP DESERT EFFECTS - Hiệu ứng visual cho sa mạc
   */
  private setupDesertEffects(): void {
    this.setupHeatWaveEffect();
    this.setupSandParticles();
    console.log("✨ Desert visual effects setup");
  }

  /**
   * 🌡️ SETUP HEAT WAVE EFFECT - Hiệu ứng sóng nhiệt
   */
  private setupHeatWaveEffect(): void {
    console.log("🌡️ Heat wave effect setup (placeholder)");
  }

  /**
   * 💨 SETUP SAND PARTICLES - Hiệu ứng cát bay
   */
  private setupSandParticles(): void {
    console.log("💨 Sand particles setup (placeholder)");
  }

  /**
   * 🌪️ START DESERT WEATHER CYCLE - Chu kỳ thời tiết sa mạc
   */
  private startDesertWeatherCycle(): void {
    this.time.addEvent({
      delay: Phaser.Math.Between(20000, 40000), // 20-40 seconds
      callback: this.triggerSandstorm,
      callbackScope: this,
      loop: true,
    });
    console.log("🌪️ Desert weather cycle started");
  }

  /**
   * 🌪️ TRIGGER SANDSTORM - Kích hoạt bão cát
   */
  private triggerSandstorm(): void {
    if (this.sandstormActive) return;

    console.log("🌪️ Sandstorm incoming!");
    this.sandstormActive = true;

    this.tweens.add({
      targets: this.cameras.main,
      alpha: 0.7,
      duration: 2000,
      yoyo: true,
      onComplete: () => {
        this.sandstormActive = false;
      },
    });
  }

  /**
   * 🔄 UPDATE - Override để thêm desert-specific updates
   */
  update(): void {
    super.update();
    // Desert-specific visual updates (không ảnh hưởng game logic)
  }

  // === CLEANUP ===

  /**
   * 🗑️ CLEANUP ON SHUTDOWN - Override để cleanup desert resources
   */
  protected cleanupOnShutdown(): void {
    super.cleanupOnShutdown();

    if (this.heatWaveTimer) {
      this.heatWaveTimer.destroy();
    }
    this.sandstormActive = false;

    console.log("🗑️ Desert scene cleanup completed with Strategy Pattern");
  }
}
