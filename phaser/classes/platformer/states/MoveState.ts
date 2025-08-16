import { IState } from "./IState";
import { Player } from "../Player";
import {
  ICommand,
  MoveCommand,
  JumpCommand,
  StopMoveCommand,
} from "../commands";

/**
 * 🏃 MOVE STATE - Trạng thái di chuyển ngang (CẬP NHẬT - Command Pattern)
 *
 * CHỨC NĂNG:
 * - Player di chuyển trái/phải
 * - **MỚI**: Xử lý Commands thay vì raw input
 * - Có thể nhảy trong khi di chuyển
 * - Chuyển về idle khi nhận StopMoveCommand
 *
 * TRANSITIONS:
 * - → IdleState: Khi nhận StopMoveCommand
 * - → JumpState: Khi nhận JumpCommand và có thể nhảy
 * - → FallState: Khi rời khỏi mặt đất (không phải jump)
 */
export class MoveState implements IState {
  player: Player;
  moveDirection: "left" | "right";

  // Constructor nhận hướng di chuyển ban đầu
  constructor(player: Player, direction: "left" | "right") {
    this.player = player;
    this.moveDirection = direction;
  }

  /**
   * 🚪 ENTER - Setup trạng thái di chuyển
   */
  enter(): void {
    console.log(`🏃 Entered Move State (Direction: ${this.moveDirection})`);
  }

  /**
   * 🔄 UPDATE - Thêm hàm update KHÔNG CÓ tham số input
   * Hàm này chịu trách nhiệm cho hành động liên tục (giữ phím)
   */
  update(): void {
    // MỚI: Ưu tiên kiểm tra bộ đệm nhảy trước
    const { JumpState } = require("./JumpState");
    if (this.player.isJumpBuffered() && this.player.canPerformJump()) {
      this.player.stateMachine.changeState(new JumpState(this.player));
      return; // Ưu tiên nhảy
    }

    // Áp dụng vận tốc liên tục mỗi frame
    const speed = this.player.getConfig().physics.speed;
    const velocityX = this.moveDirection === "left" ? -speed : speed;
    this.player.getSprite().setVelocityX(velocityX);

    // Kiểm tra nếu bị rơi khỏi platform
    const { FallState } = require("./FallState");
    if (
      !this.player.isOnGround() &&
      this.player.getSprite().body!.velocity.y > 0
    ) {
      this.player.stateMachine.changeState(new FallState(this.player));
    }
  }

  /**
   * 🎮 PROCESS COMMAND - Xử lý commands trong move state (BẮT BUỘC)
   */
  processCommand(command: ICommand): void {
    const { IdleState } = require("./IdleState");

    if (command instanceof StopMoveCommand) {
      // Nhận lệnh dừng -> chuyển về Idle
      this.player.stateMachine.changeState(new IdleState(this.player));
    } else if (command instanceof MoveCommand) {
      // MỚI: Cập nhật hướng di chuyển nếu nhận được lệnh mới
      this.moveDirection = command.getDirection();
    }
    // Jump đã được xử lý trong update()
  }

  /**
   * 🚪 EXIT - Cleanup khi rời move state
   */
  exit(): void {
    // Khi thoát khỏi MoveState (chuyển sang Idle hoặc Jump),
    // ta nên dừng vận tốc ngang để tránh "trượt"
    this.player.getSprite().setVelocityX(0);
  }
}
