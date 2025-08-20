// frontend/phaser/classes/platformer/behaviors/TileBehaviorFactory.ts
import { ITileBehavior } from "./ITileBehavior";
import { SpringBehavior } from "./SpringBehavior";
import { DisappearingBehavior } from "./DisappearingBehavior";
import { SnowBehavior } from "./SnowBehavior";
import { HazardBehavior } from "./HazardBehavior";
import { SinkingSandBehavior } from "./SinkingSandBehavior";

/**
 * Nhà máy Singleton để quản lý và cung cấp các lớp hành vi cho gạch.
 */
export class TileBehaviorFactory {
  private static instance: TileBehaviorFactory;
  private behaviors: Map<string, ITileBehavior> = new Map();

  private constructor() {
    // Đăng ký tất cả các hành vi đã biết tại đây
    this.register("spring", new SpringBehavior());
    this.register("disappearing", new DisappearingBehavior());
    this.register("snow", new SnowBehavior());
    this.register("hazard", new HazardBehavior());
    this.register("sinkingSand", new SinkingSandBehavior());
  }

  public static getInstance(): TileBehaviorFactory {
    if (!TileBehaviorFactory.instance) {
      TileBehaviorFactory.instance = new TileBehaviorFactory();
    }
    return TileBehaviorFactory.instance;
  }

  private register(type: string, behavior: ITileBehavior): void {
    this.behaviors.set(type, behavior);
  }

  public getBehavior(type: string): ITileBehavior | undefined {
    return this.behaviors.get(type);
  }
}
