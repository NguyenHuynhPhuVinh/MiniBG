import { Room } from "colyseus.js";

export interface IInteractiveObjectView {
  id: string;
  type: string;

  createView(
    scene: Phaser.Scene,
    room: Room<any>,
    networkState: any,
    options?: any
  ): void;
  update(deltaTime: number): void;
  destroyView(): void;
}
