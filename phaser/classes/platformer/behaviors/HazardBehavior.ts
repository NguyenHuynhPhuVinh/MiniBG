// frontend/phaser/classes/platformer/behaviors/HazardBehavior.ts
import { Player } from "../Player";
import { ITileBehavior } from "./ITileBehavior";
import { BasePlatformerScene } from "../../../scenes";

export class HazardBehavior implements ITileBehavior {
  public onPlayerCollide(
    tile: Phaser.Tilemaps.Tile,
    player: Player,
    scene: BasePlatformerScene
  ): void {
    // Logic khi va chạm với vật nguy hiểm
    scene.handlePlayerDeathByHazard(tile);
  }

  public shouldCollide(
    _tile: Phaser.Tilemaps.Tile,
    _player: Player,
    _scene: BasePlatformerScene
  ): boolean {
    // Thường thì vật nguy hiểm sẽ cho phép va chạm để kích hoạt hiệu ứng
    return true;
  }
}


