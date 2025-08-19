import { Room, getStateCallbacks } from "colyseus.js";
import {
  GameRoomState,
  Player as PlayerStateSchema,
} from "../core/types/GameRoomState";
import { BasePlatformerScene } from "../../scenes/platformer/BasePlatformerScene";
import { AnimationManager, AnimationState } from "./AnimationManager";
import { TextUtils } from "../../utils/TextUtils";

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
  private remotePlayerSprites: Map<string, Phaser.Physics.Arcade.Sprite> =
    new Map();
  private remotePlayerAnims: Map<string, AnimationManager> = new Map();
  private remotePlayerNameTags: Map<string, Phaser.GameObjects.Text> =
    new Map(); // <-- THÊM MỚI

  // 🔧 Track created players để tránh duplicates
  private createdPlayers: Set<string> = new Set();
  private isListenersSetup: boolean = false; // Thêm cờ để đảm bảo listener chỉ setup 1 lần
  
  // <-- THÊM THUỘC TÍNH CHO NỘI SUY THỐNG NHẤT -->
  private LERP_FACTOR = 0.25; // Dùng chung LERP_FACTOR cho nhất quán

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

    console.log(
      `✅ PlatformerNetworkHandler state listeners setup successfully`
    );
  }

  /**
   * Được gọi mỗi frame từ scene để nội suy chuyển động của người chơi khác.
   */
  public update(): void {
    this.remotePlayerSprites.forEach((sprite, sessionId) => {
      const target_x = sprite.getData('target_x');
      const target_y = sprite.getData('target_y');
      const isGrabbed = sprite.getData('isGrabbed') === true;

      if (typeof target_x !== 'number' || typeof target_y !== 'number') {
        return;
      }

      if (isGrabbed) {
        // <-- LOGIC NỘI SUY CHO REMOTE PLAYER BỊ NẮM -->
        // Vô hiệu hóa vật lý nhưng vẫn giữ nội suy mượt mà
        const body = sprite.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0); // Dừng mọi chuyển động vật lý
        body.setAllowGravity(false); // Tắt trọng lực
        body.setImmovable(true); // Không bị đẩy bởi vật khác
        
        // Vẫn dùng nội suy tuyến tính để chuyển động mượt
        sprite.x = Phaser.Math.Linear(sprite.x, target_x, this.LERP_FACTOR);
        sprite.y = Phaser.Math.Linear(sprite.y, target_y, this.LERP_FACTOR);
      } else {
        // <-- LOGIC THÍCH ỨNG CHO REMOTE PLAYER TỰ DO -->
        // Kiểm tra vị trí target có hợp lệ không
        const worldHeight = this.scene.physics.world.bounds.height;
        const worldWidth = this.scene.physics.world.bounds.width;

        // Nếu target nằm ngoài world bounds hoặc dưới đáy -> không nội suy
        if (
          target_x < 0 ||
          target_x > worldWidth ||
          target_y < 0 ||
          target_y > worldHeight
        ) {
          console.warn(
            `[NetworkHandler] Invalid target position for ${sessionId}: (${target_x}, ${target_y})`
          );
          return;
        }

        // Tính khoảng cách để điều chỉnh tốc độ nội suy
        const distanceX = Math.abs(target_x - sprite.x);
        const distanceY = Math.abs(target_y - sprite.y);
        const totalDistance = Math.sqrt(
          distanceX * distanceX + distanceY * distanceY
        );

        // Điều chỉnh factor dựa trên khoảng cách
        if (totalDistance > 200) {
          // Khoảng cách quá lớn -> teleport ngay lập tức (có thể do lag hoặc respawn)
          sprite.x = target_x;
          sprite.y = target_y;
        } else {
          // Nội suy với factor thích ứng
          let factor = 0.2; // Factor mặc định cho chuyển động chậm

          if (totalDistance > 100) {
            // Khoảng cách lớn (nhảy xa) -> nội suy nhanh
            factor = 0.8;
          } else if (totalDistance > 50) {
            // Khoảng cách trung bình (nhảy) -> nội suy vừa
            factor = 0.5;
          } else if (totalDistance > 20) {
            // Khoảng cách nhỏ (di chuyển nhanh) -> nội suy bình thường
            factor = 0.3;
          }
          // Khoảng cách rất nhỏ (< 20) -> giữ factor mặc định 0.2

          sprite.x = Phaser.Math.Linear(sprite.x, target_x, factor);
          sprite.y = Phaser.Math.Linear(sprite.y, target_y, factor);
        }
      }
      
      // Cập nhật vị trí name tag
      const nameTag = this.remotePlayerNameTags.get(sessionId);
      if (nameTag) {
        nameTag.x = sprite.x;
        nameTag.y = sprite.y - 60;
      }
    });
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

      this.remotePlayerNameTags.set(sessionId, nameTag); // Lưu lại name tag

      // Va chạm với nền đất nhưng không bị ảnh hưởng bởi trọng lực
      this.scene.physics.add.collider(entity, this.platformsLayer);
      // Thiết lập vật lý đơn giản: không bị trọng lực, không bị đẩy, như bức tường
      const body = entity.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.pushable = false;
      body.setSize(48, 80);
      body.setOffset(40, 48);
      this.remotePlayersGroup.add(entity);

      this.remotePlayerSprites.set(sessionId, entity);
      this.remotePlayerAnims.set(
        sessionId,
        new AnimationManager(this.scene, entity, characterData)
      );

      // Gắn dữ liệu mục tiêu ban đầu
      entity.setData("target_x", playerState.x);
      entity.setData("target_y", playerState.y);

      // Lắng nghe thay đổi trạng thái của người chơi này từ server
      const $: any = getStateCallbacks(this.room!);
      ($ as any)(playerState).onChange(() => {
        // CẬP NHẬT DỮ LIỆU ĐỂ HÀM UPDATE() SỬ DỤNG
        entity.setData('target_x', playerState.x);
        entity.setData('target_y', playerState.y);
        entity.setData('isGrabbed', playerState.isGrabbed); // <-- Thêm dòng này

        // Cập nhật username nếu nó thay đổi (hiếm nhưng nên có)
        const nameTag = this.remotePlayerNameTags.get(sessionId);
        if (nameTag) {
          nameTag.setText(playerState.username);
        }

        const animManager = this.remotePlayerAnims.get(sessionId);
        animManager?.playAnimation(playerState.animState as AnimationState);
        entity.setFlipX(playerState.flipX);
      });
    }
  };

  /**
   * Xử lý khi có người chơi rời phòng.
   */
  private removePlayerEntity = (
    playerState: PlayerStateSchema,
    sessionId: string
  ) => {
    const entity = this.remotePlayerSprites.get(sessionId);
    if (entity) {
      // THAY ĐỔI: Xóa khỏi group
      this.remotePlayersGroup.remove(entity, true, true);
      this.remotePlayerSprites.delete(sessionId);
    }

    const animManager = this.remotePlayerAnims.get(sessionId);
    if (animManager) {
      animManager.destroy();
      this.remotePlayerAnims.delete(sessionId);
    }

    // THÊM MỚI: Destroy name tag
    const nameTag = this.remotePlayerNameTags.get(sessionId);
    if (nameTag) {
      nameTag.destroy();
      this.remotePlayerNameTags.delete(sessionId);
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
    return this.remotePlayerSprites.get(sessionId);
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

    this.remotePlayerSprites.forEach((sprite, sessionId) => {
      const distance = Phaser.Math.Distance.Between(x, y, sprite.x, sprite.y);
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
    this.remotePlayerSprites.clear();
    this.remotePlayerAnims.clear();
    this.remotePlayerNameTags.clear(); // <-- THÊM MỚI

    this.createdPlayers.clear(); // 🔧 Clear tracking
    console.log("🗑️ PlatformerNetworkHandler cleaned up.");
  }
}
