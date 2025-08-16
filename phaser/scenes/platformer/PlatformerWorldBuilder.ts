import { BasePlatformerScene } from "./BasePlatformerScene";

/**
 * 🏗️ PLATFORMER WORLD BUILDER - Chuyên gia Xây dựng Thế giới
 *
 * Lớp này chịu trách nhiệm cho mọi thứ liên quan đến việc tạo ra thế giới tĩnh từ dữ liệu Tiled.
 *
 * TRÁCH NHIỆM:
 * - Tạo tilemap và các layer từ dữ liệu Tiled
 * - Tìm điểm spawn của người chơi
 * - Thiết lập các đối tượng tương tác như quiz, finish, checkpoint
 * - Setup collision và physics bounds
 *
 * KIẾN TRÚC:
 * - Composition: Được sở hữu bởi BasePlatformerScene
 * - Single Responsibility: Chỉ biết về việc xây dựng thế giới
 * - Stateless: Không lưu trữ game state, chỉ xây dựng cấu trúc
 */
export class PlatformerWorldBuilder {
  private scene: BasePlatformerScene;
  private tilemap: Phaser.Tilemaps.Tilemap;

  constructor(scene: BasePlatformerScene, tilemapKey: string) {
    this.scene = scene;
    this.tilemap = this.scene.make.tilemap({ key: tilemapKey });
  }

  /**
   * 🏗️ BUILD - Xây dựng thế giới hoàn chỉnh
   *
   * LUỒNG:
   * 1. Thêm tilesets vào tilemap
   * 2. Tạo layers theo thứ tự render
   * 3. Tối ưu render quality
   * 4. Setup collision và physics bounds
   *
   * @returns Object chứa các layer đã được tạo
   */
  public build(): { platformsLayer: Phaser.Tilemaps.TilemapLayer } {
    console.log("🏗️ PlatformerWorldBuilder: Building world...");

    // 1. Thêm common tilesets
    const tilesTileset = this.tilemap.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default"
    )!;
    const backgroundTileset = this.tilemap.addTilesetImage(
      "spritesheet-backgrounds-default",
      "spritesheet-backgrounds-default"
    )!;

    // 2. Tạo layers theo thứ tự render chuẩn
    const backgroundLayer = this.tilemap.createLayer("Background", [
      backgroundTileset,
      tilesTileset,
    ]);
    const platformsLayer = this.tilemap.createLayer("Platforms", [
      tilesTileset,
      backgroundTileset,
    ])!;

    // 3. Tối ưu render quality
    this.optimizeRenderQuality(backgroundLayer, platformsLayer);

    // 4. Setup collision cho platforms
    platformsLayer.setCollisionByProperty({ collides: true });

    // 5. Set physics world bounds
    this.scene.physics.world.setBounds(
      0,
      0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels
    );

    console.log(
      `🗺️ World built: ${this.tilemap.widthInPixels}x${this.tilemap.heightInPixels}`
    );

