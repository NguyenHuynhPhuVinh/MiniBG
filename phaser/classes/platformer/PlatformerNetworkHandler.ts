import { Room, getStateCallbacks } from "colyseus.js";
import { InteractiveObjectManager } from "../interactive/InteractiveObjectManager";
import {
  GameRoomState,
  Player as PlayerStateSchema,
  Bomb as BombStateSchema,
  Enemy as EnemyStateSchema,
  PhysicsObject as PhysicsObjectSchema, // <-- THÊY THẾ ROCK BẰNG PHYSICS OBJECT
} from "../core/types/GameRoomState";
import { BasePlatformerScene } from "../../scenes/platformer/BasePlatformerScene";
import { AnimationManager, AnimationState } from "./AnimationManager";
import { TextUtils } from "../../utils/TextUtils";
import { EntityInterpolator } from "../../utils/EntityInterpolator";
import { RemoteEnemy } from "./enemies/RemoteEnemy";

interface RemotePlayerData {
  sprite: Phaser.Physics.Arcade.Sprite;
  interpolator: EntityInterpolator;
  animManager: AnimationManager;
  nameTag: Phaser.GameObjects.Text;
  // THÊM MỚI: Đèn có thể có hoặc không, tùy vào scene
  light?: Phaser.GameObjects.Light;
}

/**
 * 📡 PLATFORMER NETWORK HANDLER - Chuyên gia Xử lý Multiplayer
 *
 * Lớp này cô lập toàn bộ logic giao tiếp và đồng bộ hóa với server Colyseus.
 *
 * TRÁCH NHIỆM:
 * - Lắng nghe các sự kiện onAdd, onRemove, onChange từ server.
 * - Tạo, quản lý và hủy các sprite của người chơi khác (remote players).
 * - Tinh chỉnh vật lý cho remote players (tắt trọng lực khi bị bế, giữ va chạm).
 * - Áp dụng kỹ thuật nội suy (interpolation) để làm mượt chuyển động của remote players.
 * - Ra tín hiệu cho Scene khi cần tạo người chơi chính (local player).
 */
export class PlatformerNetworkHandler {
  private scene: BasePlatformerScene;
  private platformsLayer: Phaser.Tilemaps.TilemapLayer;
  private room!: Room<any>;

  // THAY ĐỔI: Chuyển remotePlayerSprites thành một Group
  private remotePlayersGroup!: Phaser.Physics.Arcade.Group;
  private remotePlayers: Map<string, RemotePlayerData> = new Map();

  // 🔧 Track created players để tránh duplicates
  private createdPlayers: Set<string> = new Set();
  private isListenersSetup: boolean = false; // Thêm cờ để đảm bảo listener chỉ setup 1 lần

  // THÊM MỚI: Theo dõi bombs (Matter) và proxy (Arcade)
  private bombMatterSprites: Map<string, Phaser.Physics.Matter.Sprite> =
    new Map();
  private bombProxySprites: Map<string, Phaser.Physics.Arcade.Sprite> =
    new Map();
  private interactiveObjectManager!: InteractiveObjectManager;

  // THÊM MỚI: Theo dõi remote enemies (Server-Authoritative AI)
  private remoteEnemies: Map<string, RemoteEnemy> = new Map();

  // (Đã gom hằng số vào InterpolationUtils)

  constructor(
    scene: BasePlatformerScene,
    platformsLayer: Phaser.Tilemaps.TilemapLayer
  ) {
    this.scene = scene;
    this.platformsLayer = platformsLayer;

    // KHỞI TẠO GROUP Ở ĐÂY
    this.remotePlayersGroup = this.scene.physics.add.group();
  }

  // THÊM MỚI: Getter để BasePlatformerScene có thể truy cập group này
  public getRemotePlayersGroup(): Phaser.Physics.Arcade.Group {
    return this.remotePlayersGroup;
  }

  // THÊM MỚI: Phương thức tiện ích để tìm sessionId từ sprite
  public getSessionIdBySprite(
    sprite: Phaser.Physics.Arcade.Sprite
  ): string | null {
    for (const [sessionId, data] of this.remotePlayers.entries()) {
      if (data.sprite === sprite) {
        return sessionId;
      }
    }
    return null;
  }

