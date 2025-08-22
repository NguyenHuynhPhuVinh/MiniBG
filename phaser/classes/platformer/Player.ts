import { Scene } from "phaser";
import { AnimationManager, AnimationState } from "./AnimationManager";
import { InputManager } from "./InputManager";
import { CameraManager } from "./CameraManager";
import { CharacterAnimations, DEFAULT_CHARACTER } from "./CharacterFrames";
import { NetworkManager } from "../core/NetworkManager";
import { TextUtils } from "../../utils/TextUtils"; // <-- THÊM MỚI
// THÊM MỚI: Import BasePlatformerScene để có thể gọi phương thức của nó
import { BasePlatformerScene } from "../../scenes";
import { Player as PlayerStateSchema } from "../core/types/GameRoomState"; // Import schema để type hinting
import { InterpolationUtils } from "../../utils/InterpolationUtils";
import {
  IStatusEffect,
  KnockbackEffect,
  NoHorizontalMoveEffect,
  NoJumpEffect,
  SpringLaunchEffect,
  SwimmingEffect,
} from "./effects";

// ======================== THÊM HẰNG SỐ CHO HỆ THỐNG TRUYỀN LỰC ĐẨY ========================
const KNOCKBACK_FORCE_MULTIPLIER = 0.7; // lực văng
// ===================================================================

export interface PlayerConfig {
  x: number;
  y: number;
  texture: string;
  username: string; // <-- THÊM MỚI
  characterData?: CharacterAnimations;
  physics?: {
    speed: number;
    jumpPower: number;
    gravity: number;
    bounce: number;
  };
}

/**
 * 🏃 PLAYER CLASS (Multiplayer-First)
 *
 * Phiên bản được tái cấu trúc hoàn toàn cho multiplayer.
 * Lớp này không còn chứa StateMachine hay Command Pattern.
 *
 * TRÁCH NHIỆM:
 * - Đọc input từ InputManager.
 * - Áp dụng vật lý cục bộ để dự đoán chuyển động (Client-Side Prediction).
 * - Gửi trạng thái (vị trí, animation) lên server.
 * - Quản lý các component trực thuộc như AnimationManager và CameraManager.
 */
export class Player {
  // === CORE COMPONENTS ===
  // SỬA ĐỔI: Thay Scene bằng BasePlatformerScene để có thể truy cập các phương thức respawn
  private scene: BasePlatformerScene;
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private nameTag!: Phaser.GameObjects.Text; // <-- THÊM MỚI
  private animationManager!: AnimationManager;

  private inputManager: InputManager;
  private cameraManager: CameraManager;
  private config: Required<PlayerConfig>;
  private networkManager: NetworkManager;
  private lastSentState: {
    x?: number;
    y?: number;
    animState?: string;
    flipX?: boolean;
  } = {};

  // THÊM MỚI: Cờ để tránh gọi respawn nhiều lần
  private isDead: boolean = false;

  // THÊM MỚI: Cooldown cho hành động nhảy để tránh spam nhảy trên đầu người chơi khác
  private jumpCooldown: number = 0;

  // <-- THÊM CÁC BIẾN TRẠNG THÁI MỚI CHO TÍNH NĂM VÀ THOÁT -->
  public playerState: PlayerStateSchema | null = null; // Lưu state từ server
  private struggleCooldown = 0; // Để tránh spam server
  private GRAB_DISTANCE_THRESHOLD = 80; // Khoảng cách tối đa để nắm (pixel)

  // <-- THÊM CÁC THUỘC TÍNH MỚI CHO NỘI SUY DỰA TRÊN VẬN TỐC -->
  private serverTargetPosition: { x: number; y: number } | null = null;
  // (Các hằng số đã gom vào InterpolationUtils)

  // MỚI: Thêm trạng thái để biết khi nào người chơi đang bay lên do lò xo
  // (được thay thế bằng hệ thống StatusEffect)

  // === SNOW EFFECT STATE ===
  private originalPhysics!: { speed: number; jumpPower: number };
  private isOnSnow: boolean = false;
  private wasOnSnowLastFrame: boolean = false;

  // === STATUS EFFECTS MANAGER ===
  private activeEffects: Map<string, IStatusEffect> = new Map();

