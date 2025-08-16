import { IState } from "./IState";
import { Player } from "../Player";
import { ICommand } from "../commands";

/**
 * 🍂 FALL STATE - Trạng thái rơi
 *
 * CHỨC NĂNG:
 * - Player đang rơi xuống (velocity Y dương)
 * - Có thể di chuyển ngang trong khi rơi
 * - Chuyển về idle/move khi chạm đất
 *
 * TRANSITIONS:
 * - → IdleState: Khi landing mà không có input di chuyển
 * - → MoveState: Khi landing và có input di chuyển
 */
export class FallState implements IState {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  /**
   * 🚪 ENTER - Setup trạng thái rơi
   */
  enter(): void {
    console.log("🍂 Entered Fall State");
    // Fall state không cần setup gì đặc biệt
    // Gravity sẽ tự động kéo player xuống
  }

  /**
   * 🔄 UPDATE - update() giờ không nhận input, mà tự lấy từ manager
   */
  update(): void {
    const { IdleState } = require("./IdleState");
    const { MoveState } = require("./MoveState");

    // Kiểm tra chạm đất
    if (this.player.isOnGround()) {
      this.player.onLanding();
      // Lấy trạng thái input cuối cùng để quyết định
      const lastInput = this.player.getLastInputState();
      if (lastInput.left || lastInput.right) {
        this.player.stateMachine.changeState(
          new MoveState(this.player, lastInput.left ? "left" : "right")
        );
      } else {
        this.player.stateMachine.changeState(new IdleState(this.player));
      }
      return;
    }

    // Xử lý di chuyển trên không (air control)
    const airControlInput = this.player.getLastInputState();
    const speed = this.player.getConfig().physics.speed;
    if (airControlInput.left) {
      this.player.getSprite().setVelocityX(-speed);
    } else if (airControlInput.right) {
      this.player.getSprite().setVelocityX(speed);
    }
  }

  /**
   * 🎮 PROCESS COMMAND - Xử lý commands trong fall state (BẮT BUỘC)
   */
  processCommand(command: ICommand): void {
    // Có thể xử lý các command đặc biệt trên không sau này (vd: DashCommand)
  }

  /**
   * 🚪 EXIT - Cleanup khi rời fall state
   */
  exit(): void {
    // Fall state không cần cleanup gì đặc biệt
  }
}
