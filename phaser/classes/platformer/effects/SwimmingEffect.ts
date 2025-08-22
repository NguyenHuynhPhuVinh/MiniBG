// frontend/phaser/classes/platformer/effects/SwimmingEffect.ts
import type { Player } from "../Player";
import { IStatusEffect } from "./IStatusEffect";

/**
 * Hiệu ứng này thay đổi vật lý của người chơi để mô phỏng việc bơi.
 * Nó không có thời gian và sẽ được gỡ bỏ thủ công khi người chơi rời khỏi nước.
 */
export class SwimmingEffect implements IStatusEffect {
  readonly id = "swimming";
  isFinished = false; // Sẽ không bao giờ tự kết thúc

  private originalPhysics: { gravity: number, speed: number, jumpPower: number } | null = null;

  onApply(player: Player): void {
    console.log("🌊 Player entered water. Applying swimming physics.");
    const playerConfig = (player as any).config.physics;
    const spriteBody = player.getSprite().body as Phaser.Physics.Arcade.Body;

    // Lưu lại vật lý ban đầu
    this.originalPhysics = {
      gravity: spriteBody.gravity.y,
      speed: playerConfig.speed,
      jumpPower: playerConfig.jumpPower,
    };

    // Áp dụng vật lý bơi
    spriteBody.setGravityY(150); // Trọng lực rất yếu, làm người chơi chìm từ từ
    playerConfig.speed *= 0.7; // Di chuyển trong nước chậm hơn
    playerConfig.jumpPower = 250; // "Nhảy" trong nước là để bơi lên
  }

  update(_deltaTime: number, _player: Player): void {
    // Không cần làm gì mỗi frame, logic chính nằm trong Player.update()
  }

  onRemove(player: Player): void {
    console.log("🏊 Player exited water. Restoring normal physics.");
    if (this.originalPhysics) {
      const playerConfig = (player as any).config.physics;
      const spriteBody = player.getSprite().body as Phaser.Physics.Arcade.Body;

      // Khôi phục vật lý ban đầu
      spriteBody.setGravityY(this.originalPhysics.gravity);
      playerConfig.speed = this.originalPhysics.speed;
      playerConfig.jumpPower = this.originalPhysics.jumpPower;
    }
  }
}
