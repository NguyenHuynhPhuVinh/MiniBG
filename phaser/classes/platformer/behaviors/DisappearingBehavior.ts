// frontend/phaser/classes/platformer/behaviors/DisappearingBehavior.ts
import { Player } from "../Player";
import { ITileBehavior } from "./ITileBehavior";
import { BasePlatformerScene } from "../../../scenes";

export class DisappearingBehavior implements ITileBehavior {
  public onPlayerCollide(
    tile: Phaser.Tilemaps.Tile,
    player: Player,
    scene: BasePlatformerScene
  ): void {
    const body = player.getSprite().body as Phaser.Physics.Arcade.Body;

    // Chỉ kích hoạt khi người chơi đang ở trên và tiếp đất
    if (body.blocked.down) {
      const room = (scene as any).room;
      if (room) {
        const tileId = `${tile.x}_${tile.y}`;
        // Gửi tin nhắn lên server, báo rằng block này đã bị chạm vào.
        room.send("playerHitBlock", { blockId: tileId });
      }
    }
  }

  public shouldCollide(
    _tile: Phaser.Tilemaps.Tile,
    _player: Player,
    _scene: BasePlatformerScene
  ): boolean {
    // Luôn cho phép va chạm cứng ban đầu. Server sẽ xử lý việc nó biến mất.
    return true;
  }
}


