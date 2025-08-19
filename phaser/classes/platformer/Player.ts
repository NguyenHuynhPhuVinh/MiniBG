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

  // <-- THÊM CÁC BIẾN TRẠNG THÁI MỚI CHO TÍNH NĂNG NẮM VÀ THOÁT -->
  public playerState: PlayerStateSchema | null = null; // Lưu state từ server
  private struggleCooldown = 0; // Để tránh spam server
  private GRAB_DISTANCE_THRESHOLD = 80; // Khoảng cách tối đa để nắm (pixel)

  // <-- THÊM CÁC THUỘC TÍNH MỚI CHO NỘI SUY DỰA TRÊN VẬN TỐC -->
  private serverTargetPosition: { x: number; y: number } | null = null;
  // (Các hằng số đã gom vào InterpolationUtils)

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
   * 🔄 UPDATE - Logic mới với tính năng nắm và thoát
   */
  public update(): void {
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

    const inputState = this.inputManager.update();

    // =======================================================
    // === LOGIC MỚI: PHÂN TÁCH DỰA TRÊN TRẠNG THÁI isGrabbed ===
    // =======================================================

    if (this.playerState.isGrabbed && this.serverTargetPosition) {
      // ----- LOGIC KHI BỊ NẮM (NỘI SUY BẰNG VẬN TỐC) -----
      InterpolationUtils.updateVelocity(this.sprite, this.serverTargetPosition);

      // 2. Xử lý animation "vùng vẫy"
      // Client có quyền quyết định animation vùng vẫy của chính mình
      const isTryingToMove = inputState.left || inputState.right;
      if (isTryingToMove) {
        this.animationManager.playAnimation("walk");
        this.sprite.setFlipX(inputState.left);
      } else {
        // Nếu không vùng vẫy, thì dùng animation từ server (do người nắm quyết định)
        this.animationManager.playAnimation(
          this.playerState.animState as AnimationState
        );
        this.sprite.setFlipX(this.playerState.flipX);
      }

      // 3. Xử lý "nỗ lực thoát" (struggle)
      const isStruggling =
        inputState.left || inputState.right || inputState.jump;
      if (isStruggling && this.scene.time.now > this.struggleCooldown) {
        this.networkManager.room?.send("struggle");
        this.struggleCooldown = this.scene.time.now + 100; // Cooldown 100ms
      }
    } else if (this.playerState.isGrabbing) {
      // ----- LOGIC KHI ĐANG NẮM AI ĐÓ -----

      // Di chuyển chậm hơn khi đang nắm người khác
      const grabSpeed = this.config.physics.speed * 0.7; // Chậm hơn 30%

      if (inputState.left) {
        body.setVelocityX(-grabSpeed);
      } else if (inputState.right) {
        body.setVelocityX(grabSpeed);
      } else {
        body.setVelocityX(0);
      }

      // Không thể nhảy khi đang nắm người khác
      if (inputState.jump && body.blocked.down) {
        // Có thể thêm sound effect "can't jump" ở đây
        console.log("Cannot jump while grabbing someone!");
      }

      // Cập nhật animation dựa trên velocity
      this.animationManager.updateAnimation(body.velocity, body.blocked.down);
    } else {
      // ----- LOGIC DI CHUYỂN BÌNH THƯỜNG -----

      if (inputState.left) {
        body.setVelocityX(-this.config.physics.speed);
      } else if (inputState.right) {
        body.setVelocityX(this.config.physics.speed);
      } else {
        body.setVelocityX(0);
      }

      if (inputState.jump && body.blocked.down) {
        body.setVelocityY(-this.config.physics.jumpPower);
        this.scene.sound.play("jump");
      }

      // Cập nhật animation dựa trên velocity
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
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * THÊM MỚI: Phương thức để hồi sinh player
   */
  public respawn(): void {
    this.isDead = false;
    // Có thể thêm các logic khác như reset trạng thái power-up ở đây
    console.log("Player has been respawned.");
  }

  public destroy(): void {
    this.nameTag?.destroy(); // <-- THÊM MỚI

    this.animationManager?.destroy();
    this.sprite?.destroy();
  }
}
