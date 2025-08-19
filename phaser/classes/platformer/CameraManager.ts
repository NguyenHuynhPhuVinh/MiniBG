import { Scene } from "phaser";
import { CAMERA_CONFIG } from "../../config/constants";

/**
 * 📷 CAMERA CONFIG INTERFACE - Cấu hình cho CameraManager
 */
export interface CameraConfig {
  followOffset?: { x: number; y: number }; // Offset camera so với target
  lerpSpeed?: { x: number; y: number }; // Tốc độ follow (smooth)
  deadzone?: { x: number; y: number; width: number; height: number }; // Vùng không di chuyển camera
  bounds?: { x: number; y: number; width: number; height: number }; // Giới hạn camera
  zoom?: number; // Mức zoom
}

/**
 * 📷 CAMERA MANAGER - Quản lý camera với advanced effects
 *
 * CHỨC NĂNG:
 * - Follow player với smooth lerp
 * - Dynamic offset dựa trên player velocity (nhảy/rơi)
 * - Camera effects: shake, flash, fade
 * - Bounds để camera không đi ra ngoài map
 * - Zoom controls
 */
export class CameraManager {
  private scene: Scene;
  private camera: Phaser.Cameras.Scene2D.Camera; // Main camera
  private target?: Phaser.GameObjects.GameObject; // Target để follow (Player)
  private config: Required<CameraConfig>; // Camera config
  private shakeIntensity: number = 0; // Cường độ shake hiện tại
  private isShaking: boolean = false; // Có đang shake không

  constructor(scene: Scene, config?: CameraConfig) {
    this.scene = scene;
    this.camera = scene.cameras.main;

    // Merge config với defaults
    this.config = {
      followOffset: config?.followOffset || { x: 0, y: -50 },
      lerpSpeed: config?.lerpSpeed || { x: 0.1, y: 0.1 },
      deadzone: config?.deadzone || { x: 0, y: 0, width: 0, height: 0 },
      bounds: config?.bounds || { x: 0, y: 0, width: 0, height: 0 },
      zoom: config?.zoom || 1,
    };

    this.setupCamera();
  }

  /**
   * ⚙️ SETUP CAMERA BAN ĐẦU
   */
  private setupCamera(): void {
    this.camera.setZoom(this.config.zoom);
    this.camera.setBackgroundColor("#87CEEB"); // Sky blue background

    // Thiết lập bounds ngay từ đầu nếu có
    if (this.config.bounds.width > 0 && this.config.bounds.height > 0) {
      this.camera.setBounds(
        this.config.bounds.x,
        this.config.bounds.y,
        this.config.bounds.width,
        this.config.bounds.height
      );
      console.log(
        `📷 Camera bounds set: ${this.config.bounds.width}x${this.config.bounds.height}`
      );
    }
  }

  /**
   * 🎯 BẮT ĐẦU FOLLOW TARGET (Player)
   *
   * SETUP:
   * - Camera follow target với lerp smooth
   * - Set offset để camera không center hoàn toàn
   * - Set deadzone nếu cần (vùng target di chuyển mà camera không move)
   */
  public followTarget(target: Phaser.GameObjects.GameObject): void {
    this.target = target;

    // Bắt đầu follow với smooth lerp
    this.camera.startFollow(target);
    this.camera.setLerp(this.config.lerpSpeed.x, this.config.lerpSpeed.y);

    // Set offset (camera không center hoàn toàn vào player)
    this.camera.setFollowOffset(
      this.config.followOffset.x,
      this.config.followOffset.y
    );

    // Set deadzone nếu có (vùng player di chuyển mà camera không move)
    if (this.config.deadzone.width > 0 && this.config.deadzone.height > 0) {
      this.camera.setDeadzone(
        this.config.deadzone.width,
        this.config.deadzone.height
      );
    }
  }

  /**
   * 🗺️ SET CAMERA BOUNDS - Giới hạn camera trong map
   */
  public setBounds(x: number, y: number, width: number, height: number): void {
    this.config.bounds = { x, y, width, height };
    this.camera.setBounds(x, y, width, height);
  }

  /**
   * 🔍 SET ZOOM LEVEL - Với hoặc không có animation
   */
  public setZoom(zoom: number, duration?: number): void {
    this.config.zoom = zoom;

    if (duration && duration > 0) {
      // Smooth zoom transition với tween
      this.scene.tweens.add({
        targets: this.camera,
        zoom: zoom,
        duration: duration,
        ease: "Power2",
      });
    } else {
      // Instant zoom
      this.camera.setZoom(zoom);
    }
  }

  // === CAMERA EFFECTS ===

  /**
   * 📳 SHAKE EFFECT - Rung camera (khi nhảy, damage, collect coin)
   */
  public shake(intensity: number = 0.01, duration: number = 100): void {
    this.shakeIntensity = intensity;
    this.isShaking = true;
    this.camera.shake(duration, intensity);

    // Reset state sau khi shake xong
    this.scene.time.delayedCall(duration, () => {
      this.isShaking = false;
      this.shakeIntensity = 0;
    });
  }

  /**
   * ⚡ FLASH EFFECT - Nhấp nháy màu (khi collect coin)
   */
  public flash(color: number = 0xffffff, duration: number = 250): void {
    this.camera.flash(
      duration,
      (color >> 16) & 255,
      (color >> 8) & 255,
      color & 255
    );
  }