  /**
   * Khởi tạo handler với room instance và thiết lập các listeners.
   * @param room - Instance của Colyseus Room.
   */
  public initialize(room: Room<any>): void {
    console.log(
      `🔧 PlatformerNetworkHandler initializing with room:`,
      room.name
    );
    this.room = room;

    // Khởi tạo InteractiveObjectManager ngay khi initialize để tránh race condition với update()
    this.interactiveObjectManager = new InteractiveObjectManager(
      this.scene as any,
      this.room
    );

    this.createdPlayers.clear();
    this.isListenersSetup = false; // Reset cờ

    // Chờ state thay đổi lần đầu tiên để đảm bảo nó đã được đồng bộ từ server
    room.onStateChange.once((state) => {
      console.log(`🔄 Room state is now available/synced:`, state);
      this.setupStateListeners();
    });

    // Fallback nếu state đã có sẵn ngay lúc initialize
    if (room.state && room.state.players && room.state.players.size > 0) {
      console.log(`🔍 Room state was already available on initialize.`);
      this.setupStateListeners();
    }
  }

  private setupStateListeners(): void {
    // Dùng cờ để đảm bảo không setup listener 2 lần
    if (this.isListenersSetup) return;
    this.isListenersSetup = true;

    if (!this.room || !this.room.state) {
      console.warn(`⚠️ Cannot setup listeners: room or state not available`);
      return;
    }

    const $: any = getStateCallbacks(this.room);

    // XÓA ĐOẠN FOREACH ĐỂ TRÁNH RACE CONDITION
    // Lý do: onAdd sẽ được gọi cho TẤT CẢ players hiện có khi state được sync lần đầu
    // và cả những players mới tham gia sau đó
    /*
    if (this.room.state.players) {
      console.log(
        `👥 Processing ${this.room.state.players.size} existing players...`
      );
      this.room.state.players.forEach(this.addPlayerEntity);
    } else {
      console.log(`👥 No players collection available yet`);
    }
    */

    // CHỈ GIỮ LẠI CÁC LISTENER NÀY
    // onAdd sẽ tự động xử lý cả người chơi có sẵn và người chơi mới
    console.log(
      "✅ Relying solely on onAdd/onRemove listeners for entity creation."
    );
    $(this.room.state).players.onAdd(this.addPlayerEntity);
    $(this.room.state).players.onRemove(this.removePlayerEntity);

    // THÊM MỚI: Listener cho bombs (qua InteractiveObjectManager)
    $(this.room.state).bombs.onAdd(
      (bombState: BombStateSchema, bombId: string) => {
        this.interactiveObjectManager?.spawnFromState(
          "bomb",
          bombId,
          bombState
        );
      }
    );
    $(this.room.state).bombs.onRemove(
      (_bombState: BombStateSchema, bombId: string) => {
        this.interactiveObjectManager?.despawn(bombId);
      }
    );

    // THÊM MỚI: Listeners cho enemies (Server-Authoritative AI)
    $(this.room.state).enemies.onAdd(this.addEnemyEntity);
    $(this.room.state).enemies.onRemove(this.removeEnemyEntity);

    // Lắng nghe thay đổi của từng enemy
    $(this.room.state).enemies.onAdd(
      (enemyState: EnemyStateSchema, enemyId: string) => {
        // Setup listener cho enemy cụ thể này
        $(enemyState).onChange(() => {
          const enemy = this.remoteEnemies.get(enemyId);
          if (enemy) {
            enemy.updateState(enemyState);
          }
        });
      }
    );

    // THÊM MỚI: Listeners cho instant spike traps
    $(this.room.state).instantSpikeTraps.onAdd(
      (trapState: any, trapId: string) => {
        this.interactiveObjectManager?.spawnFromState(
          "instant_spike_trap",
          trapId,
          trapState
        );
      }
    );
    $(this.room.state).instantSpikeTraps.onRemove(
      (_trapState: any, trapId: string) => {
        this.interactiveObjectManager?.despawn(trapId);
      }
    );

    // ================== BẮT ĐẦU THÊM LOGIC MỚI CHO PHYSICS OBJECTS ==================

    // 1. Lắng nghe các vật thể vật lý SẼ ĐƯỢC THÊM VÀO trong tương lai
    // Colyseus sẽ TỰ ĐỘNG gọi onAdd cho tất cả vật thể ĐÃ TỒN TẠI khi client kết nối
    // và cả những vật thể mới được tạo sau đó. KHÔNG CẦN forEach dư thừa!
    $(this.room.state).physicsObjects.onAdd(
      (physState: PhysicsObjectSchema, id: string) => {
        console.log(
          `[Client Network] PhysicsObject ADDED signal received: ${id} (asset: ${physState.assetKey})`
        );
        // Truyền cả state làm options để GenericPhysicsView có thể đọc assetKey
        this.interactiveObjectManager?.spawnFromState(
          "generic_physics_object",
          id,
          physState,
          physState // Pass state as options to read assetKey and physics config
        );
      }
    );

    // 2. Lắng nghe các vật thể vật lý SẼ BỊ XÓA trong tương lai
    $(this.room.state).physicsObjects.onRemove(
      (_physState: PhysicsObjectSchema, id: string) => {
        console.log(
          `[Client Network] PhysicsObject REMOVED signal received: ${id}`
        );
        this.interactiveObjectManager?.despawn(id);
      }
    );

    // ================== KẾT THÚC LOGIC MỚI CHO PHYSICS OBJECTS ==================

    console.log(
      `✅ PlatformerNetworkHandler state listeners setup successfully`
    );
  }

