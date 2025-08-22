// frontend/phaser/classes/platformer/behaviors/WaterBehavior.ts
import { Player } from "../Player";
import { ITileBehavior } from "./ITileBehavior";
import { BasePlatformerScene } from "../../../scenes";

export class WaterBehavior implements ITileBehavior {
  /**
   * Được gọi mỗi frame khi người chơi ở trong vùng nước.
   * Chức năng chính là liên tục "đánh dấu" rằng người chơi đang ở trong nước.
   */
  public onPlayerCollide(
    _tile: Phaser.Tilemaps.Tile,
    player: Player,
    _scene: BasePlatformerScene
  ): void {
    // Gọi phương thức mới trên Player để kích hoạt trạng thái bơi
    if (player && typeof (player as any).markAsInWater === "function") {
      (player as any).markAsInWater();
    }
  }

  /**
   * Luôn trả về 'false' để người chơi có thể đi "xuyên qua" và chìm vào trong nước,
   * thay vì đứng trên mặt nước.
   */
  public shouldCollide(
    _tile: Phaser.Tilemaps.Tile,
    _player: Player,
    _scene: BasePlatformerScene
  ): boolean {
    return false; // Cho phép đi xuyên qua tile nước
  }
}
