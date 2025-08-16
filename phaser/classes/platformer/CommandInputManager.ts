import { InputManager, InputState } from "./InputManager";
import {
  JumpCommand,
  MoveCommand,
  StopMoveCommand,
  type ICommand,
} from "./commands";

// MỚI: Thêm một kiểu dữ liệu cho hướng
type Direction = "left" | "right" | null;

/**
 * 🎮 COMMAND INPUT MANAGER - Chuyển đổi raw input thành Commands
 *
 * CHỨC NĂNG:
 * - Nhận raw input từ InputManager
 * - Chuyển đổi thành các Command objects
 * - Tách biệt hoàn toàn input processing khỏi game logic
 * - Hỗ trợ dễ dàng cho AI, replay, và remote control
 *
 * PATTERN: Command Pattern + Adapter Pattern
 * - Adapter: Chuyển đổi InputState → Commands
 * - Command: Encapsulate actions as objects
 * - Invoker: Sẽ gọi các commands này
 */
export class CommandInputManager {
  private inputManager: InputManager;
  private previousDirection: Direction = null;
  private previousInput: InputState = {
    left: false,
    right: false,
    jump: false,
    up: false,
    down: false,
  };

  constructor(inputManager: InputManager) {
    this.inputManager = inputManager;
  }

  /**
   * 🧭 GET EFFECTIVE DIRECTION - FIX: Ưu tiên phím được nhấn sau cùng
   */
  private getEffectiveDirection(currentInput: InputState): Direction {
    // Nếu chỉ có 1 phím được nhấn, dễ rồi
    if (currentInput.left && !currentInput.right) return "left";
    if (currentInput.right && !currentInput.left) return "right";
    if (!currentInput.left && !currentInput.right) return null;

    // Nếu cả 2 phím đều được nhấn, ưu tiên phím vừa được nhấn
    const leftJustPressed = currentInput.left && !this.previousInput.left;
    const rightJustPressed = currentInput.right && !this.previousInput.right;

    if (leftJustPressed) return "left"; // Trái vừa được nhấn
    if (rightJustPressed) return "right"; // Phải vừa được nhấn

    // Nếu cả 2 đều đã được nhấn từ trước, giữ nguyên hướng hiện tại
    return this.previousDirection;
  }

  /**
   * 🔄 UPDATE - MỚI: Logic dựa trên sự thay đổi của hướng hiệu quả
   *
   * @returns Mảng các commands được tạo từ input hiện tại
   */
  public update(): ICommand[] {
    const currentInput = this.inputManager.update();
    const commands: ICommand[] = [];

    // MỚI: Logic dựa trên sự thay đổi của hướng hiệu quả
    const currentDirection = this.getEffectiveDirection(currentInput);

    if (currentDirection !== this.previousDirection) {
      if (currentDirection) {
        // Hướng đã thay đổi (từ null->phải, null->trái, trái->phải, v.v.)
        commands.push(new MoveCommand(currentDirection));
      } else {
        // Đã dừng di chuyển (từ trái/phải -> null)
        commands.push(new StopMoveCommand());
      }
    }

    // Cập nhật state cho frame tiếp theo
    this.previousDirection = currentDirection;
    this.previousInput = { ...currentInput };

    // === JUMP COMMANDS ===

    // Jump command - chỉ tạo khi VỪA NHẤN jump (edge detection)
    if (this.inputManager.isJustPressed("jump")) {
      commands.push(new JumpCommand());
    }

    return commands;
  }
  /**
   * 🎯 GET RAW INPUT - Lấy raw input (cho legacy compatibility)
   */
  public getRawInput(): InputState {
    return this.inputManager.update();
  }

  /**
   * 🔍 IS JUST PRESSED - Kiểm tra key vừa được nhấn
   */
  public isJustPressed(key: keyof InputState): boolean {
    return this.inputManager.isJustPressed(key);
  }
}
