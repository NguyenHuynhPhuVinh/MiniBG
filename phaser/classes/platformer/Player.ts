import { Scene } from "phaser";
import { AnimationManager } from "./AnimationManager";
import { InputManager, InputState } from "./InputManager";
import { CommandInputManager } from "./CommandInputManager";
import { CameraManager } from "./CameraManager";
import { CharacterAnimations, DEFAULT_CHARACTER } from "./CharacterFrames";
import { StateMachine, IdleState } from "./states";
import type { ICommand } from "./commands";

/**
 * 🏃 PLAYER CONFIG INTERFACE - Cấu hình khởi tạo Player
 */
export interface PlayerConfig {
  x: number; // Vị trí spawn X
  y: number; // Vị trí spawn Y
  texture: string; // Texture key cho sprite
  characterData?: CharacterAnimations; // Frame data cho animations
  physics?: {
    speed: number; // Tốc độ di chuyển ngang
    jumpPower: number; // Lực nhảy
    gravity: number; // Trọng lực
    bounce: number; // Độ nảy khi va chạm
  };
}

/**
 * 📊 PLAYER STATE INTERFACE - Trạng thái hiện tại của Player
 */
export interface PlayerState {
  isOnGround: boolean; // Có đang trên mặt đất không
  isJumping: boolean; // Có đang nhảy không
  isFalling: boolean; // Có đang rơi không
  isMoving: boolean; // Có đang di chuyển không
  facingDirection: "left" | "right"; // Hướng mặt
  health: number; // Máu (0-100)
  score: number; // Điểm số
}

/**
 * 🏃 PLAYER CLASS - Nhân vật chính của game
 *
 * CHỨC NĂNG:
 * - Quản lý movement với advanced features (coyote time, jump buffering)
 * - Tích hợp AnimationManager, InputManager, CameraManager
 * - Physics integration với Arcade Body
 * - State management (health, score, ground detection)
 * - Auto-update animations dựa trên movement state
 */
export class Player {
  // === CORE COMPONENTS ===
  private scene: Scene;
  private sprite!: Phaser.Physics.Arcade.Sprite; // Sprite chính
  private animationManager!: AnimationManager; // Quản lý animations
  private inputManager: InputManager; // Quản lý input (legacy)
  private commandInputManager!: CommandInputManager; // Command pattern input (mới)
  private cameraManager: CameraManager; // Quản lý camera

  // === STATE MACHINE ===
  public stateMachine!: StateMachine; // State Machine thay thế boolean flags

  // === CONFIG & STATE ===
  private config: Required<PlayerConfig>; // Config đầy đủ
  private state: PlayerState; // Trạng thái hiện tại

  // === ADVANCED MOVEMENT FEATURES ===
  private lastGroundedTime: number = 0; // Lần cuối trên mặt đất
  private coyoteTime: number = 150; // Thời gian coyote (ms)
  private jumpBufferTime: number = 100; // Thời gian jump buffer (ms)
  private jumpBuffer: number = 0; // THAY ĐỔI: Thay thế lastJumpPressTime bằng jumpBuffer
  private hasJumped: boolean = false; // Đã nhảy trong lần này chưa
  private lastJumpTime: number = 0; // Lần cuối thực hiện jump
  private jumpCooldown: number = 200; // Cooldown giữa các lần jump (ms)

  /**
   * 🏗️ CONSTRUCTOR - Khởi tạo Player với đầy đủ dependencies
   */
  constructor(
    scene: Scene,
    config: PlayerConfig,
    inputManager: InputManager,
    cameraManager: CameraManager
  ) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.cameraManager = cameraManager;

    // Merge config với defaults
    this.config = {
      x: config.x,
      y: config.y,
      texture: config.texture,
      characterData: config.characterData || DEFAULT_CHARACTER,
      physics: config.physics || {
        speed: 200, // Tốc độ di chuyển ngang
        jumpPower: 400, // Lực nhảy
        gravity: 800, // Trọng lực
        bounce: 0.2, // Độ nảy
      },
    };

    // Khởi tạo state ban đầu
    this.state = {
      isOnGround: false,
      isJumping: false,
      isFalling: false,
      isMoving: false,
      facingDirection: "right",
      health: 100,
      score: 0,
    };

