import type { Player } from "../Player";
import { IStatusEffect } from "./IStatusEffect";

export class KnockbackEffect implements IStatusEffect {
  readonly id = "knockback";
  isFinished = false;
  private duration: number;

  constructor(duration: number = 400) {
    this.duration = duration;
  }

  onApply(player: Player): void {
    console.log(`[StatusEffect] Applied: ${this.id}`);
    // Khi bị đẩy lùi, người chơi cũng không thể nhảy hoặc di chuyển ngang
    player.addStatusEffect(new NoJumpEffect(this.duration));
    player.addStatusEffect(new NoHorizontalMoveEffect(this.duration));
  }

  update(deltaTime: number, _player: Player): void {
    this.duration -= deltaTime;
    if (this.duration <= 0) {
      this.isFinished = true;
    }
  }

  onRemove(_player: Player): void {
    console.log(`[StatusEffect] Removed: ${this.id}`);
    // Các hiệu ứng con (NoJump, NoHorizontalMove) sẽ tự hết hạn
  }
}

// === HIỆU ỨNG PHỤ (HELPER EFFECTS) ===

/** Hiệu ứng cấm người chơi nhảy. */
export class NoJumpEffect implements IStatusEffect {
  readonly id = "no_jump";
  isFinished = false;
  private duration: number;

  constructor(duration: number) {
    this.duration = duration;
  }
  onApply(_player: Player): void {}
  update(deltaTime: number, _player: Player): void {
    this.duration -= deltaTime;
    if (this.duration <= 0) this.isFinished = true;
  }
  onRemove(_player: Player): void {}
}

/** Hiệu ứng cấm người chơi di chuyển ngang. */
export class NoHorizontalMoveEffect implements IStatusEffect {
  readonly id = "no_horizontal_move";
  isFinished = false;
  private duration: number;

  constructor(duration: number) {
    this.duration = duration;
  }
  onApply(_player: Player): void {}
  update(deltaTime: number, _player: Player): void {
    this.duration -= deltaTime;
    if (this.duration <= 0) this.isFinished = true;
  }
  onRemove(_player: Player): void {}
}
