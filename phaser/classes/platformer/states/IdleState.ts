import { IState } from "./IState";
import { Player } from "../Player";
import { ICommand, JumpCommand, MoveCommand } from "../commands";

/**
 * 🧘 IDLE STATE - Trạng thái đứng yên (CẬP NHẬT - Command Pattern)
 *
 * CHỨC NĂNG:
 * - Player đứng yên, không di chuyển
 * - **MỚI**: Xử lý Commands thay vì raw input
 * - State mặc định khi không có input
 *
 * TRANSITIONS:
 * - → MoveState: Khi nhận MoveCommand
 * - → JumpState: Khi nhận JumpCommand và có thể nhảy
 */
export class IdleState implements IState {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  /**
   * 🚪 ENTER - Setup trạng thái đứng yên
   */
  enter(): void {
    // Dừng movement ngang
    this.player.getSprite().setVelocityX(0);

    console.log("🧘 Entered Idle State");
  }

  /**
   * 🔄 UPDATE - MỚI: Kiểm tra bộ đệm nhảy
   */
  update(): void {
    const { JumpState } = require("./JumpState");

    // Kiểm tra nếu người dùng muốn nhảy và có thể nhảy
    if (this.player.isJumpBuffered() && this.player.canPerformJump()) {
      this.player.stateMachine.changeState(new JumpState(this.player));
    }
  }

  /**
   * 🎮 PROCESS COMMAND - Xử lý commands trong idle state (BẮT BUỘC)
   */
  processCommand(command: ICommand): void {
    // Import state để tránh circular dependency
    const { MoveState } = require("./MoveState");

    if (command instanceof MoveCommand) {
      // Nếu nhận được lệnh di chuyển, chuyển sang MoveState
      this.player.stateMachine.changeState(
        new MoveState(this.player, command.getDirection())
      );
    }
    // Không cần xử lý JumpCommand ở đây nữa - đã được xử lý trong update()
  }

  /**
   * 🚪 EXIT - Cleanup khi rời idle state
   */
  exit(): void {
    // Idle state không cần cleanup gì đặc biệt
  }
}
