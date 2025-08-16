// phaser/scenes/platformer/rules/IPlatformerRules.ts
import { MinigameCore } from "../../../classes";
import { BasePlatformerScene } from "../BasePlatformerScene";

/**
 * Interface (Hợp đồng) cho tất cả các bộ quy tắc của game platformer.
 * Bất kỳ bộ luật chơi nào cũng phải tuân thủ cấu trúc này.
 */
export interface IPlatformerRules {
  /**
   * Được gọi khi Scene khởi tạo, để thiết lập các logic đặc biệt như timer.
   * @param scene Tham chiếu đến scene hiện tại.
   * @param minigameCore Tham chiếu đến MinigameCore.
   */
  initialize(scene: BasePlatformerScene, minigameCore: MinigameCore): void;

  /**
   * Xử lý logic khi một vật phẩm có thể thu thập được va chạm.
   * @param tile Tile của vật phẩm.
   * @param scene Tham chiếu đến scene để có thể gọi âm thanh và effects.
   */
  handleCollectible(
    tile: Phaser.Tilemaps.Tile,
    scene: BasePlatformerScene
  ): void;

  /**
   * Xử lý logic khi va chạm với một đối tượng tương tác (finish, quiz, etc.).
   * @param objectName Tên của đối tượng.
   * @param objectData Dữ liệu từ Tiled.
   * @param scene Tham chiếu đến scene để có thể gọi âm thanh và effects.
   */
  handleInteractiveObject(
    objectName: string,
    objectData: any,
    scene: BasePlatformerScene
  ): void;

  /**
   * Dọn dẹp bất kỳ listener hoặc timer nào đã được tạo ra trong initialize.
   */
  cleanup(): void;
}
