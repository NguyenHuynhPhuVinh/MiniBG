// frontend/phaser/classes/platformer/behaviors/SpringBehavior.ts
import { Player } from "../Player";
import { ITileBehavior } from "./ITileBehavior";
import { BasePlatformerScene } from "../../../scenes";

export class SpringBehavior implements ITileBehavior {
  public onPlayerCollide(
    tile: Phaser.Tilemaps.Tile,
    player: Player,
    scene: BasePlatformerScene
  ): void {
    const body = player.getSprite().body as Phaser.Physics.Arcade.Body;

    const rotationInDegrees = Phaser.Math.RadToDeg(tile.rotation);
    let springDirection: "up" | "right" | "left" | "down" = "up";

    if (rotationInDegrees >= 45 && rotationInDegrees < 135) springDirection = "right";
    else if (rotationInDegrees >= 135 && rotationInDegrees < 225) springDirection = "down";
    else if (rotationInDegrees >= 225 && rotationInDegrees < 315) springDirection = "left";

    const baseBouncePower = (tile.properties as any).bouncePower || 800;
    const fallDistance = player.getFallDistance();
    const bonusBounce = fallDistance * 1.25;
    const totalBouncePower = baseBouncePower + bonusBounce;
    const finalBouncePower = Math.min(totalBouncePower, 2500);

    let appliedForce = false;

    switch (springDirection) {
      case "up":
        if (body.blocked.down) {
          body.setVelocityY(-finalBouncePower);
          player.setSpringLaunched();
          appliedForce = true;
        }
        break;
      case "right":
        if (body.blocked.left) {
          body.setVelocityX(finalBouncePower);
          body.setVelocityY(-300);
          player.setHorizontallyLaunched();
          appliedForce = true;
        }
        break;
      case "left":
        if (body.blocked.right) {
          body.setVelocityX(-finalBouncePower);
          body.setVelocityY(-300);
          player.setHorizontallyLaunched();
          appliedForce = true;
        }
        break;
      case "down":
        if (body.blocked.up) {
          body.setVelocityY(finalBouncePower);
          appliedForce = true;
        }
        break;
    }

    if (appliedForce) {
      const springId = `${tile.x}_${tile.y}`;
      if ((scene as any).room) {
        (scene as any).room.send("playerHitSpring", { springId });
      }
    }
  }

  public shouldCollide(
    _tile: Phaser.Tilemaps.Tile,
    _player: Player,
    _scene: BasePlatformerScene
  ): boolean {
    // Lò xo luôn là vật cản cứng để có thể nảy lên
    return true;
  }
}


