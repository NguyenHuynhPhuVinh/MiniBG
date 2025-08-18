import { Client, Room, getStateCallbacks } from "colyseus.js";
import { EventBus } from "../../EventBus";
import { GameRoomState } from "./types/GameRoomState"; // Sẽ tạo file này ngay sau đây

export class NetworkManager {
  private static instance: NetworkManager; // Thêm instance cho singleton
  private client: Client;
  public room: Room<GameRoomState> | null = null; // Có thể null khi không ở trong phòng
  private pendingRoom: Room<GameRoomState> | null = null; // Room đang đợi Scene sẵn sàng

  // Chuyển constructor thành private
  private constructor() {
    console.log(`🔧 NetworkManager constructor called`);
    const endpoint =
      process.env.NODE_ENV === "production"
        ? "wss://game-server-vjqb.onrender.com"
        : "ws://localhost:2567";
    this.client = new Client(endpoint);
    console.log(`🔧 NetworkManager client created for endpoint: ${endpoint}`);

    // Lắng nghe khi Scene sẵn sàng
    EventBus.on("scene-ready-for-network", (sceneName: string) => {
      console.log(
        `🎯 Scene ${sceneName} ready for network, checking pending room...`
      );
      if (this.pendingRoom) {
        console.log(`📡 Emitting network-connected for pending room`);
        EventBus.emit("network-connected", this.pendingRoom);
        this.pendingRoom = null;
      }
    });
  }

  // Thêm method để lấy instance (Singleton Pattern)
  public static getInstance(): NetworkManager {
    console.log(
      `🔧 NetworkManager.getInstance() called, current instance:`,
      !!NetworkManager.instance
    );
    if (!NetworkManager.instance) {
      console.log(`🔧 Creating new NetworkManager instance...`);
      NetworkManager.instance = new NetworkManager();
    } else {
      console.log(`🔧 Returning existing NetworkManager instance`);
    }
    return NetworkManager.instance;
  }

  // Sửa lại hàm joinRoundRoom
  public async joinRoundRoom(
    quizId: number | string, // Thêm string để linh hoạt hơn
    roundNumber: number | string, // Thêm string để linh hoạt hơn
    testRoomId?: string // <-- THÊM THAM SỐ TÙY CHỌN NÀY
  ) {
    // Ưu tiên sử dụng testRoomId nếu có, nếu không thì tạo ID như cũ
    const targetRoomId = testRoomId || `quiz_${quizId}_round_${roundNumber}`;

    console.log(`🎯 joinRoundRoom called. Target Room ID: "${targetRoomId}"`);

    // Guard: Tránh join lại room hiện tại
    if (this.room && this.room.sessionId && this.room.name === "game_room") {
      // Không có cách trực tiếp check roomId, nhưng có thể check qua sessionId
      console.log(
        `⚠️ Already connected to a room, checking if it's the target room...`
      );
    }

    console.log(
      `🎯 Current room status:`,
      this.room
        ? `Connected to ${this.room.name} (${this.room.sessionId})`
        : "No room"
    );

    // Rời khỏi phòng cũ nếu có
    if (this.room) {
      console.log(`🚪 Leaving current room before joining new one...`);
      await this.leaveCurrentRoom();
    }

    try {
      console.log(`🤝 Attempting to join room with custom ID: ${targetRoomId}`);

      // Sử dụng targetRoomId đã được xác định ở trên

      this.room = await this.client.joinOrCreate<GameRoomState>("game_room", {
        customRoomId: targetRoomId, // Vẫn dùng customRoomId
        quizId: quizId.toString(),
        roundNumber: roundNumber.toString(),
      });

      console.log(`✅ Joined room "${targetRoomId}" successfully!`);
      console.log(`🔍 Room details:`, this.room.name, this.room.sessionId);
      console.log(`🔍 Room state:`, this.room.state);
      console.log(`📡 About to emit network-connected event...`);

      // Emit ngay lập tức (cho trường hợp Scene đã sẵn sàng)
      EventBus.emit("network-connected", this.room);
      console.log(`📡 network-connected event emitted successfully`);

      // Lưu lại room để emit sau khi Scene sẵn sàng (backup)
      this.pendingRoom = this.room;
      console.log(`� Room saved as pending for scene-ready event`);
    } catch (e) {
      console.error("❌ Join error", e);
    }
  }

  public sendUpdate(data: {
    x: number;
    y: number;
    animState: string;
    flipX: boolean;
  }) {
    if (this.room) {
      this.room.send("playerUpdate", data);
    }
  }

  // Đổi tên hàm leave
  public async leaveCurrentRoom() {
    if (this.room) {
      console.log(
        `👋 Leaving room: ${this.room.name} (sessionId: ${this.room.sessionId})`
      );
      try {
        await this.room.leave();
        console.log("👋 Room left successfully.");
      } catch (e) {
        console.error("❌ Error leaving room:", e);
      }
      this.room = null;
    } else {
      console.log("👋 No room to leave");
    }
  }
}
