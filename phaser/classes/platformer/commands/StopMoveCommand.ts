import { ICommand } from "./ICommand";
import { Player } from "../Player";

/**
 * 🛑 STOP MOVE COMMAND - Command để dừng di chuyển
 *
 * CHỨC NĂNG:
 * - Đóng gói logic dừng di chuyển
 * - Được gọi khi không có input movement
 * - Hữu ích cho AI state transitions
 */
export class StopMoveCommand implements ICommand {
  /**
   * 🎯 EXECUTE - Dừng di chuyển
   */
  execute(player: Player): void {
    // Chuyển trách nhiệm cho State Machine
    player.stateMachine.processCommand(this);
  }

  /**
   * 🔙 UNDO - Không cần undo cho stop command
   */
  undo(player: Player): void {
    console.log("🔙 Undo stop move command (no action needed)");
  }

  /**
   * 📝 GET NAME - Tên command
   */
  getName(): string {
    return "StopMoveCommand";
  }
}
