import type { Player } from "../Player";
import { IStatusEffect } from "./IStatusEffect";

/**
 * Hiệu ứng này không có thời gian. Nó tồn tại chừng nào người chơi còn đứng trên tuyết.
 * Việc gỡ bỏ nó sẽ do lớp Player quản lý.
 */
export class SnowSlowEffect implements IStatusEffect {
  readonly id = "snow_slow";
  isFinished = false; // Sẽ không bao giờ tự kết thúc

  onApply(player: Player): void {
    player.applySnowEffect();
  }

  update(_deltaTime: number, _player: Player): void {
    // Không cần làm gì mỗi frame, chỉ cần hiệu ứng tồn tại
  }

  onRemove(player: Player): void {
    player.resetPhysicsToDefault();
  }
}
