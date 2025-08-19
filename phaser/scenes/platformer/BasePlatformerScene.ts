import { BaseGameScene } from "../BaseGameScene";
import { EventBus } from "../../EventBus";
import {
  Player,
  InputManager,
  CameraManager,
  TimerManager,
  MinigameCore,
  CHARACTERS,
  NetworkManager,
  AnimationManager,
  AnimationState,
  MobileUIHandler,
} from "../../classes";
import { CAMERA_CONFIG, TIMER_CONFIG } from "../../config/constants";
import { PlatformerLogicCore } from "./PlatformerLogicCore";
import { PlatformerWorldBuilder } from "./PlatformerWorldBuilder";
import { PlatformerPlayerHandler } from "./PlatformerPlayerHandler";
import { PlatformerNetworkHandler } from "../../classes/platformer/PlatformerNetworkHandler";
import { IPlatformerRules } from "./rules/IPlatformerRules";
import { Room } from "colyseus.js";
import {
  GameRoomState,
  Player as PlayerStateSchema,
} from "../../classes/core/types/GameRoomState";

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
  protected foregroundLayer?: Phaser.Tilemaps.TilemapLayer; // Layer foreground (tùy chọn)

  // === GAME OBJECTS ===
  protected player!: Player; // Nhân vật chính

  // === MANAGERS ===
  protected inputManager!: InputManager; // Quản lý input keyboard
  protected cameraManager!: CameraManager; // Quản lý camera effects
  protected timerManager!: TimerManager; // Quản lý thời gian game

  // === MOBILE SUPPORT ===
  private mobileUIHandler?: MobileUIHandler; // UI điều khiển trên di động
  private isMobile: boolean = false; // Cờ phát hiện thiết bị di động

  // === MULTIPLAYER ===
  protected networkManager!: NetworkManager; // Quản lý kết nối mạng
  protected room?: Room<GameRoomState>; // Phòng game Colyseus

  // Thay thế các thuộc tính multiplayer cũ bằng một chuyên gia duy nhất
  protected networkHandler!: PlatformerNetworkHandler;

  // THÊM MỚI: Một thuộc tính để lưu trữ hàm xử lý sự kiện
  private networkConnectedHandler!: (room: Room<GameRoomState>) => void;

  // THÊM MỚI: Map để lưu trữ các tile gốc, giúp chúng ta tìm lại chúng dễ dàng
  private originalTiles: Map<string, Phaser.Tilemaps.Tile> = new Map();
  // THÊM MỚI: Cờ để đảm bảo việc đăng ký chỉ xảy ra một lần
  private hasRegisteredBlocks: boolean = false;
  // THÊM MỚI: Map để theo dõi state cuối cùng của mỗi block
  private lastBlockStates: Map<string, string> = new Map();

  // === STRATEGY PATTERN COMPONENTS ===
  protected rules!: IPlatformerRules; // Bộ quy tắc do subclass chọn
  protected logicCore!: PlatformerLogicCore; // Core logic với rules
  protected minigameCore!: MinigameCore; // MinigameCore để xử lý điểm và quiz

  // === CHUYÊN GIA HELPER ===
  private worldBuilder!: PlatformerWorldBuilder; // Chuyên gia xây dựng thế giới
  private playerHandler!: PlatformerPlayerHandler; // Chuyên gia về người chơi

  // THÊM MỚI: Các thuộc tính để quản lý checkpoint và spawn
  private spawnPoint!: { x: number; y: number };
  private lastCheckpoint: { x: number; y: number } | null = null;
  private isRespawning: boolean = false; // Cờ để tránh respawn chồng chéo

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
    this.load.audio(
      "hurt",
      "/kenney_new-platformer-pack-1.0/Sounds/sfx_hurt.ogg"
    );

    // THÊM MỚI: Load assets cho Mobile UI
    this.load.image(
      "dpad_left",
      "/mobile-controls-1/Sprites/Style C/Default/dpad_element_east.png"
    );
    this.load.image(
      "dpad_right",
      "/mobile-controls-1/Sprites/Style C/Default/dpad_element_west.png"
    );
    this.load.image(
      "button_jump",
      "/mobile-controls-1/Sprites/Icons/Default/icon_jump.png"
    );
    this.load.image(
      "button_grab",
      "/mobile-controls-1/Sprites/Icons/Default/icon_hand.png"
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
   * LUỒNG MỚI với STRATEGY PATTERN và NETWORK HANDLER:
   * 1. Tạo bộ quy tắc do scene con quyết định (Strategy Pattern)
   * 2. Khởi tạo các chuyên gia Helper
   * 3. Khởi tạo bộ quy tắc với các tham chiếu cần thiết
   * 4. Dùng WorldBuilder để xây dựng thế giới
   * 5. Setup các managers (Input, Camera, Timer)
   * 6. Khởi tạo Network Handler
   * 7. LogicCore nhận vào bộ quy tắc thay vì scene
   * 8. Reset MinigameCore
   */
  protected initializeScene(): void {
    console.log(
      `🚀 ${this.SCENE_NAME}: Orchestrating scene setup with Strategy Pattern...`
    );

    // 0. QUAN TRỌNG: Reset player để tránh conflict giữa các round
    this.player = null as any;
    console.log(` ${this.SCENE_NAME}: Player reset for new round`);

    // THÊM MỚI: Reset cờ khi scene bắt đầu
    this.hasRegisteredBlocks = false;
    this.originalTiles.clear();
    this.lastBlockStates.clear();

    // 1. Tạo bộ quy tắc do scene con quyết định (Strategy Pattern)
    this.rules = this.createRules();
    console.log(` ${this.SCENE_NAME}: Rules created`);

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
    const { platformsLayer, foregroundLayer } = this.worldBuilder.build();
    this.platformsLayer = platformsLayer;
    this.foregroundLayer = foregroundLayer;

    // Lưu lại điểm spawn ban đầu và reset checkpoint
    this.spawnPoint = this.worldBuilder.findPlayerSpawnPoint();
    this.lastCheckpoint = null;
    this.isRespawning = false; // Reset cờ respawn

    // 6. Setup các managers (logic này vẫn giữ lại vì khá đơn giản)
    this.setupPlatformerManagers();

    // 7. Khởi tạo chuyên gia mạng
    this.networkHandler = new PlatformerNetworkHandler(
      this,
      this.platformsLayer
    );

    // 8. LẤY INSTANCE NetworkManager, KHÔNG KẾT NỐI
    this.networkManager = NetworkManager.getInstance();

    // XÓA DÒNG NÀY: this.networkManager.joinGameRoom();
    // RoundManager sẽ xử lý việc join room khi bắt đầu vòng.

    // 9. THAY ĐỔI CÁCH ĐĂNG KÝ LISTENER
    // Xóa listener cũ để đảm bảo không bị trùng lặp từ scene trước
    if (this.networkConnectedHandler) {
      EventBus.off("network-connected", this.networkConnectedHandler);
    }

    // Định nghĩa hàm xử lý và gán vào thuộc tính vừa tạo
    this.networkConnectedHandler = (room: Room<GameRoomState>) => {
      // Kiểm tra scene đã được khởi tạo hoàn toàn chưa
      if (!this.networkHandler || !this.playerHandler || !this.platformsLayer) {
        console.log(
          `🌐 ${this.scene.key} received network-connected but scene not fully initialized. Ignoring.`
        );
        return;
      }

      // Kiểm tra scene có đang visible không (bỏ check isActive vì nó có thể tạm thời false)
      if (!this.scene.isVisible()) {
        console.log(
          `🌐 ${
            this.scene.key
          } received network-connected but scene not visible. Visible: ${this.scene.isVisible()}. Ignoring.`
        );
        return;
      }

      console.log(
        `🌐 network-connected event received in scene: ${this.scene.key}`
      );
      console.log(`🌐 Room details:`, room.name, room.sessionId);
      this.room = room;
      this.networkHandler.initialize(room);

      // <-- SỬA LẠI LISTENER onStateChange CHO GỌN GÀNG -->
      // Sử dụng onStateChange để lắng nghe thay đổi toàn bộ state
      this.room.onStateChange((state) => {
        if (state.players) {
          state.players.forEach(
            (playerState: PlayerStateSchema, sessionId: string) => {
              if (sessionId === this.room?.sessionId) {
                // Chỉ cần truyền state cho Player object
                this.player?.setPlayerState(playerState);
              }
              // BỎ HẾT LOGIC setPosition cho remote player ở đây.
              // NetworkHandler sẽ tự xử lý.
            }
          );
        }
      });

      // THÊM MỚI: Bắt đầu lắng nghe các thay đổi trạng thái của block từ server
      this.listenToBlockChanges();

      // THÊM MỚI: Đăng ký các block của map này với server
      this.registerBlocksWithServer();

      // DEBUG: Kiểm tra room state
      console.log("[Client] Room state after connection:", this.room.state);
      console.log(
        "[Client] DisappearingBlocks in state:",
        this.room.state.disappearingBlocks
      );
    };

    // Đăng ký listener bằng thuộc tính đó
    EventBus.on("network-connected", this.networkConnectedHandler);

    // 10. Reset game core
    this.minigameCore.resetForNewRound();

    // THÊM MỚI: Chủ động emit trạng thái điểm số ban đầu
    // Sau khi resetForNewRound, điểm số được giữ lại từ các vòng trước.
    // Chúng ta cần thông báo cho UI biết giá trị này.
    EventBus.emit("minigame-score-updated", {
      oldScore: this.minigameCore.getCurrentScore(),
      newScore: this.minigameCore.getCurrentScore(),
      change: 0,
    });

    console.log(
      `✅ ${this.SCENE_NAME} initialization completed. Waiting for RoundManager to join room.`
    );

    // Emit event để NetworkManager biết Scene đã sẵn sàng
    EventBus.emit("scene-ready-for-network", this.SCENE_NAME);

    // THÊM MỚI: Lắng nghe sự kiện để điều khiển UI di động
    this.registerMobileUIEventListeners();

    // Thông báo cho React component rằng scene đã sẵn sàng (failsafe cho loading overlay)
    this.notifySceneReady();
  }

  /**
   * ⚙️ SETUP PLATFORMER MANAGERS - Khởi tạo managers chung cho platformer
   */
  private setupPlatformerManagers(): void {
    // Input Manager - xử lý input PC (Arrow keys, WASD, Space)
    this.inputManager = new InputManager(this);

    // THÊM MỚI: Kiểm tra thiết bị để quyết định bật Mobile UI
    this.isMobile =
      (this.sys.game.device.os as any).android ||
      (this.sys.game.device.os as any).iOS ||
      this.cameras.main.width < 1024;

    if (this.isMobile) {
      console.log("📱 Mobile device detected. Creating mobile UI controls.");
      this.mobileUIHandler = new MobileUIHandler(this, this.inputManager);
      this.mobileUIHandler.hide();
    }

    // Camera Manager - follow player với config chuẩn (adjust zoom for mobile)
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
      zoom: this.isMobile ? 0.8 : 1.2,
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

    // THÊM MỚI: Chủ động emit trạng thái timer ban đầu
    // Ngay sau khi timer bắt đầu, hãy gửi trạng thái đầu tiên cho UI.
    EventBus.emit("game-timer-update", {
      timeLeft: gameTimeLimit,
      formatted: this.timerManager.formatTime(gameTimeLimit),
      isWarning: false,
    });
  }

  // === MULTIPLAYER METHODS ===

  /**
   * 🎯 CREATE MAIN PLAYER - Được gọi bởi NetworkHandler để tạo người chơi chính
   * @param playerState Trạng thái ban đầu từ server
   */
  public createMainPlayer(playerState: PlayerStateSchema): void {
    // SỬA ĐỔI: Sử dụng this.spawnPoint đã lưu thay vì gọi lại worldBuilder
    const spawnPoint = this.spawnPoint;

    console.log(
      `🎯 createMainPlayer called. Server suggested: (${playerState.x}, ${playerState.y}), Map requires: (${spawnPoint.x}, ${spawnPoint.y})`
    );

    console.log(
      `🎮 Creating main player at correct map position: ${spawnPoint.x}, ${spawnPoint.y}`
    );

    // 🔧 Null checks trước khi tạo player
    if (!this.playerHandler) {
      console.error(`❌ PlayerHandler is null in ${this.scene.key}`);
      return;
    }
    if (!this.platformsLayer) {
      console.error(`❌ PlatformsLayer is null in ${this.scene.key}`);
      return;
    }
    if (!this.inputManager) {
      console.error(`❌ InputManager is null in ${this.scene.key}`);
      return;
    }

    console.log(`🔧 Creating player with playerHandler:`, !!this.playerHandler);

    // Tạo player tại vị trí ĐÚNG từ map
    this.player = this.playerHandler.spawnPlayer(
      spawnPoint, // <--- SỬA Ở ĐÂY: Sử dụng spawnPoint từ map thay vì từ server
      this.platformsLayer,
      this.inputManager,
      this.cameraManager,
      this.logicCore,
      this.networkManager
    );

    // Sau khi tạo xong, gửi một bản cập nhật vị trí lên server ngay lập tức
    // để các người chơi khác thấy đúng vị trí của bạn.
    const sprite = this.player.getSprite();
    this.networkManager.sendUpdate({
      x: Math.round(sprite.x),
      y: Math.round(sprite.y),
      animState: "idle",
      flipX: false,
    });

    // THÊM MỚI: Setup collision đơn giản
    this.setupSimplePlayerCollision();

    // Setup interactive objects CHỈ SAU KHI player chính được tạo
    this.worldBuilder.setupInteractiveObjects(
      this.player.getSprite(),
      this.logicCore
    );

    console.log(
      `✅ Main player created successfully at correct map position: ${spawnPoint.x}, ${spawnPoint.y}`
    );
  }

  // THÊM MỚI: Setup collision đơn giản - chỉ chặn và cho phép đứng trên đầu
  private setupSimplePlayerCollision(): void {
    const mainPlayerSprite = this.player.getSprite();
    const remotePlayersGroup = this.networkHandler.getRemotePlayersGroup();

    // ĐƠN GIẢN: CHỈ CẦN MỘT COLLIDER để chặn va chạm
    this.physics.add.collider(
      mainPlayerSprite,
      remotePlayersGroup,
      undefined, // Không cần callback phức tạp
      this.checkCanStandOnTop, // Chỉ kiểm tra có thể đứng trên đầu không
      this
    );

    console.log("🤝 Simple collision enabled: Wall + Platform mode");
  }

  // THÊM MỚI: Kiểm tra đơn giản - chỉ cho phép đứng trên đầu
  private checkCanStandOnTop = (object1: any, object2: any): boolean => {
    const obj1 = object1 as any;
    const obj2 = object2 as any;

    if (!obj1.body || !obj2.body) {
      return true; // Mặc định cho phép va chạm
    }

    const mainPlayerBody = obj1.body as Phaser.Physics.Arcade.Body;
    const remotePlayerBody = obj2.body as Phaser.Physics.Arcade.Body;

    // Kiểm tra đơn giản: có phải đang nhảy xuống từ trên không?
    const tolerance = 0;
    const isFallingOnTop =
      mainPlayerBody.velocity.y > 0 && // Đang rơi xuống
      mainPlayerBody.bottom <= remotePlayerBody.top + tolerance; // Chân main player gần đầu remote player

    // LUÔN LUÔN set immovable = true để remote player như bức tường/platform
    remotePlayerBody.setImmovable(true);

    if (isFallingOnTop) {
      console.log("👆 Standing on player!");
    } else {
      console.log("🧱 Wall collision!");
    }

    return true; // Luôn cho phép va chạm để chặn hoặc đứng trên đầu
  };

  // === UPDATE LOOP ===

  /**
   * � UPDATE - Game loop cực kỳ gọn gàng với Network Handler
   */
  update(): void {
    // Chỉ cần ra lệnh cho các thành phần tự cập nhật
    this.player?.update();
    this.networkHandler?.update();
    // THÊM MỚI: Cập nhật trạng thái cát lún cho player handler
    this.playerHandler?.update();
  }

  // === PUBLIC API - Cho React components ===

  /**
   * 📍 GET PLAYER POSITION - API cho React
   */
  public getPlayerPosition() {
    return this.player ? this.player.getPosition() : null;
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

  /**
   * 👤 GET USER DISPLAY NAME - Lấy tên hiển thị của người chơi
   * Default: "You"
   */
  public getUserDisplayName(): string {
    const userData = this.getRoundData()?.user;
    // Ưu tiên fullName, sau đó name, cuối cùng fallback
    return userData?.fullName || userData?.name || userData?.username || "You";
  }

  // === DISAPPEARING BLOCKS LOGIC ===

  /**
   * THÊM MỚI: Quét tilemap, tìm và gửi thông tin các block biến mất lên server.
   */
  private registerBlocksWithServer(): void {
    if (!this.room) {
      console.error("[Client] Cannot register blocks: no room available");
      return;
    }

    if (this.hasRegisteredBlocks) {
      console.log("[Client] Blocks already registered, skipping");
      return;
    }

    console.log("[Client] Scanning tilemap for disappearing blocks...");
    const blocksData: { id: string; x: number; y: number }[] = [];

    this.platformsLayer.forEachTile((tile) => {
      if (tile && tile.properties.type === "disappearing") {
        const tileId = `${tile.x}_${tile.y}`;
        blocksData.push({ id: tileId, x: tile.x, y: tile.y });

        // Lưu lại tile gốc để có thể tìm và thao tác sau này
        this.originalTiles.set(tileId, tile);
        console.log(
          `[Client] Found disappearing block: ${tileId} at (${tile.x}, ${tile.y})`
        );
      }
    });

    if (blocksData.length > 0) {
      console.log(
        `[Client] Registering ${blocksData.length} disappearing blocks with server:`,
        blocksData
      );
      this.room.send("registerDisappearingBlocks", blocksData);
      this.hasRegisteredBlocks = true; // Đánh dấu đã đăng ký
    } else {
      console.log("[Client] No disappearing blocks found in tilemap");
    }
  }

  /**
   * THÊM MỚI: Lắng nghe và phản hồi các thay đổi trạng thái từ server.
   */
  private listenToBlockChanges(): void {
    if (!this.room) {
      console.error(
        "[Client] Cannot listen to block changes: no room available"
      );
      return;
    }

    console.log("[Client] Setting up block change listeners...");

    // Sử dụng onStateChange để lắng nghe tất cả thay đổi
    this.room.onStateChange((state: any) => {
      console.log(
        "[Client] Room state changed, checking disappearing blocks..."
      );

      if (state.disappearingBlocks) {
        state.disappearingBlocks.forEach((block: any, blockId: string) => {
          // Kiểm tra xem state của block này có thay đổi không
          const currentState = block.state;
          const lastKnownState = this.lastBlockStates.get(blockId);

          if (lastKnownState !== currentState) {
            console.log(
              `[Client] Block ${blockId} state changed from ${lastKnownState} to ${currentState}`
            );
            this.updateTileVisuals(blockId, currentState);
            this.lastBlockStates.set(blockId, currentState);
          }
        });
      }
    });

    console.log("[Client] Block change listeners setup completed");
  }

  /**
   * THÊM MỚI: Hàm trung tâm để cập nhật hình ảnh của tile dựa trên state từ server.
   */
  private updateTileVisuals(blockId: string, state: string): void {
    const tile = this.originalTiles.get(blockId);
    if (!tile) {
      console.warn(
        `[Client] Cannot find original tile for blockId: ${blockId}`
      );
      return;
    }
    const layer = this.platformsLayer;

    console.log(
      `[Client] Updating tile visuals for ${blockId} to state: ${state}`
    );

    switch (state) {
      case "triggered":
        const existingTileTriggered = layer.getTileAt(tile.x, tile.y);
        if (existingTileTriggered) {
          this.tweens.add({
            targets: existingTileTriggered,
            alpha: 0.2,
            yoyo: true,
            repeat: 5,
            duration: 150,
          });
          console.log(`[Client] Started shake animation for tile ${blockId}`);
        }
        break;
      case "gone":
        // QUAN TRỌNG: Xóa tile và cập nhật collision
        const removedTile = layer.removeTileAt(tile.x, tile.y);
        if (removedTile) {
          // Cập nhật collision map để tile không còn collision
          layer.setCollisionByProperty({ collides: true }); // Refresh collision
          console.log(`[Client] Removed tile ${blockId} and updated collision`);
        }
        break;
      case "idle":
        // Chỉ đặt lại tile nếu nó chưa tồn tại ở đó
        if (!layer.hasTileAt(tile.x, tile.y)) {
          const newTile = layer.putTileAt(tile.index, tile.x, tile.y);
          if (newTile) {
            // Khôi phục properties từ tile gốc
            Object.assign(newTile.properties, tile.properties);
            newTile.setAlpha(1); // Đảm bảo nó hiện rõ

            // QUAN TRỌNG: Cập nhật collision cho tile mới
            if (tile.properties.collides) {
              newTile.setCollision(true);
            }
            layer.setCollisionByProperty({ collides: true }); // Refresh collision
            console.log(`[Client] Restored tile ${blockId} with collision`);
          }
        }
        break;
    }
  }

  /**
   * SỬA ĐỔI HOÀN TOÀN: Hàm này giờ xử lý nhiều loại tile khác nhau.
   */
  public handlePlayerOnPlatformTile(tile: Phaser.Tilemaps.Tile): void {
    // THÊM MỚI: Kiểm tra xem có phải tile nguy hiểm không
    if (tile.properties.hazard === true) {
      // Nếu đúng, gọi một phương thức xử lý cái chết riêng
      this.handlePlayerDeathByHazard(tile);
      return; // Dừng xử lý các loại tile khác
    }

    if (tile.properties.type === "disappearing" && this.room) {
      const tileId = `${tile.x}_${tile.y}`;
      console.log(`[Client] Player hit disappearing block: ${tileId}`);
      // Gửi tin nhắn lên server, báo rằng block này đã bị chạm vào.
      // Server sẽ quyết định xem có nên kích hoạt block hay không (dựa trên trạng thái hiện tại của nó).
      this.room.send("playerHitBlock", { blockId: tileId });
      console.log(`[Client] Sent playerHitBlock message for ${tileId}`);
    }
    // Logic cho các loại tile khác có thể được thêm vào đây
  }

  // === CLEANUP ===

  /**
   * 🗑️ CLEANUP ON SHUTDOWN - Override từ BaseGameScene
   */
  protected cleanupOnShutdown(): void {
    console.log(`🗑️ ${this.SCENE_NAME}: Starting cleanup...`);

    // Dọn dẹp Mobile UI Handler
    this.mobileUIHandler?.destroy();
    this.mobileUIHandler = undefined;

    super.cleanupOnShutdown();

    // GỠ BỎ LISTENER KHI SCENE BỊ HỦY
    // Đây là bước quan trọng nhất để sửa lỗi
    if (this.networkConnectedHandler) {
      EventBus.off("network-connected", this.networkConnectedHandler);
      console.log(`🗑️ ${this.SCENE_NAME}: Removed network-connected listener.`);
      this.networkConnectedHandler = null as any;
    }

    // Ra lệnh cho các chuyên gia tự dọn dẹp
    this.networkHandler?.cleanup();
    this.networkManager?.leaveCurrentRoom();

    // QUAN TRỌNG: Cleanup player trước khi chuyển scene
    if (this.player) {
      console.log(`🗑️ ${this.SCENE_NAME}: Cleaning up player`);
      this.player.destroy();
      this.player = null as any;
    }

    // Cleanup bộ quy tắc TRƯỚC khi cleanup các component khác
    this.rules?.cleanup();

    // Cleanup platformer-specific resources
    this.timerManager?.destroy();
    this.logicCore?.cleanup();

    // Cleanup network handler để tránh duplicate events
    this.networkHandler?.cleanup();

    // Cleanup các chuyên gia helpers
    this.worldBuilder?.cleanup();
    this.playerHandler?.cleanup();

    console.log(`🗑️ ${this.SCENE_NAME} platformer cleanup completed.`);
  }

  // THÊM MỚI: Quản lý event listeners cho Mobile UI
  private registerMobileUIEventListeners(): void {
    if (!this.isMobile) return;

    const showControls = () => this.mobileUIHandler?.show();
    const hideControls = () => this.mobileUIHandler?.hide();

    EventBus.on("scene-loading-user-start", showControls, this);
    EventBus.on("show-quiz-overlay", hideControls, this);
    EventBus.on("quiz-completed", hideControls, this);

    this.events.on(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        EventBus.off("scene-loading-user-start", showControls, this);
        EventBus.off("show-quiz-overlay", hideControls, this);
        EventBus.off("quiz-completed", hideControls, this);
      },
      this
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

  // ===============================================
  // === CÁC PHƯƠNG THỨC CHO TÍNH NĂNG NẮM VÀ THOÁT ===
  // ===============================================

  /**
   * Tìm người chơi khác gần nhất trong một khoảng cách.
   */
  public findClosestRemotePlayer(
    x: number,
    y: number,
    maxDistance: number
  ): { sessionId: string; distance: number } | null {
    return this.networkHandler.findClosestRemotePlayer(x, y, maxDistance);
  }

  /**
   * THÊM MỚI: Xử lý bỏ nắm khi player chết
   */
  public handlePlayerDeath(): void {
    if (this.room && this.player) {
      // Gửi message để server biết player này chết và cần bỏ tất cả grab
      this.room.send("playerDied");
    }
  }

  // ===============================================
  // === THÊM MỚI CÁC PHƯƠNG THỨC CHECKPOINT/RESPAWN ===
  // ===============================================

  /**
   * 🚩 SET CHECKPOINT - Được gọi bởi Rules khi người chơi chạm vào checkpoint
   * @param position Vị trí của checkpoint mới
   * @returns {boolean} Trả về true nếu checkpoint được cập nhật, false nếu nó đã được kích hoạt rồi.
   */
  public setCheckpoint(position: { x: number; y: number }): boolean {
    // Chỉ cập nhật nếu đây là một checkpoint mới
    if (
      this.lastCheckpoint?.x !== position.x ||
      this.lastCheckpoint?.y !== position.y
    ) {
      this.lastCheckpoint = position;
      console.log(`🚩 New checkpoint set at:`, position);

      // Hiệu ứng nhỏ để báo cho người chơi
      this.cameraManager.flash(0xffff00, 200);
      return true;
    }
    return false; // Checkpoint này đã được kích hoạt trước đó
  }

  /**
   * 💀 HANDLE PLAYER FALL - Được gọi bởi Player khi nó rơi ra khỏi map
   */
  public async handlePlayerFall(): Promise<void> {
    if (this.isRespawning) return; // Nếu đang trong quá trình respawn thì bỏ qua

    this.isRespawning = true;
    console.log("💀 Handling player fall...");

    // 1. Chơi âm thanh thất bại (nếu có)
    // this.sound.play("fall_sfx");

    // 2. Làm mờ màn hình
    await this.cameraManager.fade(0x000000, 300);

    // 3. Xác định vị trí hồi sinh
    // Nếu có checkpoint thì dùng checkpoint, không thì dùng player_start
    const respawnPosition = this.lastCheckpoint || this.spawnPoint;

    if (this.lastCheckpoint) {
      console.log(
        `💀 Respawning at last checkpoint: (${respawnPosition.x}, ${respawnPosition.y})`
      );
    } else {
      console.log(
        `💀 No checkpoint found, respawning at player_start: (${respawnPosition.x}, ${respawnPosition.y})`
      );
    }

    // 4. Gọi chuyên gia để thực hiện hồi sinh
    this.playerHandler.respawnPlayer(this.player, respawnPosition);

    // 5. Làm sáng màn hình trở lại
    await this.cameraManager.fadeIn(300);

    // 6. Reset cờ
    this.isRespawning = false;
  }

  /**
   * THÊM MỚI: HANDLE PLAYER DEATH BY HAZARD - Được gọi khi người chơi chết do va chạm vật nguy hiểm
   */
  public async handlePlayerDeathByHazard(
    hazardTile: Phaser.Tilemaps.Tile
  ): Promise<void> {
    if (this.isRespawning) return; // Nếu đang trong quá trình respawn thì bỏ qua

    this.isRespawning = true;
    console.log("💀 Handling player death by hazard...");

    // 1. Ủy quyền cho Rules xử lý hình phạt (trừ điểm, v.v.)
    this.rules.handleHazardCollision(hazardTile, this);

    // 2. Gửi thông báo lên server để xử lý logic multiplayer (ví dụ: bỏ nắm)
    // Tái sử dụng lại phương thức đã có!
    this.handlePlayerDeath();

    // 3. Làm mờ màn hình
    await this.cameraManager.fade(0x000000, 300);

    // 4. Xác định vị trí hồi sinh
    const respawnPosition = this.lastCheckpoint || this.spawnPoint;

    if (this.lastCheckpoint) {
      console.log(
        `💀 Respawning at last checkpoint: (${respawnPosition.x}, ${respawnPosition.y})`
      );
    } else {
      console.log(
        `💀 No checkpoint found, respawning at player_start: (${respawnPosition.x}, ${respawnPosition.y})`
      );
    }

    // 5. Gọi chuyên gia để thực hiện hồi sinh
    this.playerHandler.respawnPlayer(this.player, respawnPosition);

    // 6. Làm sáng màn hình trở lại
    await this.cameraManager.fadeIn(300);

    // 7. Reset cờ
    this.isRespawning = false;
  }
}
