import { Room, getStateCallbacks } from "colyseus.js";
import { IInteractiveObjectView } from "./IInteractiveObjectView";
import { EntityInterpolator } from "../../utils/EntityInterpolator";

export class GenericPhysicsView implements IInteractiveObjectView {
  public id: string;
  public type = "generic_physics_object";

  private scene!: Phaser.Scene;
  private room!: Room<any>;
  private matterSprite?: Phaser.Physics.Matter.Sprite;
  private arcadeProxy?: Phaser.Physics.Arcade.Sprite;
  private stateRef: any; // Tham chiếu đến network state
  private interpolator: EntityInterpolator = new EntityInterpolator();

  // Cờ để chỉ client nào đang "chủ" vật lý
  private hasPhysicsAuthority: boolean = false;
  private lastSentTime: number = 0;
  // >>> THÊM MỚI: Cooldown để tránh spam server với yêu cầu xin quyền
  private authorityRequestCooldown: number = 0;
  // <<< KẾT THÚC

  constructor(id: string) {
    this.id = id;
  }

  createView(
    scene: Phaser.Scene,
    room: Room<any>,
    networkState: any,
    options?: any
  ): void {
    console.log(
      `[GenericPhysicsView] createView called for object ID: ${this.id} at (${networkState.x}, ${networkState.y}) with asset: ${networkState.assetKey}`
    );
    this.scene = scene;
    this.room = room;
    this.stateRef = networkState;

    // 1. ĐỌC CẤU HÌNH TỪ NETWORK STATE VÀ OPTIONS
    const assetKey = networkState.assetKey || "rock";

    // === SỬA LẠI: ƯU TIÊN ĐỌC TỪ NETWORK STATE, SAU ĐÓ MỚI FALLBACK VỀ OPTIONS ===
    // Bây giờ server đã gửi đủ thông tin trong networkState, chúng ta ưu tiên đọc từ đó
    const physicsOptions = options || {};
    const friction = networkState.friction ?? physicsOptions.friction ?? 0.7;
    const bounce = networkState.bounce ?? physicsOptions.bounce ?? 0.3;
    const density = networkState.density ?? physicsOptions.density ?? 0.005;
    const shape = networkState.shape ?? physicsOptions.shape ?? "rectangle";
    const width = networkState.width ?? physicsOptions.width ?? 60;
    const height = networkState.height ?? physicsOptions.height ?? 60;
    const radius = networkState.radius ?? physicsOptions.radius ?? 30;

    // === THÊM LOGIC ĐỌC OFFSET TỪ NETWORK STATE ===
    // Sử dụng giá trị từ server, nếu không có thì mặc định là 0
    const offsetX = networkState.offsetX ?? 0;
    const offsetY = networkState.offsetY ?? 0;
    // =====================================
    // ========================================================================

    // CÁC HẰNG SỐ CHO TƯƠNG TÁC VẬT LÝ HAI CHIỀU
    const PUSH_FORCE_MULTIPLIER = 0.00015; // Lực người chơi đẩy đá
    const IMPACT_VELOCITY_THRESHOLD = 2; // Vận tốc tối thiểu của đá để tác động người chơi
    const IMPACT_FORCE_MULTIPLIER = 0.8; // Lực đá tác động lại người chơi

    console.log(`[GenericPhysicsView ${this.id}] Physics config:`, {
      assetKey,
      friction,
      bounce,
      density,
      shape,
      width,
      height,
      radius,
      offsetX,
      offsetY,
    });

    // 2. TẠO MATTER SPRITE VỚI CẤU HÌNH ĐỘNG
    this.matterSprite = (scene as any).matter.add.sprite(
      networkState.x,
      networkState.y,
      assetKey, // Dùng assetKey động
      undefined,
      { label: `phys_${this.id}` } as any
    );

    if (this.matterSprite) {
      // Áp dụng hình dạng vật lý dựa trên cấu hình
      if (shape === "circle") {
        this.matterSprite.setCircle(radius);
      } else {
        this.matterSprite.setRectangle(width, height);
      }

      // Áp dụng các thuộc tính vật lý động
      this.matterSprite.setFriction(friction);
      this.matterSprite.setFrictionAir(0.01);
      this.matterSprite.setBounce(bounce);
      this.matterSprite.setDensity(density);
      this.matterSprite.setDepth(99); // Nằm dưới người chơi một chút

      // ================== KHỐI LỆNH MỚI: KIỂM TRA HỆ THỐNG ÁNH SÁNG ==================
      // Áp dụng Light2D pipeline nếu scene hiện tại có bật hệ thống ánh sáng.
      if (
        (this.scene as any).isLightingEnabled &&
        typeof (this.scene as any).isLightingEnabled === "function" &&
        (this.scene as any).isLightingEnabled()
      ) {
        this.matterSprite.setPipeline("Light2D");
        console.log(
          `[GenericPhysicsView ${this.id}] Applied Light2D pipeline. Object will now be affected by darkness and lights.`
        );
      }
      // =================== KẾT THÚC KHỐI LỆNH MỚI ===================
    }

    // 3. TẠO ARCADE PROXY (CHO VA CHẠM VỚI PLAYER)
    this.arcadeProxy = (scene as any).physics.add.sprite(
      networkState.x,
      networkState.y,
      assetKey
    );

    if (this.arcadeProxy) {
      this.arcadeProxy.setVisible(false);
      this.arcadeProxy.setImmovable(true); // Player không thể đi xuyên qua
      const proxyBody = this.arcadeProxy.body as Phaser.Physics.Arcade.Body;
      proxyBody.setAllowGravity(false);

      // === SỬA LẠI HOÀN TOÀN LOGIC CĂN CHỈNH HITBOX ===
      // 1. Đặt kích thước hitbox (vẫn đọc từ networkState)
      proxyBody.setSize(width, height);

      // 2. Đặt offset (sử dụng giá trị động từ Tiled)
      proxyBody.setOffset(offsetX, offsetY);
      // ==============================================
    }

    // 4. VA CHẠM GIỮA PLAYER VÀ PROXY - CẦU NỐI TRUYỀN LỰC
    const player = (scene as any).getPlayer?.()?.getSprite?.();
    if (player) {
      // Sửa lại callback của collider để nhận tham số và áp dụng lực
      (scene as any).physics.add.collider(
        player,
        this.arcadeProxy,
        (
          playerSprite: Phaser.Physics.Arcade.Sprite,
          proxySprite: Phaser.Physics.Arcade.Sprite
        ) => {
          // Callback này được gọi mỗi frame khi player chạm vào proxy
          if (!this.matterSprite || !this.matterSprite.body) return;

          const playerBody = playerSprite.body as Phaser.Physics.Arcade.Body;
          const rockBody = this.matterSprite.body as MatterJS.BodyType;

          // =====================================================================
          // --- VẾ 1: NGƯỜI CHƠI ĐẨY ĐÁ (LOGIC TỪ TRƯỚC, GIỮ NGUYÊN) ---
          // =====================================================================
          const forceX = playerBody.velocity.x * PUSH_FORCE_MULTIPLIER;
          this.matterSprite.applyForce(new Phaser.Math.Vector2(forceX, 0));

          // === <<< SỬA ĐỔI HOÀN TOÀN LOGIC GIÀNH QUYỀN >>> ===
          // Client không còn tự ý giành quyền nữa.
          // Thay vào đó, nó sẽ gửi yêu cầu lên server.
          const now = this.scene.time.now;
          if (
            !this.hasPhysicsAuthority &&
            now > this.authorityRequestCooldown
          ) {
            console.log(`[Client] Requesting physics authority for ${this.id}`);

            // Gửi tin nhắn "xin phép" lên server
            this.room.send("requestPhysicsAuthority", { objectId: this.id });

            // Đặt cooldown 500ms để tránh spam
            this.authorityRequestCooldown = now + 500;
          }
          // === <<< KẾT THÚC SỬA ĐỔI >>> ===

          // =====================================================================
          // --- VẾ 2: ĐÁ ĐẨY NGƯỜI CHƠI (LOGIC MỚI) ---
          // =====================================================================

          // a. Lấy vận tốc hiện tại của cục đá từ thế giới Matter.js
          const rockVelocity = new Phaser.Math.Vector2(
            rockBody.velocity.x,
            rockBody.velocity.y
          );
          const rockSpeed = rockVelocity.length();

          // b. Kiểm tra xem cục đá có đang di chuyển đủ nhanh để gây tác động không
          if (rockSpeed > IMPACT_VELOCITY_THRESHOLD) {
            // c. Kiểm tra xem va chạm có phải là từ trên xuống không (player nhảy lên đá)
            // Nếu player đang ở trên và đang rơi xuống, đó là đứng lên, không phải bị đẩy.
            const isLandingOnTop =
              playerBody.velocity.y > 0 && playerSprite.y < proxySprite.y;

            if (!isLandingOnTop) {
              console.log(
                `[Impact] Rock hit player with speed: ${rockSpeed.toFixed(2)}`
              );

              // d. Áp dụng vận tốc của đá lên người chơi, có nhân hệ số
              // Chúng ta chỉ áp dụng lực đẩy ngang để tránh làm người chơi bay lên trời
              const impactVelocityX =
                rockVelocity.x * IMPACT_FORCE_MULTIPLIER * 60; // *60 để cân bằng delta time

              playerBody.setVelocityX(impactVelocityX);

              // Optional: Thêm một lực đẩy nhẹ lên trên nếu muốn
              // if (Math.abs(rockVelocity.y) > 1) {
              //    playerBody.setVelocityY(-100);
              // }
            }
          }
        },
        undefined, // processCallback không cần thiết ở đây
        this
      );
    }

    // 5. LẮNG NGHE THAY ĐỔI TỪ SERVER (CHO CÁC CLIENT KHÁC)
    const $ = getStateCallbacks(room);
    $(networkState).onChange(() => {
      // === <<< SỬA ĐỔI QUAN TRỌNG NHẤT >>> ===
      // Quyền hạn của client giờ đây được quyết định DUY NHẤT bởi server.
      const newAuthority = this.room.sessionId === networkState.lastUpdatedBy;

      // Chỉ log khi có sự thay đổi
      if (newAuthority !== this.hasPhysicsAuthority) {
        console.log(
          `[Client] Physics authority for ${this.id} changed to: ${newAuthority}`
        );
        this.hasPhysicsAuthority = newAuthority;
      }
      // === <<< KẾT THÚC SỬA ĐỔI >>> ===

      // Chỉ nội suy nếu client này không có quyền điều khiển
      if (!this.hasPhysicsAuthority) {
        this.interpolator.addSnapshot(networkState.x, networkState.y);
      }
    });
  }

