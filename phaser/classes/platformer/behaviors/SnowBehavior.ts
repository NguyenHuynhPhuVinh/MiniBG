// frontend/phaser/classes/platformer/behaviors/SnowBehavior.ts
import { Player } from "../Player";
import { ITileBehavior } from "./ITileBehavior";
import { BasePlatformerScene } from "../../../scenes";
import { SnowSlowEffect } from "../effects";

export class SnowBehavior implements ITileBehavior {
  public onPlayerCollide(
    _tile: Phaser.Tilemaps.Tile,
    player: Player,
    _scene: BasePlatformerScene
  ): void {
    const body = player.getSprite().body as Phaser.Physics.Arcade.Body;
    // Chỉ kích hoạt khi người chơi đang đứng trên tuyết
    if (body.blocked.down) {
      player.setOnSnow(true);
      player.addStatusEffect(new SnowSlowEffect());
    }
  }

  public shouldCollide(
    _tile: Phaser.Tilemaps.Tile,
    _player: Player,
    _scene: BasePlatformerScene
  ): boolean {
    // Tuyết luôn là một vật cản cứng
    return true;
  }
}
