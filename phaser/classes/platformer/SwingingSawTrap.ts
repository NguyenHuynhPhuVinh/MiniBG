import { BasePlatformerScene } from "../../scenes";

/**
 * 🪚 SWINGING SAW TRAP - Bẫy răng cưa xoay tròn với dây xích
 *
 * Lớp này tạo ra một bẫy phức tạp sử dụng vật lý Matter.js:
 * - Điểm neo tĩnh (anchor point)
 * - Lưỡi cưa động được nối với điểm neo bằng constraint (dây xích)
 * - Hiệu ứng hình ảnh dây xích được vẽ bằng Graphics
 * - Va chạm với người chơi gây chết ngay lập tức
 *
 * TRÁCH NHIỆM:
 * - Tạo và quản lý các vật thể Matter.js (anchor, saw blade, constraint)
 * - Cập nhật hình ảnh dây xích mỗi frame
 * - Áp dụng lighting pipeline nếu scene hỗ trợ
 * - Dọn dẹp tài nguyên khi bị destroy
 */
export class SwingingSawTrap {
  private scene: BasePlatformerScene;
  private anchorSprite: Phaser.GameObjects.Image;
  private sawBladeSprite: Phaser.Physics.Matter.Image;
  private chainGraphics: Phaser.GameObjects.Graphics | null = null; // THAY ĐỔI 1: Dùng Graphics cho dây xích màu nâu
  private constraint: MatterJS.ConstraintType;
  private anchorBody: MatterJS.BodyType;
  private motorEvent: Phaser.Time.TimerEvent | null = null; // Để dọn dẹp timer
  private sawProxy: Phaser.Physics.Arcade.Sprite | null = null; // THÊM MỚI: Arcade proxy cho va chạm

  constructor(
    scene: BasePlatformerScene,
    x: number, // Vị trí neo X
    y: number, // Vị trí neo Y
    // THAY ĐỔI 2: Nhận thêm các tham số mới từ WorldBuilder
    anchorWidth: number,
    anchorHeight: number,
    chainLength: number = 200, // Chiều dài dây xích
    angularVelocity: number = 1.0, // Tốc độ quay ban đầu
    motorSpeed: number = 0.02 // Tốc độ của motor quay 360 độ
  ) {
    this.scene = scene;

    console.log(
      `🪚 Creating SwingingSawTrap at (${x}, ${y}) with chain length ${chainLength}, motor speed ${motorSpeed}`
    );

    // 1. TẠO ĐIỂM NEO (VẬT LÝ) - Tĩnh, không di chuyển
    this.anchorBody = this.scene.matter.add.circle(x, y, 10, {
      isStatic: true,
      label: "trap_anchor",
    });

    // 2. TẠO LƯỠI CƯA (HÌNH ẢNH + VẬT LÝ) - Động
    const sawInitialY = y + chainLength;
    this.sawBladeSprite = this.scene.matter.add.image(
      x,
      sawInitialY,
      "saw",
      undefined,
      {
        shape: { type: "circle", radius: 32 }, // Hitbox hình tròn
        label: "saw_blade_hazard", // Label để nhận diện va chạm
      }
    );

    // THAY ĐỔI 3: VÔ HIỆU HÓA MA SÁT ĐỂ LƯỠI CƯA QUAY MÃI MÃI
    this.sawBladeSprite.setFrictionAir(0);
    this.sawBladeSprite.setFriction(0);
    this.sawBladeSprite.setCircle(32);
    this.sawBladeSprite.setDepth(50); // Đảm bảo nó render trên các layer khác

    // Đặt tốc độ quay cho chính lưỡi cưa
    this.scene.matter.body.setAngularVelocity(
      this.sawBladeSprite.body as MatterJS.BodyType,
      angularVelocity
    );

    // 3. TẠO RÀNG BUỘC (DÂY XÍCH VẬT LÝ)
    this.constraint = this.scene.matter.add.constraint(
      this.anchorBody,
      this.sawBladeSprite.body as MatterJS.BodyType,
      chainLength,
      0.1 // Stiffness: độ cứng của xích (giá trị thấp = giống dây hơn)
    );

    // THAY ĐỔI 4: Thêm motor riêng biệt để quay 360 độ
    // Sử dụng cách tiếp cận khác: áp dụng lực liên tục để tạo chuyển động quay
    this.motorEvent = this.scene.time.addEvent({
      delay: 16, // ~60 FPS
      callback: () => {
        if (this.sawBladeSprite && this.sawBladeSprite.body) {
          // Áp dụng lực tiếp tuyến để tạo chuyển động quay tròn
          const body = this.sawBladeSprite.body as MatterJS.BodyType;
          const centerX = this.anchorBody.position.x;
          const centerY = this.anchorBody.position.y;

          // Tính vector từ tâm đến lưỡi cưa
          const dx = body.position.x - centerX;
          const dy = body.position.y - centerY;

          // Tạo lực vuông góc (tiếp tuyến) để quay (giảm lực để ổn định hơn)
          const forceX = -dy * motorSpeed * 0.1;
          const forceY = dx * motorSpeed * 0.1;

          this.scene.matter.body.applyForce(body, body.position, {
            x: forceX,
            y: forceY,
          });
        }
      },
      loop: true,
    });

    // 4. TẠO HÌNH ẢNH TRỰC QUAN

    // THAY ĐỔI 5: Tạo dây xích bằng Graphics màu nâu
    this.chainGraphics = this.scene.add.graphics();
    this.chainGraphics.setDepth(49);

    // THAY ĐỔI 6: Tạo sprite cho điểm neo và set kích thước chính xác
    this.anchorSprite = this.scene.add.image(x, y, "chain");
    this.anchorSprite.setDisplaySize(anchorWidth, anchorHeight); // Không dùng setScale nữa!
    this.anchorSprite.setDepth(51);

    // THÊM MỚI: Tạo Arcade Physics proxy cho lưỡi cưa (như bomb)
    this.sawProxy = this.scene.physics.add.sprite(
      this.sawBladeSprite.x,
      this.sawBladeSprite.y,
      "saw"
    );
    this.sawProxy.setVisible(false); // Ẩn proxy, chỉ dùng để va chạm
    const proxyBody = this.sawProxy.body as Phaser.Physics.Arcade.Body;
    proxyBody.setAllowGravity(false); // Không bị ảnh hưởng bởi trọng lực
    proxyBody.setCircle(32); // Hitbox tròn như lưỡi cưa

    // DELAY setup collider cho đến khi player sẵn sàng
    this.setupColliderWhenReady();

    console.log(`✅ SwingingSawTrap created successfully`);
  }

