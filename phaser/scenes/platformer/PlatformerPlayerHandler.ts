import { Player, InputManager, CameraManager } from "../../classes";
import { BasePlatformerScene } from "./BasePlatformerScene";
import { PlatformerLogicCore } from "./PlatformerLogicCore";
import { TileBehaviorFactory } from "../../classes/platformer/behaviors";

/**
 * 👤 PLATFORMER PLAYER HANDLER - Chuyên gia về Người chơi
 *
 * Lớp này chỉ tập trung vào việc tạo và thiết lập người chơi trong môi trường platformer.
 *
 * TRÁCH NHIỆM:
 * - Tạo instance Player với đúng cấu hình platformer
 * - Thiết lập va chạm và overlap cho người chơi
 * - Setup physics interactions cho player
 * - Kết nối player với các managers (Input, Camera)
 *
 * KIẾN TRÚC:
 * - Composition: Được sở hữu bởi BasePlatformerScene
 * - Single Responsibility: Chỉ biết về việc tạo và setup player
 * - Factory Pattern: Tạo ra Player instance với đúng configuration
 */
export class PlatformerPlayerHandler {
  private scene: BasePlatformerScene;

  // === SINKING SAND STATE ===
  // Trạng thái cho cơ chế cát lún
  private onSinkingSandThisFrame: boolean = false;
  private sinkingSandTimer: number = 0; // ms đã đứng trên cát

  constructor(scene: BasePlatformerScene) {
    this.scene = scene;
    (this.scene as any).playerHandler = this;
  }

  /**
   * 🏃 SPAWN PLAYER - Tạo và thiết lập người chơi hoàn chỉnh
   *
   * LUỒNG:
   * 1. Tạo Player instance với configuration từ scene
   * 2. Setup collision với platforms
   * 3. Setup overlap với tiles để detect collectibles
   * 4. Kết nối với các managers
   *
   * @param spawnPoint Tọa độ spawn của player
   * @param platformsLayer Layer chứa platforms để setup collision
   * @param inputManager Manager xử lý input
   * @param cameraManager Manager xử lý camera
   * @param logicCore Core logic để xử lý game interactions
   * @param networkManager Manager xử lý network (MỚI)
   * @returns Player instance đã được setup hoàn chỉnh
   */
  public spawnPlayer(
    spawnPoint: { x: number; y: number },
    platformsLayer: Phaser.Tilemaps.TilemapLayer,
    inputManager: InputManager,
    cameraManager: CameraManager,
    logicCore: PlatformerLogicCore,
    networkManager: any // NetworkManager được thêm vào
  ): Player {
    console.log(`🏃 PlatformerPlayerHandler: Spawning player...`);

    // THÊM MỚI: Lấy username từ scene
    const username = this.scene.getUserDisplayName();

    // 1. Tạo Player instance với configuration từ scene
    const player = new Player(
      this.scene,
      {
        x: spawnPoint.x,
        y: spawnPoint.y,
        texture: "spritesheet-characters-default",
        username: username, // <-- SỬA ĐỔI: Truyền username vào
        characterData: this.scene.getCharacterData(), // Lấy config từ scene
        physics: this.scene.getPlayerPhysicsConfig(), // Lấy physics config từ scene
      },
      inputManager,
      cameraManager,
      networkManager // Truyền NetworkManager
    );

    // 2. Thiết lập tất cả tương tác với tiles (collider + overlap)
    this.setupPlayerTileInteractions(player, platformsLayer, logicCore);

    console.log(`✅ Player "${username}" spawned and configured successfully`);
    return player;
  }

