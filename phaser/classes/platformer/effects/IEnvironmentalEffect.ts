import { Player } from "../Player";
import { BasePlatformerScene } from "../../../scenes";

/**
 * Interface (Hợp đồng) cho tất cả các hiệu ứng môi trường (gió, nước, trọng lực thấp, v.v.).
 * Bất kỳ hiệu ứng nào cũng phải tuân thủ cấu trúc này.
 */
export interface IEnvironmentalEffect {
  /**
   * Được gọi một lần khi hiệu ứng được gán vào một Scene.
   * Dùng để thực hiện các thiết lập ban đầu, ví dụ như đọc dữ liệu từ map Tiled.
   * @param scene Tham chiếu đến scene hiện tại.
   */
  initialize(scene: BasePlatformerScene): void;

  /**
   * Được gọi mỗi frame từ vòng lặp update của Scene.
   * Đây là nơi chứa logic chính của hiệu ứng, ví dụ như áp dụng lực lên người chơi.
   * @param player Đối tượng người chơi để hiệu ứng có thể tương tác.
   */
  update(player: Player): void;

  /**
   * Dọn dẹp bất kỳ listener hoặc tài nguyên nào đã được tạo ra.
   * Được gọi khi Scene bị hủy.
   */
  cleanup(): void;
}
