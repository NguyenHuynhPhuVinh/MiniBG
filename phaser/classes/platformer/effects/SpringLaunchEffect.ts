import type { Player } from "../Player";
import { IStatusEffect } from "./IStatusEffect";
import { NoJumpEffect } from "./KnockbackEffect";

/**
 * Hiệu ứng này tồn tại khi người chơi đang bay lên do lò xo.
 * Nó tự kết thúc khi người chơi bắt đầu rơi xuống.
 */
export class SpringLaunchEffect implements IStatusEffect {
  readonly id = "spring_launch";
  isFinished = false;

  onApply(player: Player): void {
    // Khi bay lên do lò xo, người chơi cũng không thể nhảy
    player.addStatusEffect(new NoJumpEffect(2000)); // Cấm nhảy trong tối đa 2s
  }

  update(_deltaTime: number, player: Player): void {
    const body = player.getSprite().body as Phaser.Physics.Arcade.Body;
    if (body && body.velocity.y > 0) {
      this.isFinished = true;
    }
  }

  onRemove(_player: Player): void {}
}
