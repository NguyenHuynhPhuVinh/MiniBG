import { Room } from "colyseus.js";
import { IInteractiveObjectView } from "./IInteractiveObjectView";
import { BombView } from "./BombView";
import { InstantSpikeTrapView } from "./InstantSpikeTrapView";
import { GenericPhysicsView } from "./GenericPhysicsView";

type Factory = (id: string) => IInteractiveObjectView;

export class InteractiveObjectManager {
  private scene: Phaser.Scene;
  private room: Room<any>;

  private activeObjects: Map<string, IInteractiveObjectView> = new Map();
  private pools: Map<string, IInteractiveObjectView[]> = new Map();
  private factory: Map<string, Factory> = new Map();

  constructor(scene: Phaser.Scene, room: Room<any>) {
    this.scene = scene;
    this.room = room;
    this.register();
  }

  private register(): void {
    this.factory.set("bomb", (id) => new BombView(id));
    this.factory.set(
      "instant_spike_trap",
      (id) => new InstantSpikeTrapView(id)
    );
    // THÊM DÒNG NÀY: Generic physics view thay thế cho rock
    this.factory.set(
      "generic_physics_object",
      (id) => new GenericPhysicsView(id)
    );
  }

  private getFromPool(type: string): IInteractiveObjectView | null {
    const pool = this.pools.get(type);
    if (!pool || pool.length === 0) return null;
    return pool.pop()!;
  }

  private releaseToPool(obj: IInteractiveObjectView): void {
    if (!this.pools.has(obj.type)) this.pools.set(obj.type, []);
    this.pools.get(obj.type)!.push(obj);
  }

  public spawnFromState(
    type: string,
    id: string,
    networkState: any,
    options?: any
  ): void {
    let view = this.getFromPool(type);
    if (!view) {
      const creator = this.factory.get(type);
      if (!creator) {
        console.error(`[InteractiveObjectManager] Unknown type: ${type}`);
        return;
      }
      view = creator(id);
    }
    this.activeObjects.set(id, view);
    view.createView(this.scene, this.room, networkState, options);
  }

  public despawn(id: string): void {
    const view = this.activeObjects.get(id);
    if (!view) return;
    view.destroyView();
    this.activeObjects.delete(id);
    this.releaseToPool(view);
  }

  public update(delta: number): void {
    this.activeObjects.forEach((v) => v.update(delta));
  }
}
