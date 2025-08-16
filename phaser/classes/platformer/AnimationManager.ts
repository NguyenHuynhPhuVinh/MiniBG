import { Scene } from "phaser";
import {
  CharacterAnimations,
  FrameData,
  DEFAULT_CHARACTER,
  ANIMATION_CONFIG,
} from "./CharacterFrames";

/**
 * 🎬 ANIMATION STATES - Các trạng thái animation của character
 */
export type AnimationState = "idle" | "walk" | "jump" | "fall";

/**
 * 🎬 ANIMATION MANAGER - Quản lý tất cả animations cho character
 *
 * CHỨC NĂNG:
 * - Tạo animations từ character frame data
 * - Auto-update animation dựa trên player state (velocity, onGround)
 * - Flip sprite theo hướng di chuyển
 * - Quản lý animation keys và states
 */
export class AnimationManager {
  private scene: Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;           // Sprite cần animate
  private currentState: AnimationState = "idle";          // Animation state hiện tại
  private characterData: CharacterAnimations;             // Frame data cho character
  private animationKeys: Record<AnimationState, string> = {
    idle: "player-idle",
    walk: "player-walk",
    jump: "player-jump",
    fall: "player-fall",
  };

  constructor(
    scene: Scene,
    sprite: Phaser.Physics.Arcade.Sprite,
    characterData?: CharacterAnimations
  ) {
    this.scene = scene;
    this.sprite = sprite;
    this.characterData = characterData || DEFAULT_CHARACTER;

    this.createAnimations();
  }

  /**
   * 🎬 TẠO TẤT CẢ ANIMATIONS - Được gọi trong constructor
   */
  private createAnimations(): void {
    // Tạo animations với config khác nhau cho từng loại
    this.createAnimation("idle", this.characterData.idle, { frameRate: 2, repeat: -1 });
    this.createAnimation("walk", this.characterData.walk, ANIMATION_CONFIG);
    this.createAnimation("jump", this.characterData.jump, { frameRate: 1, repeat: 0 });
    this.createAnimation("fall", this.characterData.fall, { frameRate: 1, repeat: 0 });
  }

  /**
   * 🎬 TẠO MỘT ANIMATION - Từ frame data thành Phaser animation
   */
  private createAnimation(
    key: AnimationState,
    frames: FrameData[],
    config: { frameRate: number; repeat: number }
  ): void {
    const animKey = this.animationKeys[key];

    // Skip nếu animation đã tồn tại
    if (this.scene.anims.exists(animKey)) return;

    // Convert frame data thành Phaser animation frames
    const animFrames = frames.map((frame, index) => ({
      key: "spritesheet-characters-default",
      frame: `char_${frame.x}_${frame.y}_${index}`, // Unique frame key
    }));

    // Tạo animation trong Phaser
    this.scene.anims.create({
      key: animKey,
      frames: animFrames,
      frameRate: config.frameRate,
      repeat: config.repeat,
    });
  }

  // === ANIMATION CONTROLS ===

  /**
   * ▶️ PLAY ANIMATION - Chơi animation nếu khác state hiện tại
   */
  public playAnimation(state: AnimationState, force: boolean = false): void {
    if (this.currentState === state && !force) return;

    this.currentState = state;
    this.sprite.play(this.animationKeys[state]);
  }

  /**
   * 📊 GETTERS - Lấy thông tin animation hiện tại
   */
  public getCurrentState(): AnimationState { return this.currentState; }
  public isPlaying(state: AnimationState): boolean {
    return this.sprite.anims.isPlaying && this.currentState === state;
  }

  /**
   * ⏹️ STOP ANIMATION
   */
  public stopAnimation(): void { this.sprite.anims.stop(); }

  /**
   * 🔄 FLIP CONTROLS - Lật sprite theo hướng di chuyển
   */
  public setFlipX(flip: boolean): void { this.sprite.setFlipX(flip); }
  public getFlipX(): boolean { return this.sprite.flipX; }

  /**
   * 🔄 UPDATE ANIMATION - Method chính được gọi mỗi frame từ Player
   *
   * LOGIC:
   * 1. Flip sprite theo hướng di chuyển (trái/phải)
   * 2. Chọn animation dựa trên velocity và onGround:
   *    - Trong không khí: jump (lên) hoặc fall (xuống)
   *    - Trên mặt đất: walk (di chuyển) hoặc idle (đứng yên)
   *
   * @param velocity - Velocity của player {x, y}
   * @param onGround - Player có đang trên mặt đất không
   */
  public updateAnimation(velocity: { x: number; y: number }, onGround: boolean): void {
    const isMovingHorizontally = Math.abs(velocity.x) > 10;
    const isMovingUp = velocity.y < -10;
    const isFalling = velocity.y > 10;

    // Flip sprite theo hướng di chuyển
    if (velocity.x > 0) {
      this.setFlipX(false);      // Hướng phải
    } else if (velocity.x < 0) {
      this.setFlipX(true);       // Hướng trái
    }

    // Chọn animation dựa trên trạng thái
    if (!onGround) {
      // Trong không khí
      if (isMovingUp) {
        this.playAnimation("jump");
      } else if (isFalling) {
        this.playAnimation("fall");
      }
    } else {
      // Trên mặt đất
      if (isMovingHorizontally) {
        this.playAnimation("walk");
      } else {
        this.playAnimation("idle");
      }
    }
  }

  /**
   * 🗑️ CLEANUP - Giải phóng references
   */
  public destroy(): void {
    this.sprite = null as any;
    this.scene = null as any;
  }
}
