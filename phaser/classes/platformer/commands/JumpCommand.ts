import { ICommand } from "./ICommand";
import { Player } from "../Player";

/**
 * 🦘 JUMP COMMAND - Command để thực hiện nhảy
 *
 * CHỨC NĂNG:
 * - Đóng gói logic nhảy thành một command object
 * - Có thể được tạo từ input, AI, hoặc replay system
 * - Tách biệt hoàn toàn khỏi input source
 */
export class JumpCommand implements ICommand {
  /**
   * 🎯 EXECUTE - Thực hiện nhảy
   */
  execute(player: Player): void {
    // Chuyển trách nhiệm cho State Machine
    player.stateMachine.processCommand(this);
  }

  /**
   * 🔙 UNDO - Hoàn tác nhảy (có thể dùng cho replay)
   */
  undo(player: Player): void {
    // Có thể implement logic để "cancel" jump nếu cần
    console.log("🔙 Undo jump command");
  }

  /**
   * 📝 GET NAME - Tên command
   */
  getName(): string {
    return "JumpCommand";
  }
}
