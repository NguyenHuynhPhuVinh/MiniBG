import { Room, getStateCallbacks } from "colyseus.js";
import { InteractiveObjectManager } from "../interactive/InteractiveObjectManager";
import {
  GameRoomState,
  Player as PlayerStateSchema,
  Bomb as BombStateSchema,
} from "../core/types/GameRoomState";
import { BasePlatformerScene } from "../../scenes/platformer/BasePlatformerScene";
import { AnimationManager, AnimationState } from "./AnimationManager";
import { TextUtils } from "../../utils/TextUtils";
import { EntityInterpolator } from "../../utils/EntityInterpolator";

interface RemotePlayerData {
  sprite: Phaser.Physics.Arcade.Sprite;
  interpolator: EntityInterpolator;
  animManager: AnimationManager;
  nameTag: Phaser.GameObjects.Text;
}

/**
 * 📡 PLATFORMER NETWORK HANDLER - Chuyên gia Xử lý Multiplayer
 *
 * Lớp này cô lập toàn bộ logic giao tiếp và đồng bộ hóa với server Colyseus.
 *
 * TRÁCH NHIỆM:
 * - Lắng nghe các sự kiện onAdd, onRemove, onChange từ server.
 * - Tạo, quản lý và hủy các sprite của người chơi khác (remote players).
 * - Vô hiệu hóa vật lý cho remote players.
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

    console.log(
      `✅ PlatformerNetworkHandler state listeners setup successfully`
    );
  }

  /**
   * Được gọi mỗi frame từ scene để nội suy chuyển động của người chơi khác.
   */
  public update(): void {
    this.remotePlayers.forEach((data) => {
      const pos = data.interpolator.update();
      if (pos) {
        data.sprite.setPosition(pos.x, pos.y);
        data.nameTag.setPosition(pos.x, pos.y - 60);
      }
    });

    // Cập nhật InteractiveObjectManager
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
      body.setAllowGravity(true);
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

      const remoteData: RemotePlayerData = {
        sprite: entity,
        interpolator: new EntityInterpolator(),
        animManager,
        nameTag,
      };
      // seed first snapshot to avoid null on first frames
      remoteData.interpolator.addSnapshot(playerState.x, playerState.y);
      this.remotePlayers.set(sessionId, remoteData);

      // Lắng nghe thay đổi trạng thái của người chơi này từ server
      const $: any = getStateCallbacks(this.room!);
      ($ as any)(playerState).onChange(() => {
        const data = this.remotePlayers.get(sessionId);
        if (!data) return;
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

    this.createdPlayers.clear(); // 🔧 Clear tracking
    console.log("🗑️ PlatformerNetworkHandler cleaned up.");
  }
}
