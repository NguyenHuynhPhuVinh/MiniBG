 
import { io, Socket } from "socket.io-client";

type EventCallback = (...args: unknown[]) => void;

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Map<string, EventCallback>> = new Map();

  private constructor() {
    // Private constructor để đảm bảo singleton
  }

  // Singleton pattern
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Khởi tạo kết nối socket
  public connect(): Socket {
    if (this.socket) return this.socket;

    const socketUrl =
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8888";
    console.log(`Kết nối tới socket server: ${socketUrl}`);

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  // Thiết lập các listener mặc định
  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket đã kết nối thành công!");
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log(`Socket đã ngắt kết nối. Lý do: ${reason}`);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("Lỗi kết nối socket:", error.message);
      this.isConnected = false;
    });
  }

  // Thêm listener cho một event
  public on<T>(
    event: string,
    listenerId: string,
    callback: (data: T) => void
  ): void {
    if (!this.socket) {
      this.connect();
    }

    // Tạo map cho event nếu chưa có
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Map());
    }

    // Lưu callback với ID
    const eventListeners = this.listeners.get(event)!;
    eventListeners.set(listenerId, callback as EventCallback);

    // Đăng ký listener với socket
    if (this.socket) {
      this.socket.on(event, callback as EventCallback);
    }
  }

  // Xóa listener cho một event dựa vào ID
  public off(event: string, listenerId: string): void {
    if (!this.socket || !this.listeners.has(event)) return;

    const eventListeners = this.listeners.get(event)!;
    if (eventListeners.has(listenerId)) {
      const callback = eventListeners.get(listenerId);
      if (callback && this.socket) {
        this.socket.off(event, callback);
      }
      eventListeners.delete(listenerId);
    }
  }

  // Gửi một event
  public emit(event: string, data: unknown): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit(event, data);
  }

  // Tham gia phòng
  public joinRoom(room: string): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit("joinRoom", room);
  }

  // Rời phòng
  public leaveRoom(room: string): void {
    if (!this.socket) return;
    console.log(`Rời phòng: ${room}`);
    this.socket?.emit("leaveRoom", room);
  }

  // Kiểm tra trạng thái kết nối
  public isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Ngắt kết nối
  public disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.isConnected = false;
    this.listeners.clear();
  }
}

export default SocketService.getInstance();
