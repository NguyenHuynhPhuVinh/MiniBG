import { Room, getStateCallbacks } from "colyseus.js";
import {
  GameRoomState,
  Player as PlayerStateSchema,
} from "../core/types/GameRoomState";
import { BasePlatformerScene } from "../../scenes/platformer/BasePlatformerScene";
import { AnimationManager, AnimationState } from "./AnimationManager";

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
  private room!: Room<GameRoomState>;

  // Dùng để lưu trữ sprite và animation manager của những người chơi khác
  private remotePlayerSprites: Map<string, Phaser.Physics.Arcade.Sprite> =
    new Map();
  private remotePlayerAnims: Map<string, AnimationManager> = new Map();

  // 🔧 Track created players để tránh duplicates
  private createdPlayers: Set<string> = new Set();
  private isListenersSetup: boolean = false; // Thêm cờ để đảm bảo listener chỉ setup 1 lần

  constructor(
    scene: BasePlatformerScene,
    platformsLayer: Phaser.Tilemaps.TilemapLayer
  ) {
    this.scene = scene;
    this.platformsLayer = platformsLayer;
  }

  /**
   * Khởi tạo handler với room instance và thiết lập các listeners.
   * @param room - Instance của Colyseus Room.
   */
  public initialize(room: Room<GameRoomState>): void {
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

    const $ = getStateCallbacks(this.room);

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
      const target_x = sprite.getData("target_x");
      const target_y = sprite.getData("target_y");

      if (typeof target_x === "number" && typeof target_y === "number") {
        // Nội suy tuyến tính (Lerp) để làm mượt chuyển động
        const factor = 0.2;
        sprite.x = Phaser.Math.Linear(sprite.x, target_x, factor);
        sprite.y = Phaser.Math.Linear(sprite.y, target_y, factor);
      }
    });
  }

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
      entity.setDisplaySize(96, 96).setTint(0x00ff00); // Màu xanh để phân biệt

      // Va chạm với nền đất nhưng không bị ảnh hưởng bởi trọng lực
      this.scene.physics.add.collider(entity, this.platformsLayer);
      const body = entity.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);

      this.remotePlayerSprites.set(sessionId, entity);
      this.remotePlayerAnims.set(
        sessionId,
        new AnimationManager(this.scene, entity, characterData)
      );

      // Gắn dữ liệu mục tiêu ban đầu
      entity.setData("target_x", playerState.x);
      entity.setData("target_y", playerState.y);

      // Lắng nghe thay đổi trạng thái của người chơi này từ server
      const $ = getStateCallbacks(this.room!);
      $(playerState).onChange(() => {
        entity.setData("target_x", playerState.x);
        entity.setData("target_y", playerState.y);

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
      entity.destroy();
      this.remotePlayerSprites.delete(sessionId);
    }

    const animManager = this.remotePlayerAnims.get(sessionId);
    if (animManager) {
      animManager.destroy();
      this.remotePlayerAnims.delete(sessionId);
    }
    console.log(`Removed remote player sprite for ${sessionId}`);
  };

  /**
   * Dọn dẹp tài nguyên khi scene kết thúc.
   */
  public cleanup(): void {
    // Không cần cleanup listeners vì chúng ta không trực tiếp gán vào room.state.players
    // Colyseus tự động cleanup khi room bị destroy
    this.remotePlayerSprites.clear();
    this.remotePlayerAnims.clear();
    this.createdPlayers.clear(); // 🔧 Clear tracking
    console.log("🗑️ PlatformerNetworkHandler cleaned up.");
  }
}
