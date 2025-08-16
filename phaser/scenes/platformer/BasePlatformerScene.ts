import { BaseGameScene } from "../BaseGameScene";
import { EventBus } from "../../EventBus";
import {
  Player,
  InputManager,
  CameraManager,
  TimerManager,
  MinigameCore,
  CHARACTERS,
} from "../../classes";
import { CAMERA_CONFIG, TIMER_CONFIG } from "../../config/constants";
import { PlatformerLogicCore } from "./PlatformerLogicCore";
import { PlatformerWorldBuilder } from "./PlatformerWorldBuilder";
import { PlatformerPlayerHandler } from "./PlatformerPlayerHandler";
import { IPlatformerRules } from "./rules/IPlatformerRules";

/**
 * 🎮 BASE PLATFORMER SCENE - Cấp 2: Lớp cơ sở cho dạng chơi Platformer
 *
 * KIẾN TRÚC MỚI với STRATEGY PATTERN:
 * - Không còn chứa logic nghiệp vụ trong các hook methods
 * - Buộc subclass phải chọn một "bộ quy tắc" (IPlatformerRules)
 * - Tách biệt hoàn toàn "khung platformer" và "luật chơi"
 *
 * TRÁCH NHIỆM:
 * - Tạo Player với vật lý platformer
 * - Khởi tạo InputManager, CameraManager (common cho tất cả platformer)
 * - Xử lý logic chung: tạo map từ Tiled, setup collision với Platforms
 * - Quản lý TimerManager cho gameplay
 * - Ủy quyền logic nghiệp vụ cho IPlatformerRules
 *
 * KIẾN TRÚC:
 * - Template Method pattern: Cung cấp skeleton cho platformer
 * - Strategy Pattern: Sử dụng IPlatformerRules cho logic nghiệp vụ
 * - Composition: Sử dụng PlatformerLogicCore với rules
 * - Abstract: Subclass phải cung cấp config cụ thể VÀ rules
 */
export abstract class BasePlatformerScene extends BaseGameScene {
  // === SCENE CONFIGURATION - Subclass phải override ===
  protected abstract readonly TILEMAP_KEY: string; // Key của tilemap JSON
  protected abstract readonly TILEMAP_PATH: string; // Đường dẫn file JSON
  protected abstract readonly SCENE_NAME: string; // Tên hiển thị scene

  // === STRATEGY PATTERN - Subclass phải implement ===
  /**
   * Phương thức trừu tượng buộc scene con phải "chọn" một bộ luật chơi.
   * Đây là cốt lõi của Strategy Pattern.
   * @returns Một instance của lớp implement IPlatformerRules.
   */
  protected abstract createRules(): IPlatformerRules;

  // === COMPONENTS ===
  protected tilemap!: Phaser.Tilemaps.Tilemap; // Bản đồ game từ Tiled
  protected platformsLayer!: Phaser.Tilemaps.TilemapLayer; // Layer chứa platforms và xu

  // === GAME OBJECTS ===
  protected player!: Player; // Nhân vật chính

  // === MANAGERS ===
  protected inputManager!: InputManager; // Quản lý input keyboard
  protected cameraManager!: CameraManager; // Quản lý camera effects
  protected timerManager!: TimerManager; // Quản lý thời gian game

  // === STRATEGY PATTERN COMPONENTS ===
  protected rules!: IPlatformerRules; // Bộ quy tắc do subclass chọn
  protected logicCore!: PlatformerLogicCore; // Core logic với rules
  protected minigameCore!: MinigameCore; // MinigameCore để xử lý điểm và quiz

  // === CHUYÊN GIA HELPER ===
  private worldBuilder!: PlatformerWorldBuilder; // Chuyên gia xây dựng thế giới
  private playerHandler!: PlatformerPlayerHandler; // Chuyên gia về người chơi

  /**
   * 🎬 PRELOAD - Load assets chung và riêng cho platformer
   *
   * LUỒNG:
   * 1. Emit loading events cho React
   * 2. Load common platformer assets
   * 3. Gọi loadSceneSpecificAssets() để subclass load riêng
   * 4. Setup progress tracking
   */
  preload(): void {
    console.log(`📦 ${this.SCENE_NAME}: Loading assets...`);

    // Emit loading start event
    EventBus.emit("scene-loading-start", { sceneName: this.SCENE_NAME });

    // Setup progress tracking
    this.setupProgressTracking();

    // Load common platformer assets
    this.loadCommonAssets();

    // Load scene-specific assets (subclass implement)
    this.loadSceneSpecificAssets();
  }

  /**
   * 📊 SETUP PROGRESS TRACKING - Setup loading progress events
   */
  private setupProgressTracking(): void {
    this.load.on("progress", (progress: number) => {
      EventBus.emit("scene-loading-progress", {
        progress: progress,
        sceneName: this.SCENE_NAME,
      });
    });

    this.load.on("complete", () => {
      EventBus.emit("scene-loading-complete", { sceneName: this.SCENE_NAME });
    });
  }