  // MỚI: Các thuộc tính để theo dõi quãng đường rơi
  private isActivelyFalling: boolean = false;
  private fallStartHeight: number = 0;

  // === SWIMMING STATE ===
  private isInWaterThisFrame: boolean = false;

  // === FALL-THROUGH STATE ===
  // THÊM MỚI: Sử dụng 2 cờ trạng thái để tránh race condition
  private isInFallZone: boolean = false; // Cờ trạng thái "bền bỉ"
  public wasInFallZoneThisFrame: boolean = false; // Cờ "cảm biến" tạm thời, public để WorldBuilder có thể set

  constructor(
    // SỬA ĐỔI: Thay Scene bằng BasePlatformerScene
    scene: BasePlatformerScene,
    config: PlayerConfig,
    inputManager: InputManager,
    cameraManager: CameraManager,
    networkManager: NetworkManager
  ) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.cameraManager = cameraManager;
    this.networkManager = networkManager;
    this.config = {
      x: config.x,
      y: config.y,
      texture: config.texture,
      username: config.username, // <-- THÊM MỚI
      characterData: config.characterData || DEFAULT_CHARACTER,
      physics: config.physics || {
        speed: 200,
        jumpPower: 400,
        gravity: 800,
        bounce: 0.2,
      },
    };

    this.setupFrames();
    this.createSprite();
    this.createNameTag(); // <-- THÊM MỚI: Gọi hàm tạo name tag

    // 🔧 Check if sprite creation succeeded
    if (!this.sprite) {
      console.error(
        `❌ Player sprite creation failed, aborting initialization`
      );
      return;
    }