    return { platformsLayer };
  }

  /**
   * 📍 FIND PLAYER SPAWN POINT - Tìm điểm spawn player từ Tiled
   *
   * @returns Tọa độ spawn point, hoặc tọa độ mặc định nếu không tìm thấy
   */
  public findPlayerSpawnPoint(): { x: number; y: number } {
    const objectLayer = this.tilemap.getObjectLayer("Objects");
    const playerSpawn = objectLayer?.objects.find(
      (obj: any) => obj.name === "player_start"
    );

    const spawnPoint = {
      x: playerSpawn?.x || 100,
      y: (playerSpawn?.y || 100) - 32, // Trừ 32 vì Tiled Y là bottom
    };

    console.log(`📍 Player spawn point: ${spawnPoint.x}, ${spawnPoint.y}`);
    return spawnPoint;
  }

  /**
   * 🎯 SETUP INTERACTIVE OBJECTS - Thiết lập các đối tượng tương tác
   *
   * Tạo các invisible zones cho các objects như quiz, finish, checkpoint từ Tiled
   * và setup collision với player.
   *
   * @param player Sprite của người chơi để setup collision
   * @param logicCore Core logic để xử lý tương tác
   */
  public setupInteractiveObjects(
    player: Phaser.Physics.Arcade.Sprite,
    logicCore: any
  ): void {
    const objectLayer = this.tilemap.getObjectLayer("Objects");
    if (!objectLayer) {
      console.warn("⚠️ Objects layer not found in tilemap");
      return;
    }

    // Tìm tất cả interactive objects
    const interactiveObjects = objectLayer.objects.filter(
      (obj: any) =>
        obj.name &&
        (obj.name.includes("quiz") ||
          obj.name.includes("finish") ||
          obj.name.includes("level_end") ||
          obj.name.includes("checkpoint") ||
          obj.name.includes("secret"))
    );

    console.log(`🎯 Found ${interactiveObjects.length} interactive objects`);

    // Tạo zones cho tất cả objects
    interactiveObjects.forEach((obj: any) => {
      this.createInteractiveZone(obj, player, logicCore);
    });

    console.log(
      `📍 Setup completed for ${interactiveObjects.length} interactive objects`
    );
  }

  /**
   * 🎯 CREATE INTERACTIVE ZONE - Tạo một zone tương tác cụ thể
   *
   * @param obj Object data từ Tiled
   * @param player Sprite của người chơi
   * @param logicCore Core logic để xử lý tương tác
   */
  private createInteractiveZone(
    obj: any,
    player: Phaser.Physics.Arcade.Sprite,
    logicCore: any
  ): void {
    // Tính tọa độ Phaser từ Tiled (chuyển đổi coordinate system)
    const phaserX = obj.x + obj.width / 2;
    const phaserY = obj.y;

    // Tạo invisible zone
    const zone = this.scene.add.zone(phaserX, phaserY, obj.width, obj.height);
    this.scene.physics.world.enable(zone);

    // Setup physics properties
    const body = zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.moves = false;

    // Setup overlap detection với logic core handling
    this.scene.physics.add.overlap(player, zone, () => {
      logicCore.handleInteractiveObject(obj.name, obj, this.scene);
    });

    console.log(
      `🎯 Created interactive zone: ${obj.name} at (${phaserX}, ${phaserY})`
    );
  }

  /**
   * 🎨 OPTIMIZE RENDER QUALITY - Tối ưu chất lượng render cho layers
   *
   * @param backgroundLayer Background layer (có thể null)
   * @param platformsLayer Platforms layer
   */
  private optimizeRenderQuality(
    backgroundLayer: Phaser.Tilemaps.TilemapLayer | null,
    platformsLayer: Phaser.Tilemaps.TilemapLayer
  ): void {
    // Tắt culling để tránh tiles biến mất khi camera di chuyển
    if (backgroundLayer) {
      backgroundLayer.setSkipCull(true);
    }
    if (platformsLayer) {
      platformsLayer.setSkipCull(true);
    }

    console.log("🎨 Render quality optimized");
  }

  /**
   * 📏 GET WORLD DIMENSIONS - Lấy kích thước thế giới
   *
   * @returns Kích thước thế giới
   */
  public getWorldDimensions(): { width: number; height: number } {
    return {
      width: this.tilemap.widthInPixels,
      height: this.tilemap.heightInPixels,
    };
  }

  /**
   * 🗺️ GET TILEMAP - Lấy tilemap instance (cho debug hoặc advanced usage)
   *
   * @returns Tilemap instance
   */
  public getTilemap(): Phaser.Tilemaps.Tilemap {
    return this.tilemap;
  }

  /**
   * 🗑️ CLEANUP - Dọn dẹp resources khi scene kết thúc
   */
  public cleanup(): void {
    // Tilemap sẽ được Phaser tự động cleanup khi scene destroy
    console.log("🗑️ PlatformerWorldBuilder cleanup completed");
  }
}
