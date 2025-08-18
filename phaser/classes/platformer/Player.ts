import { Scene } from "phaser";
import { AnimationManager, AnimationState } from "./AnimationManager";
import { InputManager } from "./InputManager";
import { CameraManager } from "./CameraManager";
import { CharacterAnimations, DEFAULT_CHARACTER } from "./CharacterFrames";
import { NetworkManager } from "../core/NetworkManager";

export interface PlayerConfig {
  x: number;
  y: number;
  texture: string;
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
  private scene: Scene;
  private sprite!: Phaser.Physics.Arcade.Sprite;
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

  constructor(
    scene: Scene,
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

  private setupPhysics(): void {
    if (!this.sprite) {
      console.error(`❌ Cannot setup physics: sprite is null`);
      return;
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setBounce(this.config.physics.bounce);
    body.setCollideWorldBounds(true);
    body.setGravityY(this.config.physics.gravity);
    body.setSize(64, 64);
    body.setOffset(32, 64);
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
   * 🔄 UPDATE - Vòng lặp chính cho người chơi (Client-Side Prediction)
   */
  public update(): void {
    if (!this.sprite || !this.sprite.body) return;

    const inputState = this.inputManager.update();
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // 1. Client-Side Prediction: Áp dụng vật lý ngay lập tức
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

    // 2. Cập nhật animation dựa trên kết quả dự đoán
    this.animationManager.updateAnimation(body.velocity, body.blocked.down);

    // 3. Gửi trạng thái lên server
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

    // 4. Cập nhật camera
    this.cameraManager.update();
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public destroy(): void {
    this.animationManager?.destroy();
    this.sprite?.destroy();
  }
}
