import { Room, getStateCallbacks } from "colyseus.js";
import { IInteractiveObjectView } from "./IInteractiveObjectView";

export class InstantSpikeTrapView implements IInteractiveObjectView {
  public id: string;
  public type = "instant_spike_trap";

  private scene!: Phaser.Scene;
  private sprite!: Phaser.GameObjects.Sprite;
  private stateRef: any;

  constructor(id: string) {
    this.id = id;
  }

  createView(scene: Phaser.Scene, room: Room<any>, networkState: any): void {
    this.scene = scene;
    this.stateRef = networkState;

    // Tạo sprite với ảnh gai - ban đầu VÔ HÌNH
    this.sprite = this.scene.add.sprite(
      networkState.x,
      networkState.y,
      "spike_trap_image"
    );
    this.sprite.setDepth(10); // Nằm dưới người chơi
    this.sprite.setVisible(false); // Quan trọng: Ban đầu VÔ HÌNH

    // Đặt kích thước sprite để khớp với hitbox 64x64
    this.sprite.setDisplaySize(64, 64);

    // Đặt origin ở center để khớp đúng vị trí object trong Tiled
    this.sprite.setOrigin(0.5, 0.5);

    // Áp dụng Light2D pipeline nếu scene hỗ trợ lighting
    if (
      (this.scene as any).isLightingEnabled &&
      (this.scene as any).isLightingEnabled()
    ) {
      this.sprite.setPipeline("Light2D");
      console.log(
        `[Client] InstantSpikeTrapView ${this.id}: Applied Light2D pipeline for dark scenes`
      );
    }

    console.log(
      `[Client] InstantSpikeTrapView ${this.id} created at (${networkState.x}, ${networkState.y})`
    );

    // Lắng nghe thay đổi trạng thái từ server
    const $ = getStateCallbacks(room);
    $(networkState).onChange(() => {
      this.handleStateChange(networkState.state);
    });
  }

  private handleStateChange(state: string): void {
    if (state === "active") {
      // Hiện gai ngay lập tức ở vị trí object
      this.sprite.setVisible(true);

      // Chơi âm thanh bẫy
      if (this.scene.sound) {
        this.scene.sound.play("hurt", { volume: 0.8, rate: 1.2 });
      }

      console.log(`[Client] InstantSpikeTrap ${this.id} activated!`);
    } else {
      // state === 'idle'
      // Ẩn gai ngay lập tức
      this.sprite.setVisible(false);
      console.log(`[Client] InstantSpikeTrap ${this.id} deactivated`);
    }
  }

  update(_delta: number): void {
    // Không cần update logic, chỉ hiển thị theo server state
  }

  destroyView(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
    console.log(`[Client] InstantSpikeTrapView ${this.id} destroyed`);
  }
}
