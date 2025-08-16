import { Scene } from "phaser";
import { EventBus } from "../EventBus";

/**
 * 🎮 BASE GAME SCENE - Cấp 1: Nền tảng chung nhất
 *
 * Đây là lớp cơ sở cho TẤT CẢ các minigame, bất kể lối chơi.
 * Lớp này chỉ chứa những gì mà mọi minigame đều phải có:
 * - Nhận roundData từ RoundManager
 * - Giao tiếp cơ bản với React qua EventBus
 * - Định nghĩa lifecycle hooks cho các lớp con
 *
 * KIẾN TRÚC:
 * - Rất "mỏng" - chỉ chứa logic siêu chung
 * - Abstract class - không thể khởi tạo trực tiếp
 * - Template Method pattern - định nghĩa skeleton cho subclasses
 */
export abstract class BaseGameScene extends Scene {
  // === ROUND STATE ===
  protected roundData: any = null;

  /**
   * 🎬 CREATE - Lifecycle hook chung cho tất cả minigame
   *
   * LUỒNG CHUNG:
   * 1. Load round data từ scene params
   * 2. Gọi các template methods để subclass implement
   * 3. Thông báo scene ready cho React
   */
  create(data?: any): void {
    console.log(`🎮 ${this.constructor.name} create called with data:`, data);

    // 1. Load round data - logic chung cho tất cả minigame
    this.loadRoundData(data);

    // 2. Template methods - để subclass implement
    this.preInitialize(); // Hook trước khi khởi tạo
    this.initializeScene(); // Khởi tạo scene chính
    this.postInitialize(); // Hook sau khi khởi tạo

    // 3. Thông báo scene ready - logic chung
    this.notifySceneReady();
  }

  /**
   * 📥 LOAD ROUND DATA - Load dữ liệu round từ scene params
   *
   * Logic chung cho tất cả minigame:
   * - Nhận roundData từ RoundManager
   * - Store để các subclass sử dụng
   */
  protected loadRoundData(data?: any): void {
    this.roundData = data?.roundData || null;
    console.log(`📊 Round data loaded:`, this.roundData);
  }

  /**
   * 📢 NOTIFY SCENE READY - Thông báo cho React component
   *
   * Logic chung: Emit event để React component biết scene đã sẵn sàng
   */
  protected notifySceneReady(): void {
    EventBus.emit("current-scene-ready", this);
    console.log(`✅ ${this.constructor.name} ready for interaction`);
  }

  // === TEMPLATE METHODS - Để subclass implement ===

  /**
   * 🔄 PRE INITIALIZE - Hook trước khi khởi tạo scene
   * Override để thêm logic trước khi scene setup
   */
  protected preInitialize(): void {
    // Default implementation: do nothing
    // Subclass có thể override để thêm logic
  }

  /**
   * 🎬 INITIALIZE SCENE - Abstract method bắt buộc implement
   * Mỗi loại minigame sẽ có cách khởi tạo khác nhau
   */
  protected abstract initializeScene(): void;

  /**
   * 🔄 POST INITIALIZE - Hook sau khi khởi tạo scene
   * Override để thêm logic sau khi scene setup xong
   */
  protected postInitialize(): void {
    // Default implementation: do nothing
    // Subclass có thể override để thêm logic
  }

  // === UTILITY METHODS - Có thể sử dụng bởi subclass ===

  /**
   * 📊 GET ROUND DATA - Getter cho round data
   * @returns Round data object hoặc null
   */
  protected getRoundData(): any {
    return this.roundData;
  }

  /**
   * 🎯 GET SCENE KEY - Getter cho scene key
   * @returns Scene key string
   */
  public getSceneKey(): string {
    return this.scene.key;
  }

  // === LIFECYCLE HOOKS - Có thể override bởi subclass ===

  /**
   * 🗑️ CLEANUP ON SHUTDOWN - Hook dọn dẹp khi scene bị destroy
   * Override để thêm cleanup logic specific cho từng loại game
   */
  protected cleanupOnShutdown(): void {
    // Default implementation: do nothing
    console.log(`🗑️ ${this.constructor.name} cleanup`);
  }

  /**
   * ⏸️ ON PAUSE - Hook khi scene bị pause
   * Override để xử lý pause logic
   */
  protected onPause(): void {
    // Default implementation: do nothing
    console.log(`⏸️ ${this.constructor.name} paused`);
  }

  /**
   * ▶️ ON RESUME - Hook khi scene được resume
   * Override để xử lý resume logic
   */
  protected onResume(): void {
    // Default implementation: do nothing
    console.log(`▶️ ${this.constructor.name} resumed`);
  }

  /**
   * 🔄 SHUTDOWN - Scene lifecycle - gọi cleanup hooks
   */
  shutdown(): void {
    this.cleanupOnShutdown();
  }
}
