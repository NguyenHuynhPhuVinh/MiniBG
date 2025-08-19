import { Scene } from "phaser";

/**
 * 🎮 INPUT STATE INTERFACE - Trạng thái tất cả input keys
 */
export interface InputState {
  left: boolean; // ← hoặc A
  right: boolean; // → hoặc D
  up: boolean; // ↑ hoặc W
  down: boolean; // ↓ hoặc S
  jump: boolean; // Space hoặc ↑ hoặc W
  grab: boolean; // E - Hành động nắm người chơi khác
}

/**
 * 🎮 INPUT MANAGER - Quản lý tất cả input từ bàn phím (PC only)
 *
 * CHỨC NĂNG:
 * - Hỗ trợ Arrow keys và WASD
 * - Space key cho jump
 * - Cung cấp input state cho Player class
 * - Hỗ trợ JustPressed detection cho jump buffering
 */
export class InputManager {
  private scene: Scene;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys; // Arrow keys
  private wasdKeys?: any; // WASD keys
  private spaceKey?: Phaser.Input.Keyboard.Key; // Space key
  private grabKey?: Phaser.Input.Keyboard.Key; // E key cho grab
  private inputState: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    grab: false,
  };

  // THÊM MỚI: State dành cho input trên thiết bị di động
  public mobileState: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    grab: false,
  };

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupKeyboardInput();
  }

  /**
   * ⚙️ SETUP KEYBOARD INPUT - Khởi tạo tất cả keys cần thiết
   */
  private setupKeyboardInput(): void {
    // Arrow keys (←↑→↓)
    this.cursors = this.scene.input.keyboard?.createCursorKeys();

    // WASD keys, Space key và E key
    if (this.scene.input.keyboard) {
      this.wasdKeys = this.scene.input.keyboard.addKeys("W,S,A,D");
      this.spaceKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.grabKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E
      );
    }
  }

  // THÊM MỚI: API để MobileUIHandler ghi trạng thái input
  public setMobileInput(key: keyof InputState, value: boolean): void {
    this.mobileState[key] = value;
  }

  /**
   * 🔄 UPDATE INPUT STATE - Được gọi mỗi frame để cập nhật trạng thái keys
   *
   * LOGIC:
   * 1. Đọc Arrow keys
   * 2. Đọc WASD keys (combine với Arrow keys bằng OR)
   * 3. Đọc Space key cho jump
   * 4. Up key cũng có thể dùng để jump
   *
   * @returns InputState hiện tại
   */
  public update(): InputState {
    // Đọc Arrow keys
    if (this.cursors) {
      this.inputState.left = this.cursors.left.isDown;
      this.inputState.right = this.cursors.right.isDown;
      this.inputState.up = this.cursors.up.isDown;
      this.inputState.down = this.cursors.down.isDown;
    }

    // Combine với WASD keys (OR logic)
    if (this.wasdKeys) {
      this.inputState.left = this.inputState.left || this.wasdKeys.A.isDown;
      this.inputState.right = this.inputState.right || this.wasdKeys.D.isDown;
      this.inputState.up = this.inputState.up || this.wasdKeys.W.isDown;
      this.inputState.down = this.inputState.down || this.wasdKeys.S.isDown;
    }

    // THÊM MỚI: Gộp với input từ mobile
    this.inputState.left = this.inputState.left || this.mobileState.left;
    this.inputState.right = this.inputState.right || this.mobileState.right;
    this.inputState.up = this.inputState.up || this.mobileState.up;
    this.inputState.down = this.inputState.down || this.mobileState.down;

    // Space key cho jump
    if (this.spaceKey) {
      this.inputState.jump = this.spaceKey.isDown;
    }

    // Up key cũng có thể dùng để jump (W hoặc ↑ hoặc Space)
    this.inputState.jump = this.inputState.jump || this.inputState.up;

    // THÊM MỚI: Jump từ mobile
    this.inputState.jump = this.inputState.jump || this.mobileState.jump;

    // Đọc E key cho grab
    if (this.grabKey) {
      this.inputState.grab = this.grabKey.isDown;
    }

    // THÊM MỚI: Grab từ mobile
    this.inputState.grab = this.inputState.grab || this.mobileState.grab;

    return { ...this.inputState };
  }

  /**
   * 📊 LẤY INPUT STATE HIỆN TẠI - Public method cho external access
   * @returns Copy của InputState hiện tại
   */
  public getInputState(): InputState {
    return { ...this.inputState };
  }

  /**
   * ⚡ KIỂM TRA KEY VỪA ĐƯỢC NHẤN - Cho jump buffering
   *
   * CHỨC NĂNG:
   * - Phát hiện key vừa được nhấn (không phải đang giữ)
   * - Hỗ trợ jump buffering trong Player class
   * - Fixed: Hỗ trợ cả WASD keys để tránh âm thanh nhảy bị duplicate
   *
   * @param key - Key cần kiểm tra
   * @returns true nếu key vừa được nhấn
   */
  public isJustPressed(key: keyof InputState): boolean {
    switch (key) {
      case "up":
      case "jump":
        // Jump có thể từ Up arrow, W key, hoặc Space key
        return (
          (this.cursors?.up.isDown &&
            Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
          (this.wasdKeys?.W.isDown &&
            Phaser.Input.Keyboard.JustDown(this.wasdKeys.W)) ||
          (this.spaceKey?.isDown &&
            Phaser.Input.Keyboard.JustDown(this.spaceKey)) ||
          false
        );
      case "left":
        return (
          (this.cursors?.left.isDown &&
            Phaser.Input.Keyboard.JustDown(this.cursors.left)) ||
          (this.wasdKeys?.A.isDown &&
            Phaser.Input.Keyboard.JustDown(this.wasdKeys.A)) ||
          false
        );
      case "right":
        return (
          (this.cursors?.right.isDown &&
            Phaser.Input.Keyboard.JustDown(this.cursors.right)) ||
          (this.wasdKeys?.D.isDown &&
            Phaser.Input.Keyboard.JustDown(this.wasdKeys.D)) ||
          false
        );
      case "grab":
        // E key cho grab
        return (
          (this.grabKey?.isDown &&
            Phaser.Input.Keyboard.JustDown(this.grabKey)) ||
          false
        );
      default:
        return false;
    }
  }

  /**
   * 🗑️ CLEANUP - Giải phóng references
   */
  public destroy(): void {
    this.scene = null as any;
  }
}
