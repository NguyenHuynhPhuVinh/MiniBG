import { IState } from "./IState";
import type { ICommand } from "../commands";

/**
 * 🎛️ STATE MACHINE - Quản lý chuyển đổi giữa các trạng thái + Command Processing
 *
 * CHỨC NĂNG:
 * - Quản lý state hiện tại của Player
 * - Đảm bảo chỉ có một state active tại một thời điểm
 * - Gọi lifecycle methods (enter/exit) khi chuyển state
 * - **MỚI**: Xử lý Commands từ input/AI/replay
 *
 * PATTERN: State Machine Pattern + Command Pattern
 * - Context: Player sở hữu StateMachine
 * - State: Các class implement IState
 * - Transition: changeState method
 * - **Command**: processCommand method ủy quyền cho state hiện tại
 */
export class StateMachine {
  private currentState?: IState;

  /**
   * 🏁 INITIALIZE - Khởi tạo state machine với state ban đầu
   *
   * @param startingState State đầu tiên (thường là IdleState)
   */
  public initialize(startingState: IState): void {
    this.currentState = startingState;
    startingState.enter();
  }

  /**
   * 🔄 CHANGE STATE - Chuyển đổi từ state hiện tại sang state mới
   *
   * LUỒNG:
   * 1. Gọi exit() của state cũ (cleanup)
   * 2. Thay đổi reference sang state mới
   * 3. Gọi enter() của state mới (setup)
   *
   * @param newState State mới để chuyển đến
   */
  public changeState(newState: IState): void {
    // Cleanup state cũ
    this.currentState?.exit();

    // Chuyển sang state mới
    this.currentState = newState;

    // Setup state mới
    newState.enter();

    // Debug log để theo dõi state transitions
    console.log(`🔄 State changed to: ${newState.constructor.name}`);
  }

  /**
   * ⚡ UPDATE - Ủy quyền update logic cho state hiện tại (MỚI - KHÔNG THAM SỐ)
   *
   * Được gọi mỗi frame từ Player.update() để xử lý các hành động liên tục
   */
  public update(): void {
    if (this.currentState && "update" in this.currentState) {
      (this.currentState as any).update();
    }
  }

  /**
   * 🎮 PROCESS COMMAND - Xử lý command từ input/AI/replay (MỚI)
   *
   * CHỨC NĂNG:
   * - Nhận command từ bất kỳ nguồn nào (input, AI, replay)
   * - Ủy quyền cho state hiện tại xử lý
   * - Ghi log để debugging/replay
   *
   * @param command Command cần xử lý
   */
  public processCommand(command: ICommand): void {
    console.log(`🎮 Processing command: ${command.getName()}`);

    // Ủy quyền cho state hiện tại xử lý command
    if (this.currentState && "processCommand" in this.currentState) {
      (this.currentState as any).processCommand(command);
    } else {
      console.warn(
        `⚠️ Current state ${this.getCurrentStateName()} cannot process commands`
      );
    }
  }

  /**
   * 🔍 GET CURRENT STATE - Lấy state hiện tại (cho debugging)
   */
  public getCurrentState(): IState | undefined {
    return this.currentState;
  }

  /**
   * 🔍 GET STATE NAME - Lấy tên của state hiện tại (cho debugging)
   */
  public getCurrentStateName(): string {
    return this.currentState?.constructor.name || "No State";
  }
}
