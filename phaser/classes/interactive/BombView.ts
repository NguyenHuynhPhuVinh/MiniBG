import { Room, getStateCallbacks } from "colyseus.js";
import { IInteractiveObjectView } from "./IInteractiveObjectView";

export class BombView implements IInteractiveObjectView {
  public id: string;
  public type = "bomb";

  private scene!: Phaser.Scene;
  private room!: Room<any>;
  private matterSprite?: Phaser.Physics.Matter.Sprite;
  private proxy?: Phaser.Physics.Arcade.Sprite;
  private stateRef: any;

  // Only shake camera for local client near explosion
  private readonly SHAKE_RADIUS = 400;

  constructor(id: string) {
    this.id = id;
  }

  createView(scene: Phaser.Scene, room: Room<any>, networkState: any): void {
    this.scene = scene;
    this.room = room;
    this.stateRef = networkState;

    const s = networkState as any;

    const bombSprite = (scene as any).matter.add.sprite(
      s.x,
      s.y,
      "bomb",
      undefined,
      { label: `bomb_${this.id}` } as any
    );
    bombSprite.setDepth(450);
    bombSprite.setCircle(32); // Giữ nguyên hình tròn để lăn tốt

    // === CẤU HÌNH VẬT LÝ MỚI CHO CẢM GIÁC NĂNG ĐỘNG ===
    bombSprite.setBounce(0.5); // Nảy 50% - Chỉ nảy cao khi va chạm mạnh!
    bombSprite.setFriction(0.05); // Ma sát lăn thấp để lăn xa và mượt.
    bombSprite.setFrictionAir(0.01); // Tăng cản không khí để rơi dứt khoát.
    bombSprite.setDensity(0.1); // TĂNG MẬT ĐỘ 10 LẦN -> RẤT NẶNG!
    this.matterSprite = bombSprite;

    const proxy = (scene as any).physics.add.sprite(s.x, s.y, "bomb");
    proxy.setVisible(false);
    const proxyBody = proxy.body as Phaser.Physics.Arcade.Body;
    proxyBody.setAllowGravity(false);
    this.proxy = proxy;

    // Collider with local player if available
    const player = (scene as any).getPlayer?.()?.getSprite?.();
    if (player) {
      (scene as any).physics.add.collider(player, proxy, () => {
        const already = proxy.getData("triggered") === true;
        if (!already) {
          proxy.setData("triggered", true);
          try {
            room.send("playerHitBomb", { bombId: this.id });
          } catch {}
        }
      });
    }

    const $: any = getStateCallbacks(room);
    ($ as any)(networkState).onChange(() => {
      if (networkState.state === "exploding" && bombSprite.active) {
        const localPlayer = (this.scene as any).getPlayer?.();
        const localSprite = localPlayer?.getSprite?.();
        if (localSprite) {
          const d = Phaser.Math.Distance.Between(
            localSprite.x,
            localSprite.y,
            bombSprite.x,
            bombSprite.y
          );
          if (d <= this.SHAKE_RADIUS) {
            (this.scene as any).cameraManager?.shake(0.015, 250);
          }
        }

        this.playExplosionEffect(bombSprite.x, bombSprite.y);
        bombSprite.destroy();
        proxy.destroy();
        this.matterSprite = undefined;
        this.proxy = undefined;
      }
    });
  }

  update(_delta: number): void {
    if (!this.matterSprite || !this.proxy || !this.stateRef) return;

    // Keep proxy in sync with matter sprite
    this.proxy.setPosition(this.matterSprite.x, this.matterSprite.y);

    // Send state to server
    try {
      this.room.send("updateBombState", {
        bombId: this.id,
        x: this.matterSprite.x,
        y: this.matterSprite.y,
        velocityX: (this.matterSprite.body as any).velocity.x,
        velocityY: (this.matterSprite.body as any).velocity.y,
      });
    } catch {}

    // Light correction towards network state
    const dx = (this.stateRef.x as number) - this.matterSprite.x;
    const dy = (this.stateRef.y as number) - this.matterSprite.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 120) {
      this.matterSprite.setPosition(this.stateRef.x, this.stateRef.y);
      this.matterSprite.setVelocity(
        this.stateRef.velocityX || 0,
        this.stateRef.velocityY || 0
      );
    } else if (distance > 8) {
      const forceScale = 0.002;
      this.matterSprite.applyForce(
        new Phaser.Math.Vector2(dx * forceScale, dy * forceScale)
      );
    }
  }

  destroyView(): void {
    this.matterSprite?.destroy();
    this.proxy?.destroy();
    this.matterSprite = undefined;
    this.proxy = undefined;
  }

  private playExplosionEffect(x: number, y: number): void {
    const frames = [
      "explosion_0",
      "explosion_1",
      "explosion_2",
      "explosion_3",
      "explosion_4",
    ];
    const durationPerFrame = 40;
    const scaleStart = 0.8;
    const scaleEnd = 1.6;
    const depth = 600;

    const sprite = this.scene.add.image(x, y, frames[0]);
    sprite.setDepth(depth);
    sprite.setScale(scaleStart);
    sprite.setAlpha(1);

    let elapsed = 0;
    this.scene.time.addEvent({
      delay: durationPerFrame,
      repeat: frames.length - 1,
      callback: () => {
        const index = Math.min(
          1 + Math.floor(elapsed / durationPerFrame),
          frames.length - 1
        );
        sprite.setTexture(frames[index]);
        const t = Math.min(
          1,
          (elapsed + durationPerFrame) / (durationPerFrame * frames.length)
        );
        sprite.setScale(scaleStart + (scaleEnd - scaleStart) * t);
        elapsed += durationPerFrame;
        if (index === frames.length - 1) {
          this.scene.tweens.add({
            targets: sprite,
            alpha: 0,
            duration: 80,
            onComplete: () => sprite.destroy(),
          });
        }
      },
    });
  }
}
