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
  carry: boolean; // F - Hành động bế/ném người chơi khác
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
  private carryKey?: Phaser.Input.Keyboard.Key; // F key cho carry/throw
  private inputState: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    grab: false,
    carry: false,
  };

  // THÊM MỚI: State dành cho input trên thiết bị di động
  public mobileState: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    grab: false,
    carry: false,
  };

  // THÊM MỚI: Bộ cờ JustPressed cho mobile (được set tại thời điểm pointerdown)
  private mobileJustPressed: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    grab: false,
    carry: false,
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

    // WASD keys, Space key, E key và F key
    if (this.scene.input.keyboard) {
      this.wasdKeys = this.scene.input.keyboard.addKeys("W,S,A,D");
      this.spaceKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.grabKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E
      );
      this.carryKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.F
      );
    }
  }

  // THÊM MỚI: API để MobileUIHandler ghi trạng thái input
  public setMobileInput(key: keyof InputState, value: boolean): void {
    if (value && !this.mobileState[key]) {
      // Rising edge -> đánh dấu vừa nhấn
      this.mobileJustPressed[key] = true;
    }
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

    // Đọc F key cho carry/throw
    if (this.carryKey) {
      this.inputState.carry = this.carryKey.isDown;
    }

    // THÊM MỚI: Grab từ mobile
    this.inputState.grab = this.inputState.grab || this.mobileState.grab;

    // THÊM MỚI: Carry từ mobile
    this.inputState.carry = this.inputState.carry || this.mobileState.carry;

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
    // Helper để tiêu thụ cờ mobile just pressed (và reset về false)
    const consumeMobile = (k: keyof InputState) => {
      const was = this.mobileJustPressed[k];
      if (was) this.mobileJustPressed[k] = false;
      return was;
    };

    switch (key) {
      case "up":
      case "jump":
        return (
          (this.cursors?.up.isDown &&
            Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
          (this.wasdKeys?.W.isDown &&
            Phaser.Input.Keyboard.JustDown(this.wasdKeys.W)) ||
          (this.spaceKey?.isDown &&
            Phaser.Input.Keyboard.JustDown(this.spaceKey)) ||
          consumeMobile("jump") ||
          consumeMobile("up")
        );
      case "left":
        return (
          (this.cursors?.left.isDown &&
            Phaser.Input.Keyboard.JustDown(this.cursors.left)) ||
          (this.wasdKeys?.A.isDown &&
            Phaser.Input.Keyboard.JustDown(this.wasdKeys.A)) ||
          consumeMobile("left")
        );
      case "right":
        return (
          (this.cursors?.right.isDown &&
            Phaser.Input.Keyboard.JustDown(this.cursors.right)) ||
          (this.wasdKeys?.D.isDown &&
            Phaser.Input.Keyboard.JustDown(this.wasdKeys.D)) ||
          consumeMobile("right")
        );
      case "grab":
        return (
          (this.grabKey?.isDown &&
            Phaser.Input.Keyboard.JustDown(this.grabKey)) ||
          consumeMobile("grab")
        );
      case "carry":
        return (
          (this.carryKey?.isDown &&
            Phaser.Input.Keyboard.JustDown(this.carryKey)) ||
          consumeMobile("carry")
        );
      default:
        return consumeMobile(key);
    }
  }

  /**
   * 🗑️ CLEANUP - Giải phóng references
   */
  public destroy(): void {
    this.scene = null as any;
  }
}