  /**
   * 🌫️ FADE OUT EFFECT - Mờ dần (scene transitions)
   */
  public fade(color: number = 0x000000, duration: number = 500): Promise<void> {
    return new Promise((resolve) => {
      this.camera.fadeOut(
        duration,
        (color >> 16) & 255,
        (color >> 8) & 255,
        color & 255
      );
      this.scene.time.delayedCall(duration, () => resolve());
    });
  }

  /**
   * 🌅 FADE IN EFFECT - Hiện dần (scene transitions)
   */
  public fadeIn(duration: number = 500): Promise<void> {
    return new Promise((resolve) => {
      this.camera.fadeIn(duration);
      this.scene.time.delayedCall(duration, () => resolve());
    });
  }

  /**
   * 📹 PAN TO POSITION - Di chuyển camera đến vị trí cụ thể
   */
  public panTo(x: number, y: number, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      this.camera.pan(x, y, duration, "Power2");
      this.scene.time.delayedCall(duration, () => resolve());
    });
  }

  /**
   * 🛑 STOP FOLLOW - Ngừng follow target
   */
  public stopFollow(): void {
    this.camera.stopFollow();
    this.target = undefined;
  }

  // === CAMERA CONTROLS ===

  /**
   * ⚙️ SET LERP SPEED - Thay đổi tốc độ follow
   */
  public setLerpSpeed(x: number, y: number): void {
    this.config.lerpSpeed = { x, y };
    this.camera.setLerp(x, y);
  }

  /**
   * 📍 SET FOLLOW OFFSET - Thay đổi offset camera
   */
  public setFollowOffset(x: number, y: number): void {
    this.config.followOffset = { x, y };
    this.camera.setFollowOffset(x, y);
  }

  /**
   * 🌍 COORDINATE CONVERSION - Chuyển đổi tọa độ
   */
  public getWorldPoint(x: number, y: number): Phaser.Math.Vector2 {
    return this.camera.getWorldPoint(x, y);
  }

  public getScreenPoint(x: number, y: number): Phaser.Math.Vector2 {
    const point = new Phaser.Math.Vector2(x, y);
    point.x = (x - this.camera.scrollX) * this.camera.zoom;
    point.y = (y - this.camera.scrollY) * this.camera.zoom;
    return point;
  }

  // === GAME EVENT HANDLERS ===

  /**
   * 🦘 PLAYER JUMP EFFECT - Camera nhìn lên khi nhảy
   */
  public onPlayerJump(): void {
    const jumpY =
      CAMERA_CONFIG.DEFAULT_OFFSET.y + CAMERA_CONFIG.JUMP_OFFSET_MODIFIER;
    this.setFollowOffset(CAMERA_CONFIG.DEFAULT_OFFSET.x, jumpY);

    // Reset về offset mặc định sau 300ms
    this.scene.time.delayedCall(300, () => {
      this.setFollowOffset(
        CAMERA_CONFIG.DEFAULT_OFFSET.x,
        CAMERA_CONFIG.DEFAULT_OFFSET.y
      );
    });
  }

  /**
   * 🏃 PLAYER LAND EFFECT - Shake nhẹ khi chạm đất
   */
  public onPlayerLand(): void {
    this.shake(0.005, 100);
  }

  /**
   * 🔄 UPDATE CAMERA - Được gọi mỗi frame để điều chỉnh camera động
   *
   * LOGIC:
   * - Điều chỉnh camera offset dựa trên player velocity
   * - Nhảy cao: camera nhìn lên
   * - Rơi nhanh: camera nhìn xuống
   * - Bình thường: camera ở vị trí mặc định
   */
  public update(): void {
    if (this.target && "body" in this.target) {
      const body = (this.target as any).body;
      if (body) {
        const velocityY = body.velocity.y;
        const baseX = CAMERA_CONFIG.DEFAULT_OFFSET.x;
        const baseY = CAMERA_CONFIG.DEFAULT_OFFSET.y;

        // Điều chỉnh offset dựa trên velocity Y
        if (velocityY < -200) {
          // Đang nhảy cao → nhìn lên
          this.setFollowOffset(
            baseX,
            baseY + CAMERA_CONFIG.JUMP_OFFSET_MODIFIER
          );
        } else if (velocityY > 200) {
          // Đang rơi nhanh → nhìn xuống nhiều
          this.setFollowOffset(
            baseX,
            baseY + CAMERA_CONFIG.FAST_FALL_OFFSET_MODIFIER
          );
        } else if (velocityY > 50) {
          // Đang rơi bình thường → nhìn xuống ít
          this.setFollowOffset(
            baseX,
            baseY + CAMERA_CONFIG.FALL_OFFSET_MODIFIER
          );
        } else {
          // Đứng yên hoặc di chuyển ngang → vị trí mặc định
          this.setFollowOffset(baseX, baseY);
        }
      }
    }
  }

  /**
   * 🗑️ CLEANUP - Giải phóng references
   */
  public destroy(): void {
    this.stopFollow();
    this.target = undefined;
    this.scene = null as any;
    this.camera = null as any;
  }
}
