import { Schema, MapSchema, type as colyseusType } from "@colyseus/schema";

// Workaround: TypeScript sometimes can't resolve the decorator signature from
// the imported symbol. Cast to `any` and use the alias below to silence
// the type-checker while keeping runtime behavior.
const colyseusTypeAny: any = colyseusType;

// File này là bản sao của Schema trên server
export class Player extends Schema {
  @colyseusTypeAny("number") x: number = 0;
  @colyseusTypeAny("number") y: number = 0;
  @colyseusTypeAny("string") animState: string = "idle";
  @colyseusTypeAny("boolean") flipX: boolean = false;
  @colyseusTypeAny("string") username: string = "Player"; // <-- THÊM MỚI

  // <-- THÊM CÁC TRƯỜNG MỚI (PHẢI GIỐNG HỆT SERVER) -->
  @colyseusTypeAny("boolean") isGrabbed: boolean = false;
  @colyseusTypeAny("string") grabbedBy: string = "";
  @colyseusTypeAny("string") isGrabbing: string = "";
  @colyseusTypeAny("number") escapeProgress: number = 0;
  @colyseusTypeAny("string") interactionState: string = "none"; // "none" | "grab" | "carry"
}

// THÊM MỚI: Schema để định nghĩa trạng thái của một block có thể biến mất
export class DisappearingBlock extends Schema {
  @colyseusTypeAny("number") x: number = 0; // Tọa độ tile X
  @colyseusTypeAny("number") y: number = 0; // Tọa độ tile Y

  // Trạng thái của block:
  // 'idle': Bình thường, có thể va chạm.
  // 'triggered': Bị người chơi chạm, đang chuẩn bị biến mất (dùng để client chạy hiệu ứng rung).
  // 'gone': Đã biến mất, không thể va chạm.
  @colyseusTypeAny("string") state: string = "idle";
}

// THÊM MỚI: Schema để định nghĩa trạng thái của một lò xo
export class Spring extends Schema {
  @colyseusTypeAny("number") x: number = 0; // Tọa độ tile X
  @colyseusTypeAny("number") y: number = 0; // Tọa độ tile Y
  // Trạng thái: 'idle' (bị nén) hoặc 'extended' (bung ra)
  @colyseusTypeAny("string") state: string = "idle";
}

// THÊM MỚI: Schema định nghĩa trạng thái của một quả bom
export class Bomb extends Schema {
  @colyseusTypeAny("number") x: number = 0;
  @colyseusTypeAny("number") y: number = 0;
  @colyseusTypeAny("number") velocityX: number = 0;
  @colyseusTypeAny("number") velocityY: number = 0;
  @colyseusTypeAny("string") state: string = "ticking"; // 'ticking' | 'exploding'
}

// THÊM MỚI: Schema định nghĩa trạng thái của Enemy cho Server-Authoritative AI
export class Enemy extends Schema {
  @colyseusTypeAny("string") enemyType: string = "BLUE_FISH"; // Loại enemy để client biết dùng sprite nào
  @colyseusTypeAny("number") x: number = 0;
  @colyseusTypeAny("number") y: number = 0;
  @colyseusTypeAny("number") velocityX: number = 0; // Vận tốc X để client nội suy
  @colyseusTypeAny("number") velocityY: number = 0; // Vận tốc Y để client nội suy
  @colyseusTypeAny("string") animState: string = "swim"; // Trạng thái animation (ví dụ: 'swim', 'sleep')
  @colyseusTypeAny("boolean") flipX: boolean = false;
  @colyseusTypeAny("boolean") isActive: boolean = true; // Enemy có đang hoạt động không
}

// THÊM MỚI: Schema cho bẫy gai tức thì (instant spike trap)
export class InstantSpikeTrap extends Schema {
  @colyseusTypeAny("string") state: string = "idle"; // "idle" (vô hình), "active" (hiện gai)
  @colyseusTypeAny("number") x: number = 0;
  @colyseusTypeAny("number") y: number = 0;
}

// THÊM MỚI: Schema định nghĩa trạng thái của một vật thể vật lý chung (bản sao)
export class PhysicsObject extends Schema {
  @colyseusTypeAny("string") assetKey: string = ""; // Quan trọng: Để client biết dùng ảnh nào
  @colyseusTypeAny("number") x: number = 0;
  @colyseusTypeAny("number") y: number = 0;
  @colyseusTypeAny("number") angle: number = 0;
  @colyseusTypeAny("number") velocityX: number = 0;
  @colyseusTypeAny("number") velocityY: number = 0;

  // === THÊM TRƯỜNG ĐIỀU KHIỂN QUYỀN HẠN (GIỐNG SERVER) ===
  @colyseusTypeAny("string") lastUpdatedBy: string = ""; // SessionId của client đang điều khiển

  // === THÊM CÁC DÒNG MỚI DƯỚI ĐÂY (PHẢI GIỐNG HẾT SERVER) ===
  @colyseusTypeAny("string") shape?: string;
  @colyseusTypeAny("number") bounce?: number;
  @colyseusTypeAny("number") friction?: number;
  @colyseusTypeAny("number") density?: number;
  @colyseusTypeAny("number") width?: number;
  @colyseusTypeAny("number") height?: number;
  @colyseusTypeAny("number") radius?: number;

  // === THÊM CẤU HÌNH OFFSET CHO HITBOX (GIỐNG SERVER) ===
  @colyseusTypeAny("number") offsetX?: number;
  @colyseusTypeAny("number") offsetY?: number;
  // ========================================================
}

export class GameRoomState extends Schema {
  @colyseusTypeAny({ map: Player }) players = new MapSchema<Player>();

  // THÊM MỚI: Một Map để lưu trạng thái của tất cả các block biến mất trong phòng.
  // Key của map sẽ là ID duy nhất của block (ví dụ: "10_15").
  @colyseusTypeAny({ map: DisappearingBlock }) disappearingBlocks =
    new MapSchema<DisappearingBlock>();

  // THÊM MỚI: Map để lưu trạng thái của tất cả các lò xo
  @colyseusTypeAny({ map: Spring }) springs = new MapSchema<Spring>();

  // ======================== THÊM CÁC DÒNG MỚI DƯỚI ĐÂY ========================
  // Hệ số hướng gió: 1.0 = trái, -1.0 = phải, 0.0 = không gió
  @colyseusTypeAny("number") windDirectionMultiplier: number = 1.0;

  // Thời điểm (timestamp của server) mà gió sẽ đổi hướng tiếp theo
  @colyseusTypeAny("number") nextWindChangeTime: number = 0;
  // =========================================================================

  // THÊM MỚI: Map để đồng bộ trạng thái bom
  @colyseusTypeAny({ map: Bomb }) bombs = new MapSchema<Bomb>();

  // THÊM MỚI: Map để lưu trạng thái của tất cả các Enemy trong phòng (Server-Authoritative AI)
  // Key của map sẽ là ID duy nhất của enemy (ví dụ: "enemy_1").
  @colyseusTypeAny({ map: Enemy }) enemies = new MapSchema<Enemy>();

  // THÊM MỚI: Map để đồng bộ trạng thái của tất cả các bẫy gai tức thì
  @colyseusTypeAny({ map: InstantSpikeTrap }) instantSpikeTraps =
    new MapSchema<InstantSpikeTrap>();

  // THÊM MỚI: Map để đồng bộ trạng thái của tất cả các vật thể vật lý
  @colyseusTypeAny({ map: PhysicsObject }) physicsObjects =
    new MapSchema<PhysicsObject>();
}
