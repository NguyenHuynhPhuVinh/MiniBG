import { IState } from "./IState";
import { Player } from "../Player";
import { ICommand } from "../commands";

/**
 * 🦘 JUMP STATE - Trạng thái nhảy
 *
 * CHỨC NĂNG:
 * - Player đang nhảy lên (velocity Y âm)
 * - Có thể di chuyển ngang trong khi nhảy
 * - Chuyển sang fall khi bắt đầu rơi
 *
 * TRANSITIONS:
 * - → FallState: Khi velocity Y > 0 (bắt đầu rơi)
 * - → IdleState: Khi landing mà không có input di chuyển
 * - → MoveState: Khi landing và có input di chuyển
 */
export class JumpState implements IState {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  /**
   * 🚪 ENTER - Thực hiện nhảy
   */
  enter(): void {
    console.log("🦘 Entered Jump State");

    // Thực hiện logic nhảy
    this.player.executeJump();
  }

  /**
   * 🔄 UPDATE - Xử lý di chuyển ngang và kiểm tra chuyển state
   */
  update(): void {
    // Import state để tránh circular dependency
    const { FallState } = require("./FallState");

    const sprite = this.player.getSprite();
    const velocityY = sprite.body!.velocity.y;

    // Nếu vận tốc Y > 0 (bắt đầu rơi), chuyển sang FallState
    if (velocityY > 0) {
      this.player.stateMachine.changeState(new FallState(this.player));
      return;
    }

    // Xử lý di chuyển ngang trong khi nhảy - dùng raw input cho air control
    const airControlInput = this.player.getLastInputState();
    const speed = this.player.getConfig().physics.speed;

    if (airControlInput.left) {
      sprite.setVelocityX(-speed);
    } else if (airControlInput.right) {
      sprite.setVelocityX(speed);
    }
    // Giữ momentum ngang khi không có input (realistic physics)
  }

  /**
   * 🎮 PROCESS COMMAND - Xử lý commands trong jump state (BẮT BUỘC)
   */
  processCommand(command: ICommand): void {
    // Có thể xử lý các command đặc biệt trong khi nhảy sau này (vd: DoubleJumpCommand)
  }

  /**
   * 🚪 EXIT - Cleanup khi rời jump state
   */
  exit(): void {
    // Jump state không cần cleanup gì đặc biệt
  }
}
