// frontend/phaser/classes/platformer/behaviors/SinkingSandBehavior.ts
import { Player } from "../Player";
import { ITileBehavior } from "./ITileBehavior";
import { BasePlatformerScene } from "../../../scenes";

export class SinkingSandBehavior implements ITileBehavior {
  // Trạng thái được quản lý bởi PlatformerPlayerHandler, hành vi này chỉ chứa logic
  private readonly SINK_TIME_LIMIT: number = 100; // 2 giây
  private readonly SINK_SPEED: number = 40; // px/giây

  public onPlayerCollide(
    _tile: Phaser.Tilemaps.Tile,
    _player: Player,
    _scene: BasePlatformerScene
  ): void {
    // Không làm gì trong onPlayerCollide vì logic được xử lý trong shouldCollide
  }

  public shouldCollide(
    tile: Phaser.Tilemaps.Tile,
    player: Player,
    scene: BasePlatformerScene
  ): boolean {
    const playerSprite = player.getSprite();
    const body = playerSprite.body as Phaser.Physics.Arcade.Body;

    // Lấy handler để truy cập state của cát lún
    const handler = (scene as any).playerHandler as any;
    if (!handler) return true;

    // Chỉ xử lý khi người chơi ở phía trên và đang rơi/xuống
    const tileTop = tile.getTop();
    const tolerance = 8;
    const isPlayerAbove = body.bottom <= tileTop + tolerance;
    const isPlayerFalling = body.velocity.y >= 0;

    if (!isPlayerAbove || !isPlayerFalling) {
      return false; // Đi xuyên qua nếu không ở trên
    }

    handler.markOnSinkingSand(); // Đánh dấu đang ở trên cát trong frame này
    const timer = handler.getSinkingSandTimer();
    const dt = scene.game.loop.delta;

    if (timer < this.SINK_TIME_LIMIT) {
      const sinkDelta = this.SINK_SPEED * (dt / 1000);
      playerSprite.y += sinkDelta;
      return true; // Cho phép va chạm để đứng trên bề mặt
    }

    return false; // Hết thời gian, rơi xuyên qua
  }
}
