import { BasePlatformerScene } from "./BasePlatformerScene";
import { PlatformerLogicCore } from "./PlatformerLogicCore";

// THÊM MỚI: Interface để chứa dữ liệu tile tương tác
interface InteractiveTileData {
  id: string;
  x: number;
  y: number;
}

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
   * 2. Tạo layers theo thứ tự render (Background → Platforms → Foreground)
   * 3. Tối ưu render quality
   * 4. Setup collision và physics bounds
   *
   * @returns Object chứa các layer đã được tạo
   */
  public build(): {
    platformsLayer: Phaser.Tilemaps.TilemapLayer;
    foregroundLayer?: Phaser.Tilemaps.TilemapLayer;
    // THÊM MỚI: Trả về danh sách lò xo
    springsData: InteractiveTileData[];
  } {
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

    // 2. Tạo layers theo thứ tự render chuẩn (Background → Platforms → Foreground)
    const backgroundLayer = this.tilemap.createLayer("Background", [
      backgroundTileset,
      tilesTileset,
    ]);
    const platformsLayer = this.tilemap.createLayer("Platforms", [
      tilesTileset,
      backgroundTileset,
    ])!;

    // THÊM MỚI: Tạo Foreground layer nếu có trong JSON
    let foregroundLayer: Phaser.Tilemaps.TilemapLayer | undefined;
    if (this.hasForegroundLayer()) {
      foregroundLayer =
        this.tilemap.createLayer("Foreground", [
          tilesTileset,
          backgroundTileset,
        ]) || undefined;

      if (foregroundLayer) {
        // QUAN TRỌNG: Set depth cao để foreground luôn render trên player
        foregroundLayer.setDepth(1000); // Player thường có depth 100-500

        console.log(
          "🎨 Foreground layer created with depth 1000 and alpha 0.8"
        );
      }
    } else {
      console.log("ℹ️ No Foreground layer found in tilemap JSON");
    }

    // 3. Tối ưu render quality cho tất cả layers
    this.optimizeRenderQuality(
      backgroundLayer,
      platformsLayer,
      foregroundLayer
    );

    // 4. Setup collision cho platforms
    platformsLayer.setCollisionByProperty({ collides: true });

    // 5. Setup animated tiles
    this.setupAnimatedTiles();

    // 6. Set physics world bounds
    this.scene.physics.world.setBounds(
      0,
      0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels
    );

    // 7. THÊM MỚI: Quét và thu thập dữ liệu lò xo
    // Lưu ý: Việc thay thế tile bằng sprite sẽ diễn ra sau khi các layer được tạo
    const springsData = this.collectInteractiveTiles("spring");

    console.log(
      `🗺️ World built: ${this.tilemap.widthInPixels}x${this.tilemap.heightInPixels}`
    );

    return { platformsLayer, foregroundLayer, springsData };
  }

  /**
   * 🔍 HAS FOREGROUND LAYER - Kiểm tra xem tilemap có chứa Foreground layer không
   *
   * @returns true nếu có Foreground layer trong JSON, false nếu không
   */
  private hasForegroundLayer(): boolean {
    // Kiểm tra trong tilemap data xem có layer tên "Foreground" không
    const layerData = this.tilemap.layers.find(
      (layer) => layer.name === "Foreground"
    );
    return !!layerData;
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
   * @param foregroundLayer Foreground layer (có thể undefined)
   */
  private optimizeRenderQuality(
    backgroundLayer: Phaser.Tilemaps.TilemapLayer | null,
    platformsLayer: Phaser.Tilemaps.TilemapLayer,
    foregroundLayer?: Phaser.Tilemaps.TilemapLayer
  ): void {
    // Tắt culling để tránh tiles biến mất khi camera di chuyển
    if (backgroundLayer) {
      backgroundLayer.setSkipCull(true);
    }
    if (platformsLayer) {
      platformsLayer.setSkipCull(true);
    }
    if (foregroundLayer) {
      foregroundLayer.setSkipCull(true);
    }

    console.log("🎨 Render quality optimized for all layers");
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
   * 🎬 SETUP ANIMATED TILES - Thiết lập animation cho tiles
   *
   * CÁCH ĐÚNG: Phaser 3 không hỗ trợ native animated tiles từ Tiled.
   * Cần tự đọc animation data từ tileset JSON và tạo sprites thay thế.
   */
  private setupAnimatedTiles(): void {
    console.log("🎬 Setting up animated tiles...");

    // Kiểm tra xem có tileset nào có animation data không
    let hasAnimations = false;

    this.tilemap.tilesets.forEach((tileset: Phaser.Tilemaps.Tileset) => {
      // Kiểm tra tileset có animation data không
      const tilesetData = tileset.tileData as any;
      if (tilesetData && Object.keys(tilesetData).length > 0) {
        Object.keys(tilesetData).forEach((tileId: string) => {
          const tileData = tilesetData[tileId] as any;
          if (tileData.animation && Array.isArray(tileData.animation)) {
            hasAnimations = true;
            console.log(
              `🎬 Found animation for tile ${tileId} in tileset ${tileset.name}`
            );
            this.createTileAnimation(
              tileset,
              parseInt(tileId),
              tileData.animation
            );
          }
        });
      }
    });

    if (!hasAnimations) {
      console.log("ℹ️ No animated tiles found in tilemap");
      return;
    }

    // Áp dụng animations cho tiles trên map
    this.replaceAnimatedTilesWithSprites();
  }

  /**
   * 🎨 CREATE TILE ANIMATION - Tạo Phaser animation từ Tiled animation data
   */
  private createTileAnimation(
    tileset: Phaser.Tilemaps.Tileset,
    tileId: number,
    animationData: any[]
  ): void {
    if (!tileset.image) {
      console.warn(`⚠️ Tileset ${tileset.name} has no image`);
      return;
    }

    // Đảm bảo tileset có frames được tạo
    this.ensureTilesetFrames(tileset);

    const animKey = `${tileset.name}_tile_${tileId}`;

    if (this.scene.anims.exists(animKey)) {
      return; // Animation đã tồn tại
    }

    // Tạo frames từ animation data
    // Chú ý: frame.tileid là relative trong tileset, cần cộng với firstgid
    const frames: Phaser.Types.Animations.AnimationFrame[] = animationData.map(
      (frame: any) => {
        const globalTileId = tileset.firstgid + frame.tileid;
        console.log(
          `🎬 Animation frame: tileid=${frame.tileid}, globalId=${globalTileId}`
        );
        return {
          key: tileset.image!.key,
          frame: globalTileId.toString(), // Sử dụng string frame name
        };
      }
    );

    // Tính frame rate từ duration (Tiled dùng milliseconds)
    const avgDuration =
      animationData.reduce(
        (sum: number, frame: any) => sum + frame.duration,
        0
      ) / animationData.length;
    const frameRate = 1000 / avgDuration; // Convert ms to frames per second

    this.scene.anims.create({
      key: animKey,
      frames: frames,
      frameRate: frameRate,
      repeat: -1, // Lặp vô hạn
    });

    console.log(
      `✅ Created animation: ${animKey} with ${
        frames.length
      } frames at ${frameRate.toFixed(1)} fps`
    );
  }

  /**
   * 🔄 REPLACE ANIMATED TILES WITH SPRITES - Thay thế tiles có animation bằng sprites
   */
  private replaceAnimatedTilesWithSprites(): void {
    console.log("🔄 Replacing animated tiles with sprites...");

    this.tilemap.layers.forEach((layerData: Phaser.Tilemaps.LayerData) => {
      if (layerData.tilemapLayer) {
        this.processLayerForAnimatedTiles(layerData.tilemapLayer);
      }
    });
  }

  /**
   * 🔍 PROCESS LAYER FOR ANIMATED TILES - Xử lý một layer để tìm và thay thế animated tiles
   */
  private processLayerForAnimatedTiles(
    layer: Phaser.Tilemaps.TilemapLayer
  ): void {
    // Xác định depth dựa trên tên layer
    const layerName = layer.layer.name;
    let spriteDepth = 0;

    switch (layerName) {
      case "Background":
        spriteDepth = -100; // Phía sau player
        break;
      case "Platforms":
        spriteDepth = 0; // Cùng level với player
        break;
      case "Foreground":
        spriteDepth = 1000; // Phía trước player (che player)
        break;
      default:
        spriteDepth = 0;
    }

    layer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (!tile || tile.index === -1) return;

      // Tìm tileset của tile
      let tileset: Phaser.Tilemaps.Tileset | null = null;
      for (const ts of this.tilemap.tilesets) {
        if (tile.index >= ts.firstgid && tile.index < ts.firstgid + ts.total) {
          tileset = ts;
          break;
        }
      }

      if (!tileset || !tileset.image) return;

      // Kiểm tra tile có animation không
      const tileId = tile.index - tileset.firstgid;
      const animKey = `${tileset.name}_tile_${tileId}`;

      if (this.scene.anims.exists(animKey)) {
        // Tạo sprite thay thế với frame đầu tiên của animation
        const animSprite = this.scene.add.sprite(
          tile.getCenterX(),
          tile.getCenterY(),
          tileset.image.key,
          tile.index.toString() // Sử dụng string frame name
        );

        // =================== LOGIC MỚI THÊM VÀO ===================
        // ĐỌC DỮ LIỆU ROTATION VÀ FLIP TỪ TILE
        // Tiled lưu rotation bằng độ, Phaser dùng radian.
        if (tile.rotation) {
          animSprite.setRotation(tile.rotation); // Phaser.Tilemaps.Tile đã tự chuyển sang radian
        }
        if (tile.flipX) {
          animSprite.setFlipX(true);
        }
        // ==========================================================

        // Đặt kích thước sprite bằng kích thước tile (64x64)
        animSprite.setDisplaySize(tile.width, tile.height);

        // QUAN TRỌNG: Set depth dựa trên layer
        animSprite.setDepth(spriteDepth);

        // THÊM DÒNG NÀY: Lưu animKey vào data của sprite để dùng sau này
        animSprite.setData("animKey", animKey);

        // === LOGIC MỚI QUAN TRỌNG ===
        if (tile.properties.type === "spring") {
          // Với lò xo, KHÔNG play animation. Chỉ dừng ở frame đầu tiên.
          animSprite.stop();
          console.log(
            `- Spring tile at (${tile.x}, ${tile.y}) created as a PAUSED sprite.`
          );

          // Lưu sprite này vào scene để có thể điều khiển sau này
          const springId = `${tile.x}_${tile.y}`;
          this.scene.addInteractiveTileSprite(springId, animSprite);
        } else {
          // Với các tile animation khác, chạy animation như bình thường
          animSprite.play(animKey);
        }
        // ==============================

        // Ẩn tile gốc
        tile.setVisible(false);

        console.log(
          `🎬 Replaced tile at (${tile.x}, ${tile.y}) with animated sprite (depth: ${spriteDepth}, layer: ${layerName})`
        );
      }
    });
  }

  /**
   * 🔧 ENSURE TILESET FRAMES - Đảm bảo tileset có frames được tạo
   */
  private ensureTilesetFrames(tileset: Phaser.Tilemaps.Tileset): void {
    if (!tileset.image) return;

    const texture = this.scene.textures.get(tileset.image.key);
    if (!texture) {
      console.warn(`⚠️ Texture ${tileset.image.key} not found`);
      return;
    }

    // Lấy kích thước thực tế của texture
    const textureSource = texture.source[0];
    const imageWidth = textureSource.width;
    const imageHeight = textureSource.height;

    // Thông số tileset với margin và spacing
    const margin = 1; // Margin từ viền tileset
    const spacing = 2; // Spacing giữa các tiles
    const tileWidth = 64; // Kích thước tile cố định
    const tileHeight = 64;

    console.log(`🔧 Creating frames for tileset: ${tileset.name}`);
    console.log(
      `📏 Image size: ${imageWidth}x${imageHeight}, Tile size: ${tileWidth}x${tileHeight}`
    );
    console.log(`📐 Margin: ${margin}px, Spacing: ${spacing}px`);

    // Tính số tiles theo chiều ngang và dọc (có tính margin và spacing)
    const tilesPerRow = Math.floor(
      (imageWidth - margin * 2 + spacing) / (tileWidth + spacing)
    );
    const tilesPerColumn = Math.floor(
      (imageHeight - margin * 2 + spacing) / (tileHeight + spacing)
    );
    const totalTiles = tilesPerRow * tilesPerColumn;

    console.log(
      `🧮 Tiles layout: ${tilesPerRow}x${tilesPerColumn} = ${totalTiles} tiles`
    );

    // Tạo frames cho từng tile
    for (let i = 0; i < totalTiles; i++) {
      const frameIndex = tileset.firstgid + i;

      // Kiểm tra frame đã tồn tại chưa
      if (texture.has(frameIndex.toString())) {
        continue;
      }

      // Tính vị trí tile trong tileset (có tính margin và spacing)
      const row = Math.floor(i / tilesPerRow);
      const col = i % tilesPerRow;
      const tileX = margin + col * (tileWidth + spacing);
      const tileY = margin + row * (tileHeight + spacing);

      // Thêm frame vào texture
      texture.add(
        frameIndex.toString(), // Frame name
        0, // Source index
        tileX, // X position
        tileY, // Y position
        tileWidth, // Width
        tileHeight // Height
      );
    }

    console.log(
      `✅ Created ${totalTiles} frames for tileset ${tileset.name} (firstgid: ${tileset.firstgid})`
    );
  }

  /**
   * 🗑️ CLEANUP - Dọn dẹp resources khi scene kết thúc
   */
  public cleanup(): void {
    // Tilemap sẽ được Phaser tự động cleanup khi scene destroy
    console.log("🗑️ PlatformerWorldBuilder cleanup completed");
  }

  /**
   * THÊM MỚI: Phương thức để quét và thu thập dữ liệu tile theo type
   */
  private collectInteractiveTiles(type: string): InteractiveTileData[] {
    const tilesData: InteractiveTileData[] = [];
    // Chỉ quét layer "Platforms" vì lò xo nằm ở đây
    const platformsLayer = this.tilemap.getLayer("Platforms")?.tilemapLayer;

    if (platformsLayer) {
      platformsLayer.forEachTile((tile) => {
        if (tile && tile.properties.type === type) {
          const tileId = `${tile.x}_${tile.y}`;
          tilesData.push({ id: tileId, x: tile.x, y: tile.y });
        }
      });
    }
    console.log(`🔍 Found ${tilesData.length} tiles of type '${type}'`);
    return tilesData;
  }

  // THÊM MỚI: Tìm các bomb spawners từ Object layer
  public findBombSpawners(): {
    x: number;
    y: number;
    spawnRate?: number;
    bombLifetime?: number;
  }[] {
    const objectLayer = this.tilemap.getObjectLayer("Objects");
    if (!objectLayer) return [];

    return objectLayer.objects
      .filter((obj: any) => obj.name === "bomb_spawner")
      .map((obj: any) => {
        const spawnRateProp = obj.properties?.find(
          (p: any) => p.name === "spawnRate"
        );
        const bombLifetimeProp = obj.properties?.find(
          (p: any) => p.name === "bombLifetime"
        );
        return {
          x: obj.x,
          y: obj.y,
          spawnRate: spawnRateProp?.value ?? 5.0,
          bombLifetime: bombLifetimeProp?.value ?? 10.0,
        };
      });
  }
}
