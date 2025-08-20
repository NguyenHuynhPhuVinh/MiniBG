/**
 * 🎯 INTERPOLATION UTILS - "Chuyên gia" về Hiệu chỉnh Vị trí bằng Vận tốc
 *
 * Mục đích: Di chuyển một đối tượng đến vị trí mục tiêu một cách mượt mà bằng cách
 * điều chỉnh vận tốc (positional correction). Rất phù hợp cho LOCAL player khi
 * cần bám theo vị trí do server quyết định (ví dụ: đang bị nắm), tránh teleport.
 *
 * KHÁC VỚI EntityInterpolator:
 * - Không dùng bộ đệm thời gian, không render trễ.
 * - Mỗi lần chỉ "đuổi theo" một vị trí mục tiêu duy nhất tại thời điểm hiện tại.
 * - Dùng cho local authority correction; còn remote players nên dùng EntityInterpolator.
 */
export class InterpolationUtils {
  // --- Các hằng số nội suy được quản lý tập trung tại đây ---
  private static readonly CORRECTION_SPEED_FACTOR = 10;
  private static readonly TELEPORT_THRESHOLD = 300; // pixels
  private static readonly STOPPING_THRESHOLD = 2; // pixels
  private static readonly MAX_VELOCITY = 500; // Giới hạn tốc độ

  /**
   * Cập nhật vận tốc của một sprite để di chuyển nó mượt mà đến vị trí mục tiêu.
   * @param sprite Đối tượng sprite cần di chuyển (phải có body vật lý).
   * @param targetPosition Vị trí mục tiêu {x, y} mà sprite cần hướng tới.
   */
  public static updateVelocity(
    sprite: Phaser.Physics.Arcade.Sprite,
    targetPosition: { x: number; y: number }
  ): void {
    if (!sprite || !sprite.body) {
      return; // Không thể thực hiện nếu không có sprite hoặc body
    }

    const body = sprite.body as Phaser.Physics.Arcade.Body;

    const distanceX = targetPosition.x - sprite.x;
    const distanceY = targetPosition.y - sprite.y;
    const totalDistance = Math.sqrt(
      distanceX * distanceX + distanceY * distanceY
    );

    // 1. XỬ LÝ TRƯỜNG HỢP LAG NẶNG: TELEPORT
    if (totalDistance > this.TELEPORT_THRESHOLD) {
      sprite.setPosition(targetPosition.x, targetPosition.y);
      body.setVelocity(0, 0);
    }
    // 2. XỬ LÝ KHI ĐÃ GẦN ĐÚNG VỊ TRÍ: DỪNG LẠI
    else if (totalDistance < this.STOPPING_THRESHOLD) {
      // Dùng setVelocity(0,0) để tránh "giật" nhẹ
      body.setVelocity(0, 0);
    }
    // 3. TRƯỜNG HỢP CHÍNH: TÍNH TOÁN VÀ ĐẶT VẬN TỐC
    else {
      const velocityX = distanceX * this.CORRECTION_SPEED_FACTOR;
      const velocityY = distanceY * this.CORRECTION_SPEED_FACTOR;

      body.setVelocityX(
        Phaser.Math.Clamp(velocityX, -this.MAX_VELOCITY, this.MAX_VELOCITY)
      );
      body.setVelocityY(
        Phaser.Math.Clamp(velocityY, -this.MAX_VELOCITY, this.MAX_VELOCITY)
      );
    }
  }
}
