import { Player } from "../Player";

/**
 * 🎮 COMMAND INTERFACE - "Hợp đồng" cho Command Pattern
 *
 * CHỨC NĂNG:
 * - Đóng gói một hành động cụ thể
 * - Tách biệt hoàn toàn input source khỏi game logic
 * - Hỗ trợ undo/redo, replay, AI control
 *
 * PATTERN: Command Pattern
 * - Command: Interface này
 * - ConcreteCommand: JumpCommand, MoveCommand, etc.
 * - Receiver: Player hoặc State
 * - Invoker: InputManager hoặc AI Controller
 */
export interface ICommand {
  /**
   * 🎯 EXECUTE - Thực thi command
   *
   * @param player Player object để thực thi command
   */
  execute(player: Player): void;

  /**
   * 🔙 UNDO - Hoàn tác command (optional, cho replay/undo features)
   *
   * @param player Player object để undo command
   */
  undo?(player: Player): void;

  /**
   * 📝 GET NAME - Lấy tên command (cho debugging/logging)
   */
  getName(): string;
}