  /**
   * 🎮 SETUP PLAYER TILE INTERACTIONS - Gom tất cả logic collider/overlap vào một nơi
   *
   * Luồng:
   * 1) Chỉ bật collision cho tile có properties { collides: true }
   * 2) Thêm collider để người chơi đứng trên nền đất/platforms
   * 3) Thêm overlap để phát hiện hazard/collectible… mà không tạo va chạm vật lý
   */
  private setupPlayerTileInteractions(
    player: Player,
    platformsLayer: Phaser.Tilemaps.TilemapLayer,
    logicCore: PlatformerLogicCore
  ): void {
    // 1) Chỉ định rõ tile nào là vật cản vật lý
    platformsLayer.setCollisionByProperty({ collides: true });
    console.log(
      "🏗️ Platform collision configured for tiles with 'collides: true'"
    );

    // 2) Collider CHUNG: chặn va chạm với nền đất cứng, behavior quyết định va chạm
    this.scene.physics.add.collider(
      player.getSprite(),
      platformsLayer,
      // CollideCallback: chuyển tiếp cho Behavior nếu có
      (_sprite: any, tile: any) => {
        const platformTile = tile as Phaser.Tilemaps.Tile;
        const behaviorType = (platformTile.properties as any)
          .behavior as string;
        if (behaviorType) {
          const behavior =
            TileBehaviorFactory.getInstance().getBehavior(behaviorType);
          if (behavior) {
            behavior.onPlayerCollide(platformTile, player, this.scene);
          }
        }

        // Collectible vẫn dùng logicCore
        if ((platformTile.properties as any).type === "collectible") {
          logicCore.handleTileOverlap(platformTile, platformsLayer, this.scene);
        }
      },
      // ProcessCallback: hỏi Behavior có nên va chạm không
      (_sprite: any, tile: any) => {
        const platformTile = tile as Phaser.Tilemaps.Tile;
        const behaviorType = (platformTile.properties as any)
          .behavior as string;
        if (behaviorType) {
          const behavior =
            TileBehaviorFactory.getInstance().getBehavior(behaviorType);
          if (behavior) {
            return behavior.shouldCollide(platformTile, player, this.scene);
          }
        }
        return true;
      },
      this
    );

    // 2b) Bỏ collider riêng cho cát lún; đã xử lý qua Behavior.shouldCollide

    // 3) Overlap: giữ lại cho các tile không dùng collider cần overlap riêng nếu có
    this.scene.physics.add.overlap(
      player.getSprite(),
      platformsLayer,
      (sprite: any, tile: any) => {
        const platformTile = tile as Phaser.Tilemaps.Tile;
        if (!platformTile?.properties) return;

        // Hazard qua behavior
        const behaviorType = (platformTile.properties as any)
          .behavior as string;
        if (behaviorType) {
          const behavior =
            TileBehaviorFactory.getInstance().getBehavior(behaviorType);
          if (behavior) {
            behavior.onPlayerCollide(platformTile, player, this.scene);
          }
        }

        // Collectible vẫn tách riêng qua logicCore
        if ((platformTile.properties as any).type === "collectible") {
          logicCore.handleTileOverlap(platformTile, platformsLayer, this.scene);
        }
      },
      (sprite: any, tile: any) => {
        return !!(tile && (tile as any).properties);
      },
      this
    );
    console.log(
      "🎯 Overlap detection enabled for interactive tiles (hazards, collectibles, etc.)"
    );
  }

  // API cho SinkingSandBehavior
  public markOnSinkingSand(): void {
    this.onSinkingSandThisFrame = true;
  }

  public getSinkingSandTimer(): number {
    return this.sinkingSandTimer;
  }

