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

    // Lấy cấu hình layout theo hướng màn hình
    const cfg = this.getLayoutConfig();
    const size = cfg.size;
    const dpadSize = Math.round(size * cfg.dpadScale);
    const dpadSpacing = Math.round(cfg.spacing * cfg.dpadSpacingScale);
    const baseY = height - cfg.bottom - dpadSize / 2; // chỉ ảnh hưởng trục Y
    const leftX = cfg.left + dpadSize / 2; // không phụ thuộc bottom
    const rightX = leftX + dpadSize + dpadSpacing;

    // --- Nút di chuyển ---
    const dpadLeft = this.createButton("dpad_left", leftX, baseY, "left");
    dpadLeft
      .setDisplaySize(dpadSize, dpadSize)
      .setScrollFactor(0)
      .setDepth(10001);
    const dpadRight = this.createButton("dpad_right", rightX, baseY, "right");
    dpadRight
      .setDisplaySize(dpadSize, dpadSize)
      .setScrollFactor(0)
      .setDepth(10001);

    // --- CỤM NÚT HÀNH ĐỘNG (BÊN PHẢI, LAYOUT MỚI) ---
    
    // Vị trí Y cho hàng dưới cùng (Jump và Grab)
    const bottomRowY = height - cfg.bottom - size / 2;

    // Vị trí X cho Jump (bên phải) và Grab (bên trái của Jump)
    const jumpX = width - cfg.right - size / 2;
    const grabX = jumpX - size - cfg.spacing;

    // Vị trí cho nút Carry (ở trên nút Jump)
    const carryX = jumpX; // Nằm thẳng hàng với nút Jump
    const carryY = bottomRowY - size - cfg.spacing;

    // Tạo các nút với vị trí mới
    const jumpButton = this.createButton("button_jump", jumpX, bottomRowY, "jump");
    jumpButton.setDisplaySize(size, size).setScrollFactor(0).setDepth(10001);
    const grabButton = this.createButton("button_grab", grabX, bottomRowY, "grab");
    grabButton.setDisplaySize(size, size).setScrollFactor(0).setDepth(10001);
    const carryButton = this.createButton("button_carry", carryX, carryY, "carry");
    carryButton.setDisplaySize(size, size).setScrollFactor(0).setDepth(10001);

    this.container.add([dpadLeft, dpadRight, jumpButton, grabButton, carryButton]);

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
    const cfg = this.getLayoutConfig();
    const size = cfg.size;
    const dpadSize = Math.round(size * cfg.dpadScale);
    const dpadSpacing = Math.round(cfg.spacing * cfg.dpadSpacingScale);
    const baseY = height - cfg.bottom - dpadSize / 2;
    const leftX = cfg.left + dpadSize / 2;
    const rightX = leftX + dpadSize + dpadSpacing;
    
    // --- CẬP NHẬT REPOSITION CHO CỤM NÚT HÀNH ĐỘNG (LAYOUT MỚI) ---
    const bottomRowY = height - cfg.bottom - size / 2;
    const jumpX = width - cfg.right - size / 2;
    const grabX = jumpX - size - cfg.spacing;
    const carryX = jumpX; // Cùng cột với Jump
    const carryY = bottomRowY - size - cfg.spacing;

    const children = this.container.list as Phaser.GameObjects.Image[];
    if (children.length >= 5) { // Đảm bảo có đủ 5 nút
      const [dpadLeft, dpadRight, jumpButton, grabButton, carryButton] = children;
      
      // D-pad
      dpadLeft.setPosition(leftX, baseY).setDisplaySize(dpadSize, dpadSize);
      dpadRight.setPosition(rightX, baseY).setDisplaySize(dpadSize, dpadSize);
      
      // Action buttons
      jumpButton.setPosition(jumpX, bottomRowY).setDisplaySize(size, size);
      grabButton.setPosition(grabX, bottomRowY).setDisplaySize(size, size);
      carryButton.setPosition(carryX, carryY).setDisplaySize(size, size);
    }
  }

  // Xác định layout theo hướng màn hình
  private getLayoutConfig(): {
    size: number;
    bottom: number;
    left: number;
    right: number;
    spacing: number;
    dpadScale: number;
    dpadSpacingScale: number;
  } {
    const cam = this.scene.cameras.main;
    const isLandscape = cam.width >= cam.height;

    if (isLandscape) {
      // Màn hình ngang: nút to và cách đáy hơn một chút
      const size = Math.max(80, Math.min(140, Math.floor(cam.height * 0.18)));
      return {
        size,
        bottom: 0,
        left: 16,
        right: 16,
        spacing: 18,
        dpadScale: 1.25,
        dpadSpacingScale: 2.0,
      };
    }

    // Màn hình dọc: nhỏ gọn, sát đáy hơn
    const size = Math.max(56, Math.min(110, Math.floor(cam.height * 0.1)));
    return {
      size,
      bottom: 0,
      left: 16,
      right: 16,
      spacing: 16,
      dpadScale: 1.2,
      dpadSpacingScale: 1.25,
    };
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