  /**
   * Được gọi mỗi frame từ scene để nội suy chuyển động và quản lý timer.
   */
  public update(): void {
    const CORRECTION_FACTOR = 10;
    const TELEPORT_THRESHOLD = 250;

    this.remotePlayers.forEach((data, sessionId) => {
      // Lấy trạng thái mới nhất của người chơi này từ server state
      const playerState = this.room.state.players.get(sessionId);
      if (!playerState) return;

      const targetPos = data.interpolator.update();

      if (targetPos && data.sprite && data.sprite.body) {
        const currentPos = data.sprite;
        const body = data.sprite.body as Phaser.Physics.Arcade.Body;

        // === LOGIC HYBRID MỚI ===
        if (playerState.isGrabbed) {
          // TRƯỜNG HỢP 1: Bị nắm/bế -> Dùng setPosition để có quyền lực tuyệt đối
          // Vị trí là tuyệt đối, không cần hiệu chỉnh mượt mà bằng vật lý.
          currentPos.setPosition(targetPos.x, targetPos.y);
          // Tắt mọi vận tốc vật lý để tránh xung đột
          body.setVelocity(0, 0);
        } else {
          // TRƯỜNG HỢP 2: Tự do -> Dùng setVelocity để di chuyển mượt mà
          const distance = Phaser.Math.Distance.Between(
            currentPos.x,
            currentPos.y,
            targetPos.x,
            targetPos.y
          );

          if (distance > TELEPORT_THRESHOLD) {
            currentPos.setPosition(targetPos.x, targetPos.y);
            body.setVelocity(0, 0);
          } else {
            const errorX = targetPos.x - currentPos.x;
            const errorY = targetPos.y - currentPos.y;
            body.setVelocity(
              errorX * CORRECTION_FACTOR,
              errorY * CORRECTION_FACTOR
            );
          }
        }

        data.nameTag.setPosition(currentPos.x, currentPos.y - 60);

        // THÊM MỚI: Cập nhật vị trí đèn của remote player
        if (data.light) {
          data.light.setPosition(currentPos.x, currentPos.y);
        }
      }
    });

    // THÊM MỚI: Cập nhật tất cả remote enemies
    this.remoteEnemies.forEach((enemy) => {
      enemy.update();
    });

    this.interactiveObjectManager?.update(16.6667);
  }

  // THÊM MỚI: Cập nhật debug hitbox cho remote player

  /**
   * 🖼️ SETUP REMOTE PLAYER FRAMES - Setup frames cho remote players
   */
  private setupRemotePlayerFrames(): void {
    const texture = this.scene.textures.get("spritesheet-characters-default");
    const characterData = this.scene.getCharacterData();

    // Duyệt qua tất cả animation states và add frames
    Object.entries(characterData).forEach(([, frames]) => {
      frames.forEach((frame: any, index: number) => {
        const frameKey = `char_${frame.x}_${frame.y}_${index}`;

        // Chỉ add frame nếu chưa tồn tại
        if (!texture.has(frameKey)) {
          texture.add(frameKey, 0, frame.x, frame.y, frame.width, frame.height);
        }
      });
    });
  }

