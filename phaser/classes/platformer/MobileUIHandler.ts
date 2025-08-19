import { Scene } from "phaser";
import { InputManager } from "./InputManager";

/**
 * 📱 MOBILE UI HANDLER - Chuyên gia xử lý giao diện và input trên di động
 *
 * TRÁCH NHIỆM:
 * - Tạo và hiển thị các nút điều khiển (trái, phải, nhảy, nắm).
 * - Gắn các nút vào camera để chúng không di chuyển khi camera cuộn.
 * - Lắng nghe sự kiện chạm (pointerdown, pointerup).
 * - Cập nhật trạng thái input trong InputManager.
 * - Cung cấp phương thức để ẩn/hiện toàn bộ UI.
 */
export class MobileUIHandler {
  private scene: Scene;
  private inputManager: InputManager;
  private container!: Phaser.GameObjects.Container;
  private resizeHandler?: (gameSize: Phaser.Structs.Size) => void;

  constructor(scene: Scene, inputManager: InputManager) {
    this.scene = scene;
    this.inputManager = inputManager;
    // Cho phép multi-touch: giữ nhiều nút cùng lúc
    this.scene.input.addPointer(3);
    this.createControls();
  }

  private createControls(): void {
    const { width, height } = this.scene.cameras.main;
    this.container = this.scene.add.container(0, 0);

    // Giữ UI trên camera, không cuộn theo thế giới
    this.container.setScrollFactor(0);
    this.container.setDepth(10000);

    // Kích thước và vị trí responsive theo màn hình
    const BOTTOM_MARGIN = -60; // chỉ dùng cho trục Y (đáy)
    const LEFT_MARGIN = -16; // lề trái cố định theo trục X
    const RIGHT_MARGIN = -16; // lề phải cố định theo trục X
    const SPACING = 16; // khoảng cách giữa các nút
    const size = Math.max(56, Math.min(96, Math.floor(height * 0.08))); // nút nhỏ hơn

    const baseY = height - BOTTOM_MARGIN - size / 2; // chỉ ảnh hưởng trục Y
    const leftX = LEFT_MARGIN + size / 2; // không phụ thuộc BOTTOM_MARGIN
    const rightX = leftX + size + SPACING;

    // --- Nút di chuyển ---
    const dpadLeft = this.createButton("dpad_left", leftX, baseY, "left");
    dpadLeft.setDisplaySize(size, size).setScrollFactor(0).setDepth(10001);
    const dpadRight = this.createButton("dpad_right", rightX, baseY, "right");
    dpadRight.setDisplaySize(size, size).setScrollFactor(0).setDepth(10001);

    // --- Nút hành động (xếp dọc ở góc phải): jump dưới, grab trên ---
    const actionX = width - RIGHT_MARGIN - size / 2; // không phụ thuộc BOTTOM_MARGIN
    const jumpY = baseY; // dưới
    const grabY = baseY - size - SPACING; // trên
    const jumpButton = this.createButton("button_jump", actionX, jumpY, "jump");
    jumpButton.setDisplaySize(size, size).setScrollFactor(0).setDepth(10001);
    const grabButton = this.createButton("button_grab", actionX, grabY, "grab");
    grabButton.setDisplaySize(size, size).setScrollFactor(0).setDepth(10001);

    this.container.add([dpadLeft, dpadRight, jumpButton, grabButton]);

    // Reposition khi thay đổi kích thước
    this.resizeHandler = () => this.reposition();
    this.scene.scale.on("resize", this.resizeHandler, this);
  }

  private createButton(
    texture: string,
    x: number,
    y: number,
    inputType: keyof (typeof this.inputManager)["mobileState"]
  ): Phaser.GameObjects.Image {
    const button = this.scene.add
      .image(x, y, texture)
      .setInteractive({ useHandCursor: false })
      .setAlpha(0.8)
      .setOrigin(0.5);

    button.on("pointerdown", () => {
      button.setAlpha(1.0);
      this.inputManager.setMobileInput(inputType, true);
    });

    const reset = () => {
      button.setAlpha(0.7);
      this.inputManager.setMobileInput(inputType, false);
    };

    button.on("pointerup", reset);
    button.on("pointerout", reset);
    button.on("pointerupoutside", reset as any);
    button.on("pointercancel", reset as any);

    return button;
  }

  private reposition(): void {
    const { width, height } = this.scene.cameras.main;
    const MARGIN = 6;
    const SPACING = 16;
    const size = Math.max(56, Math.min(96, Math.floor(height * 0.1)));
    const baseY = height - MARGIN - size / 2;
    const leftX = MARGIN + size / 2;
    const rightX = leftX + size + SPACING;
    const actionX = width - MARGIN - size / 2;
    const jumpY = baseY;
    const grabY = baseY - size - SPACING;

    const children = this.container.list as Phaser.GameObjects.Image[];
    if (children.length >= 4) {
      const [dpadLeft, dpadRight, jumpButton, grabButton] = children;
      dpadLeft.setPosition(leftX, baseY).setDisplaySize(size, size);
      dpadRight.setPosition(rightX, baseY).setDisplaySize(size, size);
      jumpButton.setPosition(actionX, jumpY).setDisplaySize(size, size);
      grabButton.setPosition(actionX, grabY).setDisplaySize(size, size);
    }
  }

  public show(): void {
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public destroy(): void {
    if (this.resizeHandler) {
      this.scene.scale.off("resize", this.resizeHandler, this);
      this.resizeHandler = undefined;
    }
    this.container.destroy();
  }
}