  /**
   * 📦 LOAD COMMON ASSETS - Load assets chung cho tất cả platformer
   */
  private loadCommonAssets(): void {
    // Load tilemap JSON của scene cụ thể
    this.load.tilemapTiledJSON(this.TILEMAP_KEY, this.TILEMAP_PATH);

    // Load common tilesets (dùng chung cho tất cả platformer)
    this.load.image(
      "spritesheet-tiles-default",
      "/kenney_new-platformer-pack-1.0/Spritesheets/spritesheet-tiles-default_extruded.png"
    );
    this.load.image(
      "spritesheet-backgrounds-default",
      "/kenney_new-platformer-pack-1.0/Spritesheets/spritesheet-backgrounds-default_extruded.png"
    );

    // Load character spritesheet (dùng chung)
    this.load.image(
      "spritesheet-characters-default",
      "/kenney_new-platformer-pack-1.0/Spritesheets/spritesheet-characters-default.png"
    );

    // Load common sound effects
    this.load.audio(
      "coin",
      "/kenney_new-platformer-pack-1.0/Sounds/sfx_coin.ogg"
    );
    this.load.audio(
      "jump",
      "/kenney_new-platformer-pack-1.0/Sounds/sfx_jump.ogg"
    );
  }

  /**
   * 📦 LOAD SCENE SPECIFIC ASSETS - Abstract method cho subclass
   * Subclass override để load assets riêng cho scene đó
   */
  protected abstract loadSceneSpecificAssets(): void;

  /**
   * 🎬 INITIALIZE SCENE - Implementation của abstract method từ BaseGameScene
   *
   * LUỒNG MỚI với STRATEGY PATTERN:
   * 1. Tạo bộ quy tắc do scene con quyết định (Strategy Pattern)
   * 2. Khởi tạo các chuyên gia Helper
   * 3. Khởi tạo bộ quy tắc với các tham chiếu cần thiết
   * 4. Dùng WorldBuilder để xây dựng thế giới
   * 5. Setup các managers (Input, Camera, Timer)
   * 6. LogicCore nhận vào bộ quy tắc thay vì scene
   * 7. Dùng PlayerHandler để tạo người chơi
   * 8. Dùng WorldBuilder để đặt interactive objects
   * 9. Reset MinigameCore
   */
  protected initializeScene(): void {
    console.log(
      `� ${this.SCENE_NAME}: Orchestrating scene setup with Strategy Pattern...`
    );

    // 1. Tạo bộ quy tắc do scene con quyết định (Strategy Pattern)
    this.rules = this.createRules();
    console.log(`🎯 ${this.SCENE_NAME}: Rules created`);

    // 2. Khởi tạo các chuyên gia Helper và cores
    this.worldBuilder = new PlatformerWorldBuilder(this, this.TILEMAP_KEY);
    this.playerHandler = new PlatformerPlayerHandler(this);
    this.minigameCore = MinigameCore.getInstance();

    // 3. Khởi tạo bộ quy tắc với các tham chiếu cần thiết
    this.rules.initialize(this, this.minigameCore);
    console.log(`🎯 ${this.SCENE_NAME}: Rules initialized`);

    // 4. LogicCore giờ chỉ nhận bộ quy tắc - không có scene dependency
    this.logicCore = new PlatformerLogicCore(this.rules);
    console.log(
      `🎮 ${this.SCENE_NAME}: Pure LogicCore created with rules only`
    );

    // 5. Dùng chuyên gia để xây dựng thế giới
    const { platformsLayer } = this.worldBuilder.build();
    this.platformsLayer = platformsLayer;

    // 6. Setup các managers (logic này vẫn giữ lại vì khá đơn giản)
    this.setupPlatformerManagers();

    // 7. Dùng chuyên gia để tạo người chơi
    const spawnPoint = this.worldBuilder.findPlayerSpawnPoint();
    this.player = this.playerHandler.spawnPlayer(
      spawnPoint,
      this.platformsLayer,
      this.inputManager,
      this.cameraManager,
      this.logicCore
    );

    // 8. Dùng chuyên gia để đặt các đối tượng tương tác
    this.worldBuilder.setupInteractiveObjects(
      this.player.getSprite(),
      this.logicCore
    );

    // 9. Reset game core
    this.minigameCore.resetForNewRound();

    console.log(
      `✅ ${this.SCENE_NAME} initialization completed with Strategy Pattern`
    );
  }