  /**
   * Xử lý khi có một người chơi mới vào phòng (hoặc khi mình mới vào).
   */
  private addPlayerEntity = (
    playerState: PlayerStateSchema,
    sessionId: string
  ) => {
    console.log(
      `🎭 addPlayerEntity called for sessionId: ${sessionId}, isMe: ${
        sessionId === this.room.sessionId
      }`
    );
    console.log(`🎭 Player state:`, {
      x: playerState.x,
      y: playerState.y,
      animState: playerState.animState,
    });

    // 🔧 Check nếu player đã được tạo
    if (this.createdPlayers.has(sessionId)) {
      console.log(`⚠️ Player ${sessionId} already created, skipping...`);
      return;
    }

    const isMe = sessionId === this.room.sessionId;

    if (isMe) {
      // Nếu là mình, gọi method tạo nhân vật chính của Scene
      console.log(`👤 Creating main player for session: ${sessionId}`);
      this.createdPlayers.add(sessionId); // Mark as created
      this.scene.createMainPlayer(playerState);
    } else {
      // Nếu là người chơi khác, tạo một sprite "ma" để hiển thị
      console.log(`👻 Creating remote player sprite for ${sessionId}`);
      this.createdPlayers.add(sessionId); // Mark as created
      this.setupRemotePlayerFrames();

      // Lấy frame đầu tiên của idle animation
      const characterData = this.scene.getCharacterData();
      const firstFrame = characterData.idle[0];
      const frameKey = `char_${firstFrame.x}_${firstFrame.y}_0`;

      const entity = this.scene.physics.add.sprite(
        playerState.x,
        playerState.y,
        "spritesheet-characters-default",
        frameKey
      );

      // XÓA DÒNG NÀY ĐỂ BỎ MÀU XANH
      // entity.setDisplaySize(96, 96).setTint(0x00ff00);

      // THAY BẰNG DÒNG NÀY
      entity.setDisplaySize(96, 96);

      // THÊM MỚI: Tạo Name Tag với TextUtils
      const nameTag = TextUtils.createPlayerNameTag(
        this.scene,
        playerState.x,
        playerState.y - 60,
        playerState.username,
        false // isLocalPlayer = false
      );

      // Thêm hiệu ứng fade in cho name tag
      TextUtils.fadeInText(nameTag, 300);

      // BẬT va chạm với nền đất và cấu hình body để dùng nội suy velocity
      this.scene.physics.add.collider(entity, this.platformsLayer);
      const body = entity.body as Phaser.Physics.Arcade.Body;

      // --- THAY ĐỔI 1: Đặt trạng thái trọng lực ban đầu ---
      // Nếu người chơi này vào phòng trong lúc đã bị bế, tắt trọng lực ngay
      body.setAllowGravity(!playerState.isGrabbed);

      body.setCollideWorldBounds(true);
      body.setImmovable(true);
      body.pushable = false;
      body.setSize(48, 80);
      body.setOffset(40, 48);
      this.remotePlayersGroup.add(entity);

      const animManager = new AnimationManager(
        this.scene,
        entity,
        characterData
      );

      // THÊM MỚI: Tạo đèn cho remote player nếu scene có bật lighting
      let remoteLight: Phaser.GameObjects.Light | undefined;
      // Chỉ tạo đèn nếu scene hiện tại có bật hệ thống ánh sáng
      if (this.scene.isLightingEnabled()) {
        remoteLight = this.scene.lights.addLight(
          playerState.x,
          playerState.y,
          120, // Bán kính nhỏ hơn một chút so với local player
          0xffdab9, // Màu đào nhạt để phân biệt
          1.0 // Cường độ yếu hơn một chút
        );
        console.log(`🔦 Added light source to remote player ${sessionId}`);
      }

      const remoteData: RemotePlayerData = {
        sprite: entity,
        interpolator: new EntityInterpolator(),
        animManager,
        nameTag,
        light: remoteLight, // Lưu đèn vào remoteData
      };
      // seed first snapshot to avoid null on first frames
      remoteData.interpolator.addSnapshot(playerState.x, playerState.y);
      this.remotePlayers.set(sessionId, remoteData);

      // Lắng nghe thay đổi trạng thái của người chơi này từ server
      const $: any = getStateCallbacks(this.room!);
      ($ as any)(playerState).onChange(() => {
        const data = this.remotePlayers.get(sessionId);
        if (!data) return;

        // --- LOGIC CẬP NHẬT MỚI: Tinh chỉnh vật lý thay vì tắt hoàn toàn ---
        const remoteBody = data.sprite.body as Phaser.Physics.Arcade.Body;

        if (playerState.isGrabbed) {
          // Giữ cho vật thể "rắn" nhưng không bị ảnh hưởng bởi trọng lực
          remoteBody.setAllowGravity(false);
          // Dừng mọi chuyển động vật lý cục bộ, vị trí sẽ do interpolator quyết định
          remoteBody.setVelocity(0, 0);
        } else {
          // Trường hợp thông thường (không bị nắm), bật lại trọng lực
          remoteBody.setAllowGravity(true);
        }
        // --- KẾT THÚC LOGIC CẬP NHẬT MỚI ---

        data.interpolator.addSnapshot(playerState.x, playerState.y);
        data.nameTag.setText(playerState.username);
        data.animManager.playAnimation(playerState.animState as AnimationState);
        data.sprite.setFlipX(playerState.flipX);
      });
    }
  };

