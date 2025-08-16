import { ICommand } from "./ICommand";
import { Player } from "../Player";

/**
 * 🏃 MOVE COMMAND - Command để di chuyển theo hướng
 *
 * CHỨC NĂNG:
 * - Đóng gói movement logic thành command object
 * - Hỗ trợ cả left và right direction
 * - Có thể dùng cho AI pathfinding
 */
export class MoveCommand implements ICommand {
  private direction: "left" | "right";

  constructor(direction: "left" | "right") {
    this.direction = direction;
  }

  /**
   * 🎯 EXECUTE - Thực hiện di chuyển
   */
  execute(player: Player): void {
    // Chuyển trách nhiệm cho State Machine
    player.stateMachine.processCommand(this);
  }

  /**
   * 🔙 UNDO - Dừng di chuyển
   */
  undo(player: Player): void {
    // Stop movement
    player.getSprite().setVelocityX(0);
    console.log(`🔙 Undo move ${this.direction} command`);
  }

  /**
   * 📝 GET NAME - Tên command
   */
  getName(): string {
    return `MoveCommand(${this.direction})`;
  }

  /**
   * 🎯 GET DIRECTION - Lấy hướng di chuyển
   */
  getDirection(): "left" | "right" {
    return this.direction;
  }
}