    this.setupPhysics();
    this.setupAnimations();
    this.setupCamera();
  }

  // THÊM DÒNG NÀY: Lưu lại cấu hình vật lý ban đầu SAU khi this.config được thiết lập
  // Ghi chú: Đặt sau constructor phần set this.config ở trên
  // (Được chèn hợp lý trong constructor khi this.config đã có physics)
  // Initialize original physics baselines
  // (Keep defaults in case physics is undefined for safety, though config ensures it exists)
  private initializeOriginalPhysicsOnce(): void {
    if (!this.originalPhysics) {
      this.originalPhysics = {
        speed: this.config.physics.speed,
        jumpPower: this.config.physics.jumpPower,
      };
    }
  }

  // <-- THÊM PHƯƠNG THỨC MỚI -->
  /**
   * Cập nhật trạng thái cục bộ của player từ server.
   * Được gọi bởi BasePlatformerScene.
   */
  public setPlayerState(newState: PlayerStateSchema): void {
    const wasGrabbed = this.playerState?.isGrabbed;
    this.playerState = newState;

    if (newState.isGrabbed) {
      // Lưu mục tiêu từ server
      const firstTarget = !this.serverTargetPosition;
      this.serverTargetPosition = { x: newState.x, y: newState.y };
      // Nếu vừa bị nắm, teleport ngay để tránh giật từ xa
      if (firstTarget && this.sprite) {
        this.sprite.setPosition(newState.x, newState.y);
      }
    } else {
      this.serverTargetPosition = null;
    }
  }

  /**
   * MỚI: Được gọi bởi Scene khi người chơi va chạm với lò xo.
   * Thay vì cờ boolean, dùng hiệu ứng trạng thái.
   */
  public setSpringLaunched(): void {
    this.addStatusEffect(new SpringLaunchEffect());
  }

  /**
   * Cung cấp một phương thức công khai để các hệ thống khác kiểm tra trạng thái.
   */
  public getIsSpringLaunched(): boolean {
    return this.hasStatusEffect("spring_launch");
  }

  /**
   * Kích hoạt trạng thái "đang bị đẩy ngang" bằng hiệu ứng (khóa di chuyển ngang/nhảy tạm thời).
   */
  public setHorizontallyLaunched(): void {
    this.addStatusEffect(new NoHorizontalMoveEffect(1500));
    this.addStatusEffect(new NoJumpEffect(1500));
  }

  /**
   * Cung cấp phương thức công khai để Rules có thể kiểm tra trạng thái này.
   */
  public getIsHorizontallyLaunched(): boolean {
    return this.hasStatusEffect("no_horizontal_move");
  }

  // === SNOW EFFECT API ===
  /**
   * ❄️ Áp dụng hiệu ứng đi trên tuyết (chậm và nhảy thấp).
   */
  public applySnowEffect(): void {
    this.initializeOriginalPhysicsOnce();
    this.config.physics.speed = this.originalPhysics.speed * 0.6;
    this.config.physics.jumpPower = this.originalPhysics.jumpPower * 0.7;
  }

  /**
   * ☀️ Reset các thuộc tính vật lý về trạng thái mặc định.
   */
  public resetPhysicsToDefault(): void {
    this.initializeOriginalPhysicsOnce();
    this.config.physics.speed = this.originalPhysics.speed;
    this.config.physics.jumpPower = this.originalPhysics.jumpPower;
  }

  /**
   * Cờ cho biết frame hiện tại có đang đứng trên tuyết không.
   */
  public setOnSnow(isOnSnow: boolean): void {
    this.isOnSnow = isOnSnow;
  }

  /**
   * Cung cấp phương thức công khai để Rules có thể kiểm tra trạng thái knockback.
   */
  public getIsBeingKnockedBack(): boolean {
    return this.hasStatusEffect("knockback");
  }

  // ======================== THÊM PHƯƠNG THỨC MỚI CHO HỆ THỐNG TRUYỀN LỰC ĐẨY ========================
  /**
   * Áp dụng một lực văng từ bên ngoài (do người chơi khác gây ra).
   * @param forceX Lực theo trục X.
   * @param forceY Lực theo trục Y.
   */
  public applyKnockback(forceX: number, forceY: number): void {
    if (!this.sprite || !this.sprite.body) return;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    console.log(
      `[Player] Applying knockback force: ${forceX.toFixed(
        0
      )}, ${forceY.toFixed(0)}`
    );

    body.setVelocity(
      forceX * KNOCKBACK_FORCE_MULTIPLIER,
      forceY * KNOCKBACK_FORCE_MULTIPLIER
    );

    // Áp dụng hiệu ứng để vô hiệu hóa điều khiển trong thời gian ngắn
    this.addStatusEffect(new KnockbackEffect());
  }
  // ===================================================================

  /**
   * MỚI: Cung cấp một phương thức công khai để Scene có thể lấy quãng đường rơi.
   * @returns Quãng đường đã rơi tính bằng pixel.
   */
  public getFallDistance(): number {
    if (this.isActivelyFalling) {
      // Trả về quãng đường rơi hiện tại, đảm bảo không âm
      return Math.max(0, this.sprite.y - this.fallStartHeight);
    }
    return 0; // Trả về 0 nếu không đang trong trạng thái rơi
  }

  private setupFrames(): void {
    const texture = this.scene.textures.get(this.config.texture);
    Object.entries(this.config.characterData).forEach(([, frames]) => {
      frames.forEach((frame: any, index: number) => {
        const frameKey = `char_${frame.x}_${frame.y}_${index}`;
        if (!texture.has(frameKey)) {
          texture.add(frameKey, 0, frame.x, frame.y, frame.width, frame.height);
        }
      });
    });
  }

  private createSprite(): void {
    // 🔧 Safety check cho characterData
    if (!this.config.characterData) {
      console.error(`❌ CharacterData is null, using DEFAULT_CHARACTER`);
      this.config.characterData = DEFAULT_CHARACTER;
    }

    // 🔧 Safety check cho scene và texture
    if (!this.scene) {
      console.error(`❌ Scene is null in Player.createSprite()`);
      return;
    }

    if (!this.scene.textures.exists(this.config.texture)) {
      console.error(`❌ Texture ${this.config.texture} not loaded yet`);
      return;
    }

    const firstFrame = this.config.characterData.idle[0];
    const frameKey = `char_${firstFrame.x}_${firstFrame.y}_0`;

    console.log(
      `🎨 Creating sprite with texture: ${this.config.texture}, frame: ${frameKey}`
    );

    // Kiểm tra scene và physics system trước khi tạo sprite
    if (!this.scene || !this.scene.physics) {
      console.error(
        `❌ Scene or physics system not available for sprite creation`
      );
      return;
    }

    this.sprite = this.scene.physics.add.sprite(
      this.config.x,
      this.config.y,
      this.config.texture,
      frameKey
    );

    if (!this.sprite) {
      console.error(`❌ Failed to create sprite`);
      return;
    }

    this.sprite.setDisplaySize(96, 96);
  }

  private createNameTag(): void {
    // <-- THÊM MỚI: Hàm tạo name tag
    if (!this.sprite) return;

    // Sử dụng TextUtils để tạo name tag chất lượng cao
    this.nameTag = TextUtils.createPlayerNameTag(
      this.scene,
      this.sprite.x,
      this.sprite.y - 60,
      this.config.username,
      true // isLocalPlayer = true
    );

    // Thêm hiệu ứng fade in cho name tag
    TextUtils.fadeInText(this.nameTag, 300);
  }

  private setupPhysics(): void {
    if (!this.sprite) {
      console.error(`❌ Cannot setup physics: sprite is null`);
      return;
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setBounce(this.config.physics.bounce);
    // SỬA LẠI: Giữ nguyên collision với world bounds để không xuyên qua platform
    body.setCollideWorldBounds(true);
    body.setGravityY(this.config.physics.gravity);

    // THÊM/SỬA ĐỔI CÁC DÒNG NÀY
    body.setSize(48, 80); // Thu nhỏ hitbox một chút để tránh va chạm không mong muốn
    body.setOffset(40, 48); // Điều chỉnh offset cho phù hợp
    body.pushable = false; // Đảm bảo người chơi chính cũng có thể bị đẩy
  }

  private setupAnimations(): void {
    this.animationManager = new AnimationManager(
      this.scene,
      this.sprite,
      this.config.characterData
    );
  }

  private setupCamera(): void {
    this.cameraManager.followTarget(this.sprite);
  }

  /**
   * Được gọi bởi WaterBehavior mỗi frame khi người chơi ở trong nước.
   * Phương thức này sẽ kích hoạt và duy trì trạng thái bơi.
   */
  public markAsInWater(): void {
    this.isInWaterThisFrame = true;
    // Nếu chưa bơi, bắt đầu bơi
    if (!this.hasStatusEffect("swimming")) {
      this.addStatusEffect(new SwimmingEffect());
    }
  }

  /**
   * 🔄 UPDATE - Logic mới với tính năng nắm và thoát
   */
  public update(): void {
    // === LOGIC MỚI: CẬP NHẬT TRẠNG THÁI TRƯỚC VẬT LÝ ===
    // Logic này chạy ở đầu mỗi frame, TRƯỚC KHI engine vật lý hoạt động.
    // Nó quyết định trạng thái cho frame HIỆN TẠI dựa trên kết quả của frame TRƯỚC.

    // 1. Nếu cảm biến của frame trước KHÔNG được bật -> tức là ta đã ra khỏi zone.
    if (!this.wasInFallZoneThisFrame) {
      this.isInFallZone = false; // Tắt trạng thái rơi bền bỉ.
    }

    // 2. Reset cảm biến cho frame hiện tại.
    // Overlap sẽ bật lại nó nếu cần.
    this.wasInFallZoneThisFrame = false;
    // =======================================================
    // === 1) Cập nhật tất cả Status Effects và dọn dẹp ===
    const dt = this.scene.game.loop.delta;
    const finishedEffects: string[] = [];
    for (const effect of this.activeEffects.values()) {
      effect.update(dt, this);
      if (effect.isFinished) finishedEffects.push(effect.id);
    }
    finishedEffects.forEach((id) => this.removeStatusEffect(id));

    // === 2) Quản lý hiệu ứng Tuyết theo frame flags ===
    if (
      this.wasOnSnowLastFrame &&
      !this.isOnSnow &&
      this.hasStatusEffect("snow_slow")
    ) {
      this.removeStatusEffect("snow_slow");
    }
    this.wasOnSnowLastFrame = this.isOnSnow;
    this.isOnSnow = false;

    // === 3) LOGIC MỚI: Kiểm tra xem người chơi vừa rời khỏi nước ===
    // Nếu frame trước đang bơi VÀ frame này không còn trong nước -> gỡ hiệu ứng
    if (this.hasStatusEffect("swimming") && !this.isInWaterThisFrame) {
      this.removeStatusEffect("swimming");
    }

    if (!this.sprite || !this.sprite.body || this.isDead || !this.playerState)
      return;

    // THÊM MỚI: KIỂM TRA RƠI KHỎI MAP
    const worldHeight = this.scene.physics.world.bounds.height;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    if (this.sprite.y >= worldHeight - 60) {
      this.isDead = true;
      console.log(
        `💀 Player has fallen to the bottom danger zone at Y: ${this.sprite.y} (world height: ${worldHeight}). Triggering respawn.`
      );
      // THÊM MỚI: Bỏ nắm khi chết
      this.scene.handlePlayerDeath();
      this.scene.handlePlayerFall();
      return;
    }

    // --- LOGIC THEO DÕI QUÃNG ĐƯỜNG RƠI MỚI ---
    const isOnGround = body.blocked.down || body.touching.down;

    // 1. Phát hiện thời điểm BẮT ĐẦU rơi
    if (!isOnGround && body.velocity.y > 0 && !this.isActivelyFalling) {
      this.isActivelyFalling = true;
      this.fallStartHeight = this.sprite.y; // Ghi lại độ cao khi bắt đầu rơi
      console.log(
        `FALL TRACKING: Started falling at Y=${this.fallStartHeight.toFixed(0)}`
      );
    }

    // 2. Phát hiện thời điểm TIẾP ĐẤT (hoặc va chạm thứ gì đó bên dưới)
    if (isOnGround && this.isActivelyFalling) {
      this.isActivelyFalling = false;
      const fallDistance = this.sprite.y - this.fallStartHeight;
      console.log(
        `FALL TRACKING: Landed. Total fall distance: ${fallDistance.toFixed(
          0
        )} pixels.`
      );
    }
    // ------------------------------------------

    const inputState = this.inputManager.update();
    // (Các hiệu ứng sẽ tự cập nhật và kết thúc; không còn cần logic reset thủ công)

    // =======================================================
    // === LOGIC MỚI: SẮP XẾP LẠI THỨ TỰ ƯU TIÊN ===
    // =======================================================

    // ƯU TIÊN 1: Nếu đang bị knockback, để cho vật lý tự do hoạt động.
    if (this.hasStatusEffect("knockback")) {
      // Không làm gì cả. Điều này cho phép vận tốc từ `applyKnockback()`
      // được duy trì cho đến khi hiệu ứng kết thúc.
      // Trọng lực vẫn sẽ được áp dụng bởi Arcade Physics.
    }
    // ƯU TIÊN 2: Nếu bị nắm/bế VÀ KHÔNG bị knockback, hãy bám theo người bế.
    else if (this.playerState.isGrabbed && this.serverTargetPosition) {
      // ----- LOGIC KHI BỊ NẮM/BẾ (GIỮ NGUYÊN) -----
      body.setAllowGravity(false);
      body.setVelocity(0, 0);
      InterpolationUtils.updateVelocity(this.sprite, this.serverTargetPosition);
      // ... (phần xử lý animation vùng vẫy và struggle giữ nguyên) ...
      const isTryingToMove = inputState.left || inputState.right;
      if (isTryingToMove) {
        this.animationManager.playAnimation("walk");
        this.sprite.setFlipX(inputState.left);
      } else {
        this.animationManager.playAnimation(
          this.playerState.animState as AnimationState
        );
        this.sprite.setFlipX(this.playerState.flipX);
      }
      const isStruggling =
        inputState.left || inputState.right || inputState.jump;
      if (isStruggling && this.scene.time.now > this.struggleCooldown) {
        this.networkManager.room?.send("struggle");
        this.struggleCooldown = this.scene.time.now + 100;
      }
    }
    // ƯU TIÊN 3: Nếu không có gì đặc biệt, xử lý di chuyển bình thường.
    else {
      // ----- PHÂN NHÁNH ĐIỀU KHIỂN: BƠI vs BÌNH THƯỜNG -----
      if (!body.allowGravity) {
        body.setAllowGravity(true);
      }

      if (this.hasStatusEffect("swimming")) {
        // === LOGIC KHI ĐANG BƠI ===

        // 1. Di chuyển ngang trong nước
        if (inputState.left) {
          body.setVelocityX(-this.config.physics.speed);
        } else if (inputState.right) {
          body.setVelocityX(this.config.physics.speed);
        } else {
          // Giảm tốc dần trong nước
          body.setVelocityX(body.velocity.x * 0.95);
        }

        // 2. Bơi lên (thay cho nhảy)
        if (inputState.jump) {
          body.setVelocityY(-this.config.physics.jumpPower);
          // Có thể thêm âm thanh bơi ở đây nếu muốn
        }

        // 3. Cập nhật Animation (tái sử dụng animation có sẵn)
        // Nếu có di chuyển (ngang hoặc dọc) -> dùng animation 'walk' như đang đạp nước
        if (Math.abs(body.velocity.x) > 10 || Math.abs(body.velocity.y) > 10) {
          this.animationManager.playAnimation("walk");
        } else {
          // Nếu đứng yên -> dùng animation 'fall' như đang nổi
          this.animationManager.playAnimation("fall");
        }
        // Lật sprite theo hướng di chuyển
        if (body.velocity.x > 0) this.animationManager.setFlipX(false);
        else if (body.velocity.x < 0) this.animationManager.setFlipX(true);
      } else {
        // === LOGIC DI CHUYỂN BÌNH THƯỜNG (TRÊN CẠN/KHÔNG TRUNG) ===
        if (!this.hasStatusEffect("no_horizontal_move")) {
          if (inputState.left) {
            body.setVelocityX(-this.config.physics.speed);
          } else if (inputState.right) {
            body.setVelocityX(this.config.physics.speed);
          } else {
            body.setVelocityX(0);
          }
        }
        if (
          !this.hasStatusEffect("no_jump") &&
          inputState.jump &&
          body.blocked.down &&
          this.scene.time.now > this.jumpCooldown
        ) {
          body.setVelocityY(-this.config.physics.jumpPower);
          this.scene.sound.play("jump");
          this.jumpCooldown = this.scene.time.now + 300;
        }
      }
    }

    // Cập nhật animation - chỉ cho trường hợp không bơi (swimming tự xử lý animation)
    if (!this.hasStatusEffect("swimming")) {
      this.animationManager.updateAnimation(body.velocity, body.blocked.down);
    }

    // ----- LOGIC CHUNG CHO CẢ HAI TRẠNG THÁI -----

    // 4. Xử lý hành động "nắm" hoặc "bỏ nắm"
    if (this.inputManager.isJustPressed("grab")) {
      if (this.playerState.isGrabbing) {
        // Nếu đang nắm ai đó -> bỏ nắm
        console.log(`[Client] Requesting to release grab`);
        this.networkManager.room?.send("requestGrab", {
          targetSessionId: this.playerState.isGrabbing,
        });
      } else {
        // Nếu không nắm ai -> tìm người để nắm
        const closestRemotePlayer = this.scene.findClosestRemotePlayer(
          this.sprite.x,
          this.sprite.y,
          this.GRAB_DISTANCE_THRESHOLD
        );
        if (closestRemotePlayer) {
          console.log(
            `[Client] Requesting to grab ${closestRemotePlayer.sessionId}`
          );
          this.networkManager.room?.send("requestGrab", {
            targetSessionId: closestRemotePlayer.sessionId,
          });
        }
      }
    }

    // --- THÊM LOGIC MỚI DƯỚI ĐÂY ---
    // Xử lý hành động "bế" hoặc "ném"
    if (this.inputManager.isJustPressed("carry")) {
      // 'F' key
      // ======================== BẮT ĐẦU SỬA ĐỔI ========================

      // Case 1: Nếu đang BẾ -> thực hiện NÉM
      if (this.playerState.interactionState === "carry") {
        console.log("[Client] Requesting interaction change (throw)");
        this.networkManager.room?.send("requestInteractionChange");
      }
      // Case 2: Nếu đang NẮM -> thực hiện chuyển sang BẾ
      else if (this.playerState.interactionState === "grab") {
        console.log("[Client] Requesting interaction change (grab -> carry)");
        // Server đã biết cách xử lý message này để chuyển từ grab -> carry
        this.networkManager.room?.send("requestInteractionChange");
      }
      // Case 3: Nếu không làm gì -> thực hiện BẾ TRỰC TIẾP
      else {
        const closestRemotePlayer = this.scene.findClosestRemotePlayer(
          this.sprite.x,
          this.sprite.y,
          this.GRAB_DISTANCE_THRESHOLD
        );
        if (closestRemotePlayer) {
          console.log(
            `[Client] Requesting to DIRECTLY CARRY ${closestRemotePlayer.sessionId}`
          );
          // Gửi message mới để bế trực tiếp
          this.networkManager.room?.send("requestDirectCarry", {
            targetSessionId: closestRemotePlayer.sessionId,
          });
        }
      }

      // ======================== KẾT THÚC SỬA ĐỔI ========================
    }

    // 5. Gửi trạng thái lên server (giữ nguyên)
    // QUAN TRỌNG: Vẫn gửi update vị trí, vì khi bị nắm, server sẽ ghi đè lên vị trí này.
    // Điều này đảm bảo khi được thả ra, vị trí của bạn là chính xác.
    const currentState = {
      x: Math.round(this.sprite.x),
      y: Math.round(this.sprite.y),
      animState: this.animationManager.getCurrentState(),
      flipX: this.sprite.flipX,
    };

    if (
      currentState.x !== this.lastSentState.x ||
      currentState.y !== this.lastSentState.y ||
      currentState.animState !== this.lastSentState.animState ||
      currentState.flipX !== this.lastSentState.flipX
    ) {
      this.networkManager.sendUpdate(currentState);
      this.lastSentState = currentState;
    }

    // 6. Cập nhật camera và name tag (giữ nguyên)
    this.cameraManager.update();
    if (this.nameTag) {
      this.nameTag.x = this.sprite.x;
      this.nameTag.y = this.sprite.y - 60;
    }

    // === LOGIC MỚI: Reset cờ nước cho frame tiếp theo ===
    // Phải đặt ở cuối hàm update
    this.isInWaterThisFrame = false;
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * THÊM MỚI: Áp dụng một lực từ bên ngoài (ví dụ: gió, dòng nước).
   * Lực này sẽ được cộng dồn vào vận tốc hiện tại của người chơi.
   * @param force - Vector lực { x, y }
   */
  public applyExternalForce(force: { x: number; y: number }): void {
    if (!this.sprite || !this.sprite.body) return;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.velocity.x += force.x;
    body.velocity.y += force.y;
  }

  /**
   * THÊM MỚI: Cập nhật hàm respawn để đảm bảo reset trạng thái khi chết
   */
  public respawn(): void {
    this.isDead = false;

    // Reset lại cả hai cờ khi hồi sinh
    this.isInFallZone = false;
    this.wasInFallZoneThisFrame = false;
    this.sprite.setAlpha(1); // Khôi phục alpha nếu bạn có thay đổi

    console.log("Player has been respawned.");
  }

  // === FALL-THROUGH SYSTEM METHODS ===
  /**
   * Được gọi bởi overlap callback để báo hiệu rằng người chơi đang ở trong vùng rơi.
   */
  public markAsInFallZone(): void {
    this.isInFallZone = true;
    this.wasInFallZoneThisFrame = true; // Cũng bật cờ cảm biến để duy trì trạng thái cho frame sau

    // Tùy chọn: Thêm hiệu ứng hình ảnh hoặc âm thanh ở đây
    // Ví dụ: làm mờ người chơi hoặc chơi âm thanh "cracking"
    // if (this.sprite.alpha === 1) {
    //   this.sprite.setAlpha(0.7);
    //   this.scene.sound.play('floor_crack', { volume: 0.5 });
    // }
  }

  /**
   * Phương thức getter giờ sẽ đọc cờ bền bỉ
   */
  public getIsFallingThrough(): boolean {
    return this.isInFallZone;
  }

  public destroy(): void {
    this.nameTag?.destroy(); // <-- THÊM MỚI

    this.animationManager?.destroy();
    this.sprite?.destroy();
  }

  // === STATUS EFFECTS API ===
  public addStatusEffect(effect: IStatusEffect): void {
    if (this.activeEffects.has(effect.id)) return;
    this.activeEffects.set(effect.id, effect);
    effect.onApply(this);
  }

  public removeStatusEffect(effectId: string): void {
    const effect = this.activeEffects.get(effectId);
    if (!effect) return;
    effect.onRemove(this);
    this.activeEffects.delete(effectId);
  }

  public hasStatusEffect(effectId: string): boolean {
    return this.activeEffects.has(effectId);
  }
}