  // ======================= BOM HANDLERS REMOVED (handled by InteractiveObjectManager) =======================

  /**
   * Xử lý khi có người chơi rời phòng.
   */
  private removePlayerEntity = (
    playerState: PlayerStateSchema,
    sessionId: string
  ) => {
    const data = this.remotePlayers.get(sessionId);
    if (data) {
      this.remotePlayersGroup.remove(data.sprite, true, true);
      data.animManager.destroy();
      data.nameTag.destroy();

      // THÊM MỚI: Dọn dẹp đèn của remote player
      if (data.light) {
        this.scene.lights.removeLight(data.light);
      }

      this.remotePlayers.delete(sessionId);
    }

    // THÊM MỚI: Destroy debug hitbox

    console.log(`Removed remote player sprite and name tag for ${sessionId}`);
  };

  // <-- THÊM CÁC PHƯƠNG THỨC HELPER MỚI CHO TÍNH NĂNG NẮM VÀ THOÁT -->

  /**
   * Lấy sprite của một người chơi từ xa.
   */
  public getRemoteSprite(
    sessionId: string
  ): Phaser.Physics.Arcade.Sprite | undefined {
    return this.remotePlayers.get(sessionId)?.sprite;
  }

  /**
   * Tìm người chơi từ xa gần nhất.
   */
  public findClosestRemotePlayer(
    x: number,
    y: number,
    maxDistance: number
  ): { sessionId: string; distance: number } | null {
    let closestPlayer: { sessionId: string; distance: number } | null = null;
    let minDistance = maxDistance;

    this.remotePlayers.forEach((data, sessionId) => {
      const distance = Phaser.Math.Distance.Between(
        x,
        y,
        data.sprite.x,
        data.sprite.y
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestPlayer = { sessionId, distance };
      }
    });

    return closestPlayer;
  }

  // THÊM MỚI: Handlers cho Enemy entities (Server-Authoritative AI)

  /**
   * Xử lý khi có enemy mới được spawn từ server
   */
  private addEnemyEntity = (enemyState: EnemyStateSchema, enemyId: string) => {
    if (this.remoteEnemies.has(enemyId)) {
      return;
    }

    try {
      const enemy = new RemoteEnemy(
        this.scene,
        enemyState.x,
        enemyState.y,
        enemyState.enemyType
      );

      // Áp dụng lighting pipeline nếu scene hỗ trợ
      if (this.scene.isLightingEnabled && this.scene.isLightingEnabled()) {
        enemy.applyLightingPipeline();
      }

      this.remoteEnemies.set(enemyId, enemy);

      // Cập nhật state ban đầu
      enemy.updateState(enemyState);
    } catch (error) {
      console.error(
        `[Client] Failed to create remote enemy ${enemyId}:`,
        error
      );
    }
  };

  /**
   * Xử lý khi enemy bị xóa từ server
   */
  private removeEnemyEntity = (
    enemyState: EnemyStateSchema,
    enemyId: string
  ) => {
    const enemy = this.remoteEnemies.get(enemyId);
    if (enemy) {
      enemy.destroy();
      this.remoteEnemies.delete(enemyId);
    }
  };

  /**
   * Lấy remote enemy theo ID
   */
  public getRemoteEnemy(enemyId: string): RemoteEnemy | undefined {
    return this.remoteEnemies.get(enemyId);
  }

  /**
   * Lấy tất cả remote enemies
   */
  public getAllRemoteEnemies(): Map<string, RemoteEnemy> {
    return this.remoteEnemies;
  }

  /**
   * Dọn dẹp tài nguyên khi scene kết thúc.
   */
  public cleanup(): void {
    // Không cần cleanup listeners vì chúng ta không trực tiếp gán vào room.state.players
    // Colyseus tự động cleanup khi room bị destroy

    // THAY ĐỔI: Dọn dẹp group
    this.remotePlayersGroup.clear(true, true);
    this.remotePlayers.clear();

    // Dọn dẹp bombs (Matter + proxy)
    this.bombMatterSprites.forEach((s) => s.destroy());
    this.bombMatterSprites.clear();
    this.bombProxySprites.forEach((s) => s.destroy());
    this.bombProxySprites.clear();

    // THÊM MỚI: Dọn dẹp remote enemies
    this.remoteEnemies.forEach((enemy) => enemy.destroy());
    this.remoteEnemies.clear();

    this.createdPlayers.clear(); // 🔧 Clear tracking
    console.log("🗑️ PlatformerNetworkHandler cleaned up.");
  }
}
