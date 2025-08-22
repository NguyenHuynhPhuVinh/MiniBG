import { BasePlatformerScene } from "./BasePlatformerScene";
// THAY ĐỔI IMPORT: Sử dụng CavernRules thay vì StandardRules
import { IPlatformerRules, CavernRules } from "./rules";
import { Player as PlayerStateSchema } from "../../classes/core/types/GameRoomState";
import * as Phaser from "phaser"; // Import Phaser để dùng các tiện ích màu sắc

/**
 * 🔥 WHISPERING CAVERNS SCENE - Màn chơi Hang Động Thì Thầm
 * Tập trung vào cơ chế ánh sáng và bóng tối.
 */
export class WhisperingCavernsScene extends BasePlatformerScene {
  protected readonly TILEMAP_KEY = "WhisperingCavernsScene";
  protected readonly TILEMAP_PATH =
    "/tiled-projects/exports/WhisperingCavernsScene.json";
  protected readonly SCENE_NAME = "WhisperingCavernsScene";

  private playerLight!: Phaser.GameObjects.Light;

  // MỚI: Mảng chứa các mức độ tối
  private readonly DARKNESS_STAGES = [
    0x303030, // Cấp 0 (Ban đầu): Mờ mờ sáng
    0x101010, // Cấp 1 (Checkpoint 1): Tối hơn
    0x000000, // Cấp 2 (Checkpoint 2): Tối đen
  ];

  constructor() {
    super({
      key: "WhisperingCavernsScene",
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
   * Đây là một "công tắc" báo cho các hệ thống khác biết scene này có sử dụng ánh sáng.
   */
  public isLightingEnabled(): boolean {
    return true; // Trả về true để bật hệ thống ánh sáng
  }

  /**
   * Kích hoạt hệ thống ánh sáng của Phaser và thiết lập môi trường tối.
   */
  protected initializeScene(): void {
    // Gọi hàm của lớp cha để xây dựng thế giới trước
    super.initializeScene();

    // === KÍCH HOẠT HỆ THỐNG ÁNH SÁNG ===
    console.log("🔦 WhisperingCavernsScene: Enabling lighting system.");

    // 1. Bật hệ thống đèn
    this.lights.enable();

    // THAY ĐỔI: Thiết lập độ sáng ban đầu (Cấp 0)
    this.lights.setAmbientColor(this.DARKNESS_STAGES[0]);
  }

  /**
   * THÊM MỚI: Ghi đè phương thức tạo player để thêm nguồn sáng
   */
  public createMainPlayer(playerState: PlayerStateSchema): void {
    // Gọi phương thức gốc của lớp cha để tạo player như bình thường
    super.createMainPlayer(playerState);

    // Sau khi player đã được tạo, thêm một nguồn sáng vào nó
    if (this.player) {
      const playerSprite = this.player.getSprite();

      // Tạo một nguồn sáng nhỏ, màu cam ấm, đi theo người chơi
      this.playerLight = this.lights.addLight(
        playerSprite.x,
        playerSprite.y,
        150, // Bán kính ánh sáng (pixel)
        0xffa500, // Màu cam ấm giống đuốc
        1.2 // Cường độ sáng
      );

      console.log("🔦 Added personal light source to the main player.");
    }
  }

  /**
   * THÊM MỚI: Ghi đè vòng lặp update để cập nhật vị trí của đèn
   */
  // THÊM MỚI: Hàm công khai để Rules có thể gọi
  /**
   * Thiết lập độ tối của màn chơi một cách mượt mà.
   * @param level Cấp độ tối (0, 1, 2, ...)
   */
  public setDarknessLevel(level: number): void {
    const targetColorValue =
      this.DARKNESS_STAGES[Math.min(level, this.DARKNESS_STAGES.length - 1)];

    console.log(
      `🔦 Transitioning ambient light to level ${level} (color: ${targetColorValue.toString(
        16
      )})`
    );

    // Tạo hiệu ứng chuyển màu mượt trong 1.5 giây
    const startColor = Phaser.Display.Color.ValueToColor(
      this.lights.ambientColor
    );
    const endColor = Phaser.Display.Color.ValueToColor(targetColorValue);

    this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 1500, // 1.5 giây
      ease: "Sine.easeInOut",
      onUpdate: (tween) => {
        const value = tween.getValue() || 0;
        const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
          startColor,
          endColor,
          100,
          value
        );
        const newColor = Phaser.Display.Color.GetColor(
          colorObject.r,
          colorObject.g,
          colorObject.b
        );
        this.lights.setAmbientColor(newColor);
      },
    });
  }

  update(): void {
    // Gọi update của lớp cha để xử lý logic game
    super.update();

    // Cập nhật vị trí của đèn theo vị trí của người chơi mỗi frame
    if (this.playerLight && this.player) {
      const playerSprite = this.player.getSprite();
      this.playerLight.setPosition(playerSprite.x, playerSprite.y);
    }
  }

  // THAY ĐỔI: Sử dụng bộ luật mới
  protected createRules(): IPlatformerRules {
    return new CavernRules();
  }

  protected loadSceneSpecificAssets(): void {
    // Không cần assets riêng cho màn này ở phiên bản cơ bản
  }

  /**
   * THÊM MỚI: Dọn dẹp đèn khi scene kết thúc
   */
  protected cleanupOnShutdown(): void {
    if (this.playerLight) {
      this.lights.removeLight(this.playerLight);
      (this.playerLight as any) = null;
    }
    super.cleanupOnShutdown();
  }
}