    // Setup theo thứ tự: frames → sprite → physics → animations → camera → STATE MACHINE → COMMAND INPUT
    this.setupFrames();
    this.createSprite();
    this.setupPhysics();
    this.setupAnimations();
    this.setupCamera();
    this.setupStateMachine();
    this.setupCommandInput();
  }

  /**
   * 🖼️ SETUP FRAMES - Add frames vào texture trước khi tạo sprite
   *
   * CHỨC NĂNG:
   * - Lấy character frame data từ config
   * - Add từng frame vào Phaser texture với unique key
   * - Tránh duplicate frames bằng cách check exists
   */
  private setupFrames(): void {
    const texture = this.scene.textures.get(this.config.texture);

    // Duyệt qua tất cả animation states (idle, walk, jump, fall)
    Object.entries(this.config.characterData).forEach(([, frames]) => {
      frames.forEach((frame: any, index: number) => {
        const frameKey = `char_${frame.x}_${frame.y}_${index}`;

        // Chỉ add frame nếu chưa tồn tại (tránh duplicate)
        if (!texture.has(frameKey)) {
          texture.add(frameKey, 0, frame.x, frame.y, frame.width, frame.height);
        }
      });
    });
  }

  /**
   * 🎭 TẠO SPRITE - Tạo physics sprite với frame đầu tiên
   */
  private createSprite(): void {
    // Lấy frame đầu tiên của idle animation làm frame khởi tạo
    const firstFrame = this.config.characterData.idle[0];
    const frameKey = `char_${firstFrame.x}_${firstFrame.y}_0`;

    // Tạo physics sprite tại vị trí spawn
    this.sprite = this.scene.physics.add.sprite(
      this.config.x,
      this.config.y,
      this.config.texture,
      frameKey
    );

    // Scale từ 128x128 xuống 96x96 (vừa phải cho platformer)
    this.sprite.setDisplaySize(96, 96);
  }

  /**
   * ⚡ SETUP PHYSICS - Cấu hình physics body cho player
   */
  private setupPhysics(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Cấu hình physics properties
    body.setBounce(this.config.physics.bounce);
    body.setCollideWorldBounds(true); // Không rơi ra ngoài map
    body.setGravityY(this.config.physics.gravity);

    // Hitbox nhỏ hơn sprite để collision chính xác hơn
    body.setSize(64, 64); // Kích thước hitbox
    body.setOffset(32, 64); // Offset để center và chân gần đất

    // DEBUG: Uncomment để hiển thị hitbox
    // this.scene.physics.world.createDebugGraphic();
  }

  /**
   * 🎬 SETUP ANIMATIONS - Khởi tạo AnimationManager
   */
  private setupAnimations(): void {
    this.animationManager = new AnimationManager(
      this.scene,
      this.sprite,
      this.config.characterData
    );
  }

  /**
   * 📷 SETUP CAMERA - Bắt đầu camera follow player
   */
  private setupCamera(): void {
    this.cameraManager.followTarget(this.sprite);
  }

  /**
   * 🎛️ SETUP STATE MACHINE - Khởi tạo State Machine với IdleState
   */
  private setupStateMachine(): void {
    this.stateMachine = new StateMachine();
    this.stateMachine.initialize(new IdleState(this));
  }

  /**
   * 🎮 SETUP COMMAND INPUT - Khởi tạo Command Input Manager (MỚI)
   */
  private setupCommandInput(): void {
    this.commandInputManager = new CommandInputManager(this.inputManager);
  }

  /**
   * 🔄 UPDATE - Method chính được gọi mỗi frame với Command Pattern (HOÀN THIỆN)
   *
   * LUỒNG HOÀN THIỆN:
   * 1. 🎮 Chuyển đổi input thành Command
   * 2. 📤 Gửi Command đến State Machine để xử lý các sự kiện rời rạc
   * 3. 🔄 Gọi update của State Machine để xử lý các hành động liên tục
   * 4. 📊 Cập nhật các thành phần khác
   */
  public update(): void {
    // 1. Chuyển đổi input thành Command
    const commands = this.commandInputManager.update();

    // 2. Gửi Command đến State Machine để xử lý các sự kiện rời rạc
    commands.forEach((command) => this.processCommand(command));

    // 3. Gọi update của State Machine để xử lý các hành động liên tục
    this.stateMachine.update();

    // 4. Cập nhật các thành phần khác
    this.updateBasicState(); // Vẫn cần để biết isJumping, isFalling cho animation
    this.updateAnimations();
    this.cameraManager.update();
  }
  /**
   * 📊 UPDATE BASIC STATE - Cập nhật state cơ bản (thay thế updateState cũ)
   *
   * Chỉ cập nhật các thông tin cần thiết cho animations và camera
   * Logic movement đã được chuyển sang State Machine
   */
  private updateBasicState(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const velocity = body.velocity;

    // Cập nhật coyote time - vẫn cần cho jump logic
    const wasOnGround = this.state.isOnGround;
    this.state.isOnGround = body.blocked.down || body.touching.down;

    if (this.state.isOnGround) {
      this.lastGroundedTime = this.scene.time.now;
      this.hasJumped = false; // Reset jump flag khi chạm đất
    }

    // Landing detection cho camera effects
    if (!wasOnGround && this.state.isOnGround) {
      this.onLanding();
    }

    // Update states cho animations
    this.state.isMoving = Math.abs(velocity.x) > 10;
    this.state.isJumping = velocity.y < -10 && !this.state.isOnGround;
    this.state.isFalling = velocity.y > 10 && !this.state.isOnGround;

    // Update facing direction
    if (velocity.x > 0) {
      this.state.facingDirection = "right";
    } else if (velocity.x < 0) {
      this.state.facingDirection = "left";
    }
  }

  // === HELPER METHODS CHO STATE MACHINE ===

  /**
   * 🧪 SHOULD PROCESS JUMP INPUT - LEGACY method, sẽ bị thay thế bởi Jump Buffer
   */
  public shouldProcessJumpInput(input: InputState): boolean {
    // LEGACY: Method này sẽ bị thay thế bởi Jump Buffer trong processCommand
    return false; // Tạm thời disable để tránh xung đột
  }

  /**
   * 🦘 EXECUTE JUMP - Thực hiện nhảy (được gọi từ JumpState)
   */
  public executeJump(): void {
    // Double check - không nhảy nếu đã nhảy rồi hoặc không ở trên mặt đất hoặc trong cooldown
    const jumpCooldownPassed =
      this.scene.time.now - this.lastJumpTime > this.jumpCooldown;
    if (
      this.hasJumped ||
      (!this.state.isOnGround &&
        this.scene.time.now - this.lastGroundedTime >= this.coyoteTime) ||
      !jumpCooldownPassed
    ) {
      return;
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-this.config.physics.jumpPower);

    // Update state và timestamps
    this.state.isJumping = true;
    this.state.isOnGround = false;
    this.lastJumpTime = this.scene.time.now;
    this.jumpBuffer = 0; // MỚI: Xóa bộ đệm sau khi đã nhảy thành công

    // Effects
    this.scene.sound.play("jump");
    this.cameraManager.onPlayerJump();

    console.log("🦘 Player jumped!");
  }

  /**
   * 🌍 IS ON GROUND - Kiểm tra có đang trên mặt đất không
   */
  public isOnGround(): boolean {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down;
  }

  /**
   * 🐺 CAN COYOTE JUMP - Kiểm tra có thể coyote jump không
   */
  public canCoyoteJump(): boolean {
    return this.scene.time.now - this.lastGroundedTime < this.coyoteTime;
  }

  /**
   * 🦘 CAN PERFORM JUMP - Kiểm tra có thể thực hiện nhảy không (cho Command Pattern)
   */
  public canPerformJump(): boolean {
    const jumpCooldownPassed =
      this.scene.time.now - this.lastJumpTime > this.jumpCooldown;
    const canCoyoteJump =
      this.scene.time.now - this.lastGroundedTime < this.coyoteTime;

    return (
      (this.state.isOnGround || canCoyoteJump) &&
      !this.hasJumped &&
      jumpCooldownPassed
    );
  }

  /**
   * ⚙️ GET CONFIG - Lấy config cho states
   */
  public getConfig(): Required<PlayerConfig> {
    return this.config;
  }

  /**
   * 🦘 IS JUMP BUFFERED - MỚI: Kiểm tra bộ đệm nhảy HOẶC đang giữ phím jump
   */
  public isJumpBuffered(): boolean {
    const rawInput = this.commandInputManager.getRawInput();
    return (
      this.scene.time.now - this.jumpBuffer < this.jumpBufferTime ||
      rawInput.jump // FIX: Thêm kiểm tra đang giữ phím jump
    );
  }

  /**
   * 🏁 ON LANDING - Được gọi khi player chạm đất (public để state có thể gọi)
   */
  public onLanding(): void {
    this.state.isJumping = false;
    this.state.isFalling = false;
    this.hasJumped = false; // Reset jump flag khi chạm đất

    // Camera effect khi chạm đất
    this.cameraManager.onPlayerLand();

    console.log("🏁 Player landed!");
  }

  /**
   * 🎬 UPDATE ANIMATIONS - Cập nhật animation dựa trên velocity và ground state
   */
  private updateAnimations(): void {
    const velocity = this.sprite.body!.velocity;
    this.animationManager.updateAnimation(velocity, this.state.isOnGround);
  }

  // === PUBLIC METHODS ===

  /**
   * � PROCESS COMMAND - Entry point cho Command Pattern (MỚI)
   *
   * CHỨC NĂNG:
   * - Nhận commands từ InputManager/AI/Replay system
   * - Ủy quyền cho State Machine xử lý
   * - Thay thế dần cho raw input processing
   *
   * @param command Command cần xử lý
   */
  public processCommand(command: ICommand): void {
    // Import JumpCommand để kiểm tra instanceof
    const { JumpCommand } = require("./commands");

    // MỚI: Xử lý JumpCommand tại đây để ghi vào bộ đệm
    if (command instanceof JumpCommand) {
      this.jumpBuffer = this.scene.time.now;
      // Không chuyển ngay cho state machine, để update loop xử lý
      return;
    }

    // Các command khác vẫn chuyển cho state machine
    this.stateMachine.processCommand(command);
  }

  /**
   * 🕹️ GET LAST INPUT STATE - Lấy trạng thái input cuối cùng cho air control
   */
  public getLastInputState(): InputState {
    return this.commandInputManager.getRawInput();
  }

  /**
   * �🎭 GETTERS - Lấy thông tin player cho external access
   */
  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }
  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }
  public getState(): PlayerState {
    return { ...this.state };
  }

  /**
   * 💰 ADD SCORE - Cộng điểm khi thu thập xu
   */
  public addScore(points: number): void {
    this.state.score += points;
  }

  /**
   * 💔 TAKE DAMAGE - Nhận damage với effects
   */
  public takeDamage(damage: number): void {
    this.state.health = Math.max(0, this.state.health - damage);

    if (this.state.health <= 0) {
      this.onDeath();
    } else {
      // Damage effects: camera shake + red tint
      this.cameraManager.shake(0.01, 200);
      this.sprite.setTint(0xff0000);

      // Clear tint sau 200ms
      this.scene.time.delayedCall(200, () => {
        this.sprite.clearTint();
      });
    }
  }

  /**
   * 💚 HEAL - Hồi máu (tối đa 100)
   */
  public heal(amount: number): void {
    this.state.health = Math.min(100, this.state.health + amount);
  }

  /**
   * 💀 ON DEATH - Xử lý khi player chết
   */
  private onDeath(): void {
    // Death effects: gray tint + camera shake
    this.sprite.setTint(0x888888);
    this.cameraManager.shake(0.02, 500);

    // Auto respawn sau 2 giây
    this.scene.time.delayedCall(2000, () => {
      this.respawn();
    });
  }

  /**
   * 🔄 RESPAWN - Hồi sinh player tại vị trí spawn
   */
  public respawn(): void {
    this.sprite.setPosition(this.config.x, this.config.y);
    this.sprite.clearTint();
    this.state.health = 100;

    // Reset velocity
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  /**
   * 🗑️ CLEANUP - Giải phóng tất cả references
   */
  public destroy(): void {
    this.animationManager?.destroy();
    this.sprite?.destroy();

    this.animationManager = null as any;
    this.sprite = null as any;
    this.scene = null as any;
  }
}
