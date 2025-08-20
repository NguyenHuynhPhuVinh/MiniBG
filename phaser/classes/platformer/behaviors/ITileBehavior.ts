// frontend/phaser/classes/platformer/behaviors/ITileBehavior.ts
import { Player } from "../Player";
import { BasePlatformerScene } from "../../../scenes";

/**
 * Interface (Hợp đồng) cho tất cả các hành vi của gạch.
 * Mỗi lớp hành vi phải triển khai các phương thức này.
 */
export interface ITileBehavior {
  /**
   * Xử lý va chạm cứng (collider). Được gọi khi người chơi va chạm vật lý với gạch.
   * @param tile Gạch mà người chơi va chạm.
   * @param player Đối tượng người chơi.
   * @param scene Scene hiện tại.
   */
  onPlayerCollide(
    tile: Phaser.Tilemaps.Tile,
    player: Player,
    scene: BasePlatformerScene
  ): void;

  /**
   * Quyết định xem va chạm vật lý có nên xảy ra hay không.
   * @returns `true` để cho phép va chạm, `false` để đi xuyên qua.
   */
  shouldCollide(
    tile: Phaser.Tilemaps.Tile,
    player: Player,
    scene: BasePlatformerScene
  ): boolean;
}