  update(_delta: number): void {
    if (!this.matterSprite || !this.arcadeProxy || !this.stateRef) return;

    // Đồng bộ vị trí proxy với sprite vật lý
    this.arcadeProxy.setPosition(this.matterSprite.x, this.matterSprite.y);

    if (this.hasPhysicsAuthority) {
      // GỬI UPDATE LÊN SERVER (nếu có quyền)
      // Giới hạn tần suất gửi để tiết kiệm băng thông
      const now = Date.now();
      if (now - this.lastSentTime > 50) {
        // Gửi ~20 lần/giây
        try {
          this.room.send("updatePhysicsObjectState", {
            id: this.id, // Đổi tên để nhất quán
            x: this.matterSprite.x,
            y: this.matterSprite.y,
            angle: this.matterSprite.angle,
            velocityX: (this.matterSprite.body as any).velocity.x,
            velocityY: (this.matterSprite.body as any).velocity.y,
          });
          this.lastSentTime = now;
        } catch {}
      }
    } else {
      // NỘI SUY VỊ TRÍ THEO SERVER (nếu không có quyền)
      const targetPos = this.interpolator.update();
      if (targetPos) {
        // Dùng setPosition để di chuyển mượt mà thay vì applyForce
        this.matterSprite.setPosition(targetPos.x, targetPos.y);
        // Đồng bộ cả góc xoay
        this.matterSprite.setAngle(this.stateRef.angle);
      }
    }
  }

  destroyView(): void {
    this.matterSprite?.destroy();
    this.arcadeProxy?.destroy();
    this.matterSprite = undefined;
    this.arcadeProxy = undefined;
  }
}