  /**
   * ⚙️ SETUP PLATFORMER MANAGERS - Khởi tạo managers chung cho platformer
   */
  private setupPlatformerManagers(): void {
    // Input Manager - xử lý input PC (Arrow keys, WASD, Space)
    this.inputManager = new InputManager(this);

    // Camera Manager - follow player với config chuẩn
    const worldDimensions = this.worldBuilder.getWorldDimensions();
    this.cameraManager = new CameraManager(this, {
      followOffset: CAMERA_CONFIG.DEFAULT_OFFSET,
      lerpSpeed: CAMERA_CONFIG.LERP_SPEED,
      bounds: {
        x: 0,
        y: 0,
        width: worldDimensions.width,
        height: worldDimensions.height,
      },
    });

    // Timer Manager
    this.timerManager = new TimerManager(this);
    this.startPlatformerGameTimer();

    console.log("⚙️ Platformer managers initialized");
  }

  /**
   * ⏰ START PLATFORMER GAME TIMER - Bắt đầu timer chung cho platformer
   */
  private startPlatformerGameTimer(): void {
    const gameTimeLimit =
      this.getRoundData()?.gameTimeLimit || TIMER_CONFIG.GAME_TIME_LIMIT;

    this.timerManager.startTimer({
      duration: gameTimeLimit,
      onTimeUp: () => {
        console.log(`⏰ ${this.SCENE_NAME} time up! Auto triggering quiz...`);
      },
      onWarning: (timeLeft: number) => {
        console.log(
          `⚠️ ${this.SCENE_NAME} time warning: ${this.timerManager.formatTime(
            timeLeft
          )} left`
        );
      },
      onTick: (timeLeft: number) => {
        EventBus.emit("game-timer-update", {
          timeLeft,
          formatted: this.timerManager.formatTime(timeLeft),
          isWarning: this.timerManager.isInWarningTime(),
        });
      },
    });
  }

  // === UPDATE LOOP ===

  /**
   * 🔄 UPDATE - Game loop chung cho tất cả platformer
   */
  update(): void {
    if (!this.player) return;

    // Update player - xử lý input, movement, animation
    this.player.update();

    // Update logic core nếu cần
    // this.logicCore.update(); // Implement nếu cần
  }

  // === PUBLIC API - Cho React components ===

  /**
   * 📍 GET PLAYER POSITION - API cho React
   */
  public getPlayerPosition() {
    return this.player ? this.player.getPosition() : null;
  }

  /**
   * 📊 GET PLAYER STATE - API cho React
   */
  public getPlayerState() {
    return this.player ? this.player.getState() : null;
  }

  /**
   * ⏸️ PAUSE GAME TIMER - API cho React
   */
  public pauseGameTimer(): void {
    this.timerManager.pauseTimer();
  }

  /**
   * ▶️ RESUME GAME TIMER - API cho React
   */
  public resumeGameTimer(): void {
    this.timerManager.resumeTimer();
  }

  /**
   * 🗺️ GET TILEMAP - API để truy cập tilemap thông qua WorldBuilder
   */
  public getTilemap(): Phaser.Tilemaps.Tilemap {
    return this.worldBuilder.getTilemap();
  }

  /**
   * 📐 GET WORLD DIMENSIONS - API để lấy kích thước thế giới
   */
  public getWorldDimensions(): { width: number; height: number } {
    return this.worldBuilder.getWorldDimensions();
  }

  // === CONFIGURATION HOOKS - Subclass có thể override ===

  /**
   * 👤 GET CHARACTER DATA - Hook để subclass chọn character
   * Default: ORANGE character
   */
  public getCharacterData() {
    return CHARACTERS.ORANGE;
  }

  /**
   * ⚡ GET PLAYER PHYSICS CONFIG - Hook để subclass custom physics
   * Default: Standard platformer physics
   */
  public getPlayerPhysicsConfig() {
    return {
      speed: 200,
      jumpPower: 700,
      gravity: 800,
      bounce: 0.2,
    };
  }

  // === CLEANUP ===

  /**
   * 🗑️ CLEANUP ON SHUTDOWN - Override từ BaseGameScene
   */
  protected cleanupOnShutdown(): void {
    super.cleanupOnShutdown();

    // Cleanup bộ quy tắc TRƯỚC khi cleanup các component khác
    this.rules?.cleanup();

    // Cleanup platformer-specific resources
    this.timerManager?.destroy();
    this.logicCore?.cleanup();

    // Cleanup các chuyên gia helpers
    this.worldBuilder?.cleanup();
    this.playerHandler?.cleanup();

    console.log(
      `🗑️ ${this.SCENE_NAME} platformer cleanup completed with Strategy Pattern`
    );
  }

  /**
   * ⏸️ ON PAUSE - Override từ BaseGameScene
   */
  protected onPause(): void {
    super.onPause();
    this.pauseGameTimer();
  }

  /**
   * ▶️ ON RESUME - Override từ BaseGameScene
   */
  protected onResume(): void {
    super.onResume();
    this.resumeGameTimer();
  }
}