  /**
   * Setup collider khi player đã sẵn sàng
   * Retry mỗi 100ms cho đến khi tìm thấy player
   */
  private setupColliderWhenReady(): void {
    const trySetupCollider = () => {
      const player = this.scene.getPlayer?.()?.getSprite?.();

      if (player && this.sawProxy) {
        this.scene.physics.add.collider(player, this.sawProxy, () => {
          const already = this.sawProxy?.getData("triggered") === true;
          if (!already && this.sawProxy) {
            this.sawProxy.setData("triggered", true);

            // Gọi handlePlayerDeathByHazard như bomb
            this.scene.handlePlayerDeathByHazard({ name: "swinging_saw" });

            // Reset trigger sau 1 giây để có thể va chạm lại
            this.scene.time.delayedCall(1000, () => {
              if (this.sawProxy) {
                this.sawProxy.setData("triggered", false);
              }
            });
          }
        });
      } else {
        // Retry sau 100ms
        this.scene.time.delayedCall(100, trySetupCollider);
      }
    };

    trySetupCollider();
  }

  /**
   * Cập nhật trạng thái bẫy mỗi frame
   * - Vẽ lại dây xích theo vị trí hiện tại của các vật thể
   * - Áp dụng lighting pipeline nếu có
   */
  public update(): void {
    // Cập nhật vị trí các mắt xích theo chuyển động của lưỡi cưa
    const anchorX = this.constraint.bodyA?.position.x || 0;
    const anchorY = this.constraint.bodyA?.position.y || 0;
    const sawX = this.constraint.bodyB?.position.x || 0;
    const sawY = this.constraint.bodyB?.position.y || 0;

    // Cập nhật Graphics dây xích
    if (this.chainGraphics) {
      this.chainGraphics.clear();

      // Màu nâu đậm như dây thừng thật
      this.chainGraphics.lineStyle(8, 0x8b4513, 1); // Màu nâu, độ dày 8px

      // Vẽ dây với hiệu ứng cong tự nhiên (catenary curve)
      this.chainGraphics.beginPath();
      this.chainGraphics.moveTo(anchorX, anchorY);

      const segments = 8;
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        let px = anchorX + (sawX - anchorX) * t;
        let py = anchorY + (sawY - anchorY) * t;

        // Thêm hiệu ứng cong tự nhiên (catenary curve)
        if (i > 0 && i < segments) {
          const sag = 15; // Độ võng của dây
          py += sag * Math.sin(t * Math.PI);
        }

        this.chainGraphics.lineTo(px, py);
      }

      this.chainGraphics.strokePath();
    }

    // Cập nhật vị trí Arcade proxy theo Matter sprite
    if (this.sawProxy) {
      this.sawProxy.setPosition(sawX, sawY);
    }

    // Áp dụng pipeline ánh sáng nếu scene có hỗ trợ
    if (this.scene.isLightingEnabled()) {
      this.sawBladeSprite.setPipeline("Light2D");
      this.anchorSprite.setPipeline("Light2D");
      if (this.chainGraphics) {
        this.chainGraphics.setPipeline("Light2D");
      }
    }
  }

  /**
   * Dọn dẹp tài nguyên khi bẫy bị hủy
   * Rất quan trọng: phải dọn dẹp vật thể Matter.js để tránh memory leak
   */
  public destroy(): void {
    // Dọn dẹp timer event
    if (this.motorEvent) {
      this.motorEvent.destroy();
      this.motorEvent = null;
    }

    // Dọn dẹp vật thể Matter.js
    this.scene.matter.world.remove(this.constraint);

    // Dọn dẹp Arcade proxy
    if (this.sawProxy) {
      this.sawProxy.destroy();
      this.sawProxy = null;
    }

    // Dọn dẹp sprites và chain graphics
    this.sawBladeSprite.destroy();
    this.anchorSprite.destroy();
    if (this.chainGraphics) {
      this.chainGraphics.destroy();
      this.chainGraphics = null;
    }
  }

  /**
   * Lấy vị trí hiện tại của lưỡi cưa (để debug hoặc kiểm tra)
   */
  public getSawPosition(): { x: number; y: number } {
    const body = this.sawBladeSprite.body as MatterJS.BodyType;
    return { x: body.position.x, y: body.position.y };
  }

  /**
   * Lấy sprite của lưỡi cưa (để truy cập từ bên ngoài nếu cần)
   */
  public getSawSprite(): Phaser.Physics.Matter.Image {
    return this.sawBladeSprite;
  }
}
