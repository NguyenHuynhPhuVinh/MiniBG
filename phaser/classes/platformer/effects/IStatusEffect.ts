import type { Player } from "../Player";

/**
 * Interface (Hợp đồng) cho tất cả các hiệu ứng trạng thái có thể áp dụng lên người chơi.
 */
export interface IStatusEffect {
  /**
   * Tên định danh duy nhất cho hiệu ứng, ví dụ "knockback", "snow_slow".
   */
  readonly id: string;

  /**
   * Cờ cho hệ thống biết hiệu ứng đã kết thúc và có thể được gỡ bỏ.
   */
  isFinished: boolean;

  /**
   * Được gọi một lần khi hiệu ứng được áp dụng lên người chơi.
   * Đây là nơi để thiết lập trạng thái ban đầu (ví dụ: vô hiệu hóa input).
   * @param player Người chơi nhận hiệu ứng.
   */
  onApply(player: Player): void;

  /**
   * Được gọi mỗi frame từ vòng lặp update của Player.
   * Đây là nơi chứa logic chính của hiệu ứng (ví dụ: đếm ngược thời gian).
   * @param deltaTime Thời gian trôi qua từ frame trước (tính bằng ms).
   * @param player Người chơi đang chịu hiệu ứng.
   */
  update(deltaTime: number, player: Player): void;

  /**
   * Được gọi một lần khi hiệu ứng được gỡ bỏ (do isFinished = true hoặc bị hủy).
   * Đây là nơi để dọn dẹp và khôi phục trạng thái (ví dụ: kích hoạt lại input).
   * @param player Người chơi được gỡ bỏ hiệu ứng.
   */
  onRemove(player: Player): void;
}
