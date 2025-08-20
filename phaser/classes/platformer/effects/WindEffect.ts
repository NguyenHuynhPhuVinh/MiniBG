import { Player } from "../Player";
import { BasePlatformerScene } from "../../../scenes";
import { IEnvironmentalEffect } from "./IEnvironmentalEffect";
import * as Phaser from "phaser";

interface WindZone {
  name: string;
  area: Phaser.Geom.Rectangle;
  force: number;
  springMultiplier: number;
}

/**
 * Hiệu ứng gió, có thể được áp dụng cho bất kỳ Scene nào.
 * Toàn bộ logic về gió được đóng gói tại đây.
 */
export class WindEffect implements IEnvironmentalEffect {
  private scene!: BasePlatformerScene;
  private windZones: WindZone[] = [];

  private readonly MAX_WIND_FORCE_X = -1000;
  private readonly MAX_VELOCITY_Y = -2000;

  public initialize(scene: BasePlatformerScene): void {
    this.scene = scene;
    this.loadWindZonesFromTiled();
    console.log(`💨 WindEffect initialized for scene ${scene.scene.key}.`);
  }

  public update(player: Player): void {
    if (player.getIsHorizontallyLaunched() || player.getIsBeingKnockedBack()) {
      return;
    }

    const playerSprite = player.getSprite();
    if (!(playerSprite as any).body) return;

    const currentZone = this.getCurrentWindZone(playerSprite.x, playerSprite.y);
    if (!currentZone) return;

    const room = (this.scene as any).room as any;
    if (!room || !room.state) return;

    const serverWindDirection = (room.state as any)
      .windDirectionMultiplier as number;
    const ambientWindForce = currentZone.force * serverWindDirection;

    let burstWindForce = 0;
    if (player.getIsSpringLaunched()) {
      const playerVelocityY = (playerSprite.body as any).velocity.y as number;
      const progress = Phaser.Math.Percent(
        Math.abs(playerVelocityY),
        0,
        Math.abs(this.MAX_VELOCITY_Y)
      );
      const burstFactor = Phaser.Math.Clamp(progress, 0, 1);
      const baseBurstForce = Phaser.Math.Linear(
        0,
        this.MAX_WIND_FORCE_X,
        burstFactor
      );
      burstWindForce =
        baseBurstForce * currentZone.springMultiplier * serverWindDirection;
    }

    const totalWindForce = ambientWindForce + burstWindForce;
    player.applyExternalForce({ x: totalWindForce, y: 0 });
  }

  private loadWindZonesFromTiled(): void {
    this.windZones = [];
    const objectLayer = this.scene.getTilemap().getObjectLayer("Objects");

    if (!objectLayer) return;

    (objectLayer.objects as any[]).forEach((obj: any) => {
      const windForceProp = obj.properties?.find(
        (p: any) => p.name === "windForce"
      );
      if (windForceProp) {
        const name = obj.name || "Unnamed Wind Zone";
        const force = windForceProp.value || 0;
        const multiplierProp = obj.properties?.find(
          (p: any) => p.name === "springMultiplier"
        );
        const springMultiplier = multiplierProp ? multiplierProp.value : 1.0;
        const area = new Phaser.Geom.Rectangle(
          obj.x,
          obj.y,
          obj.width,
          obj.height
        );
        this.windZones.push({ name, area, force, springMultiplier });
      }
    });

    console.log(
      `[WindEffect] Loaded ${this.windZones.length} wind zones from Tiled.`
    );
  }

  private getCurrentWindZone(
    playerX: number,
    playerY: number
  ): WindZone | null {
    for (const zone of this.windZones) {
      if (zone.area.contains(playerX, playerY)) {
        return zone;
      }
    }
    return null;
  }

  public cleanup(): void {
    this.windZones = [];
    console.log("💨 WindEffect cleaned up.");
  }
}
