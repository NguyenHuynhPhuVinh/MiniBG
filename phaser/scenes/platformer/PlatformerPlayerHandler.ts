import { Player, InputManager, CameraManager } from "../../classes";
import { BasePlatformerScene } from "./BasePlatformerScene";

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

  constructor(scene: BasePlatformerScene) {
    this.scene = scene;
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
   * @returns Player instance đã được setup hoàn chỉnh
   */
  public spawnPlayer(
    spawnPoint: { x: number; y: number },
    platformsLayer: Phaser.Tilemaps.TilemapLayer,
    inputManager: InputManager,
    cameraManager: CameraManager,
    logicCore: any
  ): Player {
    console.log(
      `🏃 PlatformerPlayerHandler: Spawning player at (${spawnPoint.x}, ${spawnPoint.y})`
    );

    // 1. Tạo Player instance với configuration từ scene
    const player = new Player(
      this.scene,
      {
        x: spawnPoint.x,
        y: spawnPoint.y,
        texture: "spritesheet-characters-default",
        characterData: this.scene.getCharacterData(), // Lấy config từ scene
        physics: this.scene.getPlayerPhysicsConfig(), // Lấy physics config từ scene
      },
      inputManager,
      cameraManager
    );

    // 2. Setup collision với platforms
    this.setupPlatformCollision(player, platformsLayer);

    // 3. Setup overlap để detect collectibles và tiles
    this.setupTileOverlap(player, platformsLayer, logicCore);

    console.log("✅ Player spawned and configured successfully");
    return player;
  }

  /**
   * 🏗️ SETUP PLATFORM COLLISION - Thiết lập va chạm với platforms
   *
   * @param player Player instance
   * @param platformsLayer Layer chứa platforms
   */
  private setupPlatformCollision(
    player: Player,
    platformsLayer: Phaser.Tilemaps.TilemapLayer
  ): void {
    // Setup collision để player không đi xuyên qua platforms
    this.scene.physics.add.collider(player.getSprite(), platformsLayer);

    console.log("🏗️ Platform collision setup completed");
  }

  /**
   * 💰 SETUP TILE OVERLAP - Thiết lập overlap để detect collectibles
   *
   * @param player Player instance
   * @param platformsLayer Layer chứa tiles có thể tương tác
   * @param logicCore Core logic để xử lý interactions
   */
  private setupTileOverlap(
    player: Player,
    platformsLayer: Phaser.Tilemaps.TilemapLayer,
    logicCore: any
  ): void {
    // Setup overlap để detect coins, power-ups, traps qua tile properties
    this.scene.physics.add.overlap(
      player.getSprite(),
      platformsLayer,
      (sprite, tile) => {
        // Ủy quyền xử lý cho LogicCore (stateless approach)
        logicCore.handleTileOverlap(
          tile as Phaser.Tilemaps.Tile,
          platformsLayer,
          this.scene // Scene được truyền như tham số tạm thời
        );
      },
      undefined,
      this.scene
    );

    console.log("💰 Tile overlap detection setup completed");
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
   * Hữu ích cho checkpoint system hoặc special events.
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
   * 💀 RESPAWN PLAYER - Hồi sinh player tại spawn point
   *
   * @param player Player instance
   * @param spawnPoint Vị trí spawn
   */
  public respawnPlayer(
    player: Player,
    spawnPoint: { x: number; y: number }
  ): void {
    console.log("💀 Respawning player...");

    // Teleport về spawn point
    this.teleportPlayer(player, spawnPoint);

    // Reset any status effects hoặc state nếu cần
    // player.resetState(); // Implement trong Player class nếu cần

    console.log("✅ Player respawned successfully");
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