  /**
   * 🎮 SETUP ADVANCED PLAYER PHYSICS - Thiết lập physics nâng cao (tùy chọn)
   *
   * Có thể được gọi để setup các physics effects đặc biệt cho player.
   *
   * @param player Player instance
   * @param customConfig Custom physics configuration
   */
  public setupAdvancedPhysics(
    player: Player,
    customConfig?: {
      gravity?: number;
      drag?: number;
      bounce?: number;
      maxVelocity?: { x: number; y: number };
    }
  ): void {
    const sprite = player.getSprite();
    const body = sprite.body as Phaser.Physics.Arcade.Body;

    if (customConfig) {
      // Áp dụng custom physics nếu có
      if (customConfig.gravity !== undefined) {
        body.setGravityY(customConfig.gravity);
      }
      if (customConfig.drag !== undefined) {
        body.setDragX(customConfig.drag);
      }
      if (customConfig.bounce !== undefined) {
        body.setBounce(customConfig.bounce);
      }
      if (customConfig.maxVelocity) {
        body.setMaxVelocity(
          customConfig.maxVelocity.x,
          customConfig.maxVelocity.y
        );
      }

      console.log("🎮 Advanced physics configuration applied");
    }
  }

  /**
   * 🔧 RECONFIGURE PLAYER - Thay đổi cấu hình player trong runtime
   *
   * @param player Player instance
   * @param newConfig Cấu hình mới
   */
  public reconfigurePlayer(
    player: Player,
    newConfig: {
      physics?: any;
      characterData?: any;
    }
  ): void {
    // Có thể implement logic để thay đổi cấu hình player trong game
    // Ví dụ: khi có power-up thay đổi tốc độ, sức nhảy, etc.

    console.log("🔧 Player reconfiguration completed");
  }

  /**
   * 📊 GET PLAYER STATS - Lấy thống kê hiện tại của player
   *
   * @param player Player instance
   * @returns Object chứa stats của player
   */
  public getPlayerStats(player: Player): {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    isOnGround: boolean;
    isMoving: boolean;
  } {
    const sprite = player.getSprite();
    const body = sprite.body as Phaser.Physics.Arcade.Body;

    return {
      position: { x: sprite.x, y: sprite.y },
      velocity: { x: body.velocity.x, y: body.velocity.y },
      isOnGround: body.touching.down,
      isMoving: Math.abs(body.velocity.x) > 1,
    };
  }

  /**
   * 🎯 TELEPORT PLAYER - Dịch chuyển player đến vị trí mới
   *
   * @param player Player instance
   * @param newPosition Vị trí mới
   */
  public teleportPlayer(
    player: Player,
    newPosition: { x: number; y: number }
  ): void {
    const sprite = player.getSprite();
    sprite.setPosition(newPosition.x, newPosition.y);

    // Reset velocity để tránh hiệu ứng không mong muốn
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    console.log(`🎯 Player teleported to (${newPosition.x}, ${newPosition.y})`);
  }

  /**
   * 💀 RESPAWN PLAYER - Hồi sinh player tại một vị trí cụ thể
   *
   * @param player Player instance
   * @param respawnPosition Vị trí để hồi sinh
   */
  public respawnPlayer(
    player: Player,
    respawnPosition: { x: number; y: number }
  ): void {
    console.log(
      `💀 Respawning player at (${respawnPosition.x}, ${respawnPosition.y})...`
    );

    // 1. Dịch chuyển player về vị trí hồi sinh
    this.teleportPlayer(player, respawnPosition);

    // 2. Gọi hàm respawn nội bộ của Player để reset cờ isDead
    player.respawn();

    console.log("✅ Player respawned successfully");
  }

  // Gọi mỗi frame từ Scene.update(): reset cờ/timer khi rời cát
  public update(): void {
    if (this.onSinkingSandThisFrame) {
      this.sinkingSandTimer += this.scene.game.loop.delta;
    } else {
      this.sinkingSandTimer = 0;
    }
    this.onSinkingSandThisFrame = false;
  }

  /**
   * 🗑️ CLEANUP - Dọn dẹp resources liên quan đến player
   */
  public cleanup(): void {
    // Player instance sẽ được cleanup bởi Phaser khi scene destroy
    // Nhưng có thể cleanup custom listeners hoặc timers ở đây nếu có

    console.log("🗑️ PlatformerPlayerHandler cleanup completed");
  }
}
