import { Player } from "../Player";
import type { ICommand } from "../commands";

/**
 * 🎯 STATE INTERFACE - "Hợp đồng" cho tất cả các State (CẬP NHẬT)
 *
 * CHỨC NĂNG:
 * - Định nghĩa chuẩn interface cho State Machine Pattern
 * - Mỗi state phải implement lifecycle methods
 * - **MỚI**: Hỗ trợ Command Pattern processing
 * - Đảm bảo tất cả states có cùng cách thức hoạt động
 */
export interface IState {
  /** Reference đến Player đang được điều khiển */
  player: Player;

  /**
   * 🚪 ENTER - Được gọi một lần duy nhất khi chuyển SANG state này
   *
   * Dùng để:
   * - Khởi tạo trạng thái ban đầu
   * - Set velocity cho physics
   * - Trigger sound effects
   * - Setup state-specific configurations
   */
  enter(): void;

  /**
   * 🎮 PROCESS COMMAND - Xử lý command trong state này (BẮT BUỘC)
   *
   * Dùng để:
   * - Nhận và xử lý commands từ input/AI/replay
   * - Quyết định có chuyển state hay không dựa trên command
   * - Thực hiện hành động cụ thể trong state hiện tại
   *
   * @param command Command cần xử lý
   */
  processCommand(command: ICommand): void;

  /**
   * 🔄 UPDATE - Được gọi mỗi frame để xử lý hành động liên tục (TÙYCHỌN)
   *
   * Dùng để:
   * - Xử lý các hành động liên tục (giữ phím)
   * - Kiểm tra điều kiện chuyển state dựa trên physics
   * - Update movement logic không phụ thuộc input
   * - Handle continuous behaviors
   */
  update?(): void;

  /**
   * 🚪 EXIT - Được gọi một lần duy nhất khi chuyển TỪ state này RA
   *
   * Dùng để:
   * - Cleanup state-specific data
   * - Reset flags
   * - Stop sound effects
   * - Prepare for transition
   */
  exit(): void;
}
