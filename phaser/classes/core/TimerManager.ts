import { Scene } from "phaser";
import { EventBus } from "../../EventBus";
import { TIMER_CONFIG } from "../../config/constants";

/**
 * ⏰ TIMER MANAGER - Quản lý thời gian cho game và quiz
 *
 * CHỨC NĂNG:
 * - Countdown timer với callback khi hết thời gian
 * - Warning callback khi sắp hết thời gian
 * - Pause/Resume timer
 * - Format thời gian hiển thị
 * - Auto cleanup khi destroy
 */
export class TimerManager {
  private scene: Scene;
  private timerEvent?: Phaser.Time.TimerEvent;
  private warningEvent?: Phaser.Time.TimerEvent;

  // Callbacks
  private onTimeUp?: () => void;
  private onWarning?: (timeLeft: number) => void;
  private onTick?: (timeLeft: number) => void;

  // State
  private totalTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupEventListeners();
  }

  /**
   * 🎧 SETUP EVENT LISTENERS
   */
  private setupEventListeners(): void {
    // Lắng nghe pause timer từ MinigameCore
    EventBus.on("pause-game-timer", () => {
      console.log("🎧 TimerManager: Received pause-game-timer event");
      this.pauseTimer();
    });
  }

  /**
   * 🚀 START TIMER - Bắt đầu countdown với config
   *
   * @param config - Cấu hình timer
   */
  public startTimer(config: {
    duration: number; // Thời gian total (giây)
    onTimeUp?: () => void; // Callback khi hết thời gian
    onWarning?: (timeLeft: number) => void; // Callback cảnh báo
    onTick?: (timeLeft: number) => void; // Callback mỗi giây
    warningTime?: number; // Thời gian bắt đầu cảnh báo (giây)
  }): void {
    // Cleanup timer cũ nếu có
    this.stopTimer();

    this.totalTime = config.duration;
    this.onTimeUp = config.onTimeUp;
    this.onWarning = config.onWarning;
    this.onTick = config.onTick;

    const warningTime = config.warningTime || TIMER_CONFIG.WARNING_TIME;

    // Tạo main timer event (chuyển giây sang milliseconds cho Phaser)
    this.timerEvent = this.scene.time.addEvent({
      delay: config.duration * 1000,
      callback: () => {
        this.isRunning = false;
        this.onTimeUp?.();
      },
      callbackScope: this,
    });

    // Tạo warning timer nếu cần
    if (config.onWarning && config.duration > warningTime) {
      this.warningEvent = this.scene.time.addEvent({
        delay: (config.duration - warningTime) * 1000,
        callback: () => {
          this.onWarning?.(warningTime);
        },
        callbackScope: this,
      });
    }

    // Tick timer mỗi giây nếu có callback
    if (config.onTick) {
      this.scene.time.addEvent({
        delay: 1000,
        repeat: config.duration - 1,
        callback: () => {
          if (this.isRunning && !this.isPaused) {
            const timeLeft = this.getTimeLeft();
            this.onTick?.(timeLeft);
          }
        },
        callbackScope: this,
      });
    }

    this.isRunning = true;
    this.isPaused = false;

    console.log(`⏰ Timer started: ${this.formatTime(config.duration)}`);
  }
  /**
   * ⏸️ PAUSE TIMER - Tạm dừng timer
   */
  public pauseTimer(): void {
    if (this.timerEvent && this.isRunning) {
      this.timerEvent.paused = true;
      if (this.warningEvent) {
        this.warningEvent.paused = true;
      }
      this.isPaused = true;
      console.log("⏸️ Timer paused");
    }
  }

  /**
   * ▶️ RESUME TIMER - Tiếp tục timer
   */
  public resumeTimer(): void {
    if (this.timerEvent && this.isRunning && this.isPaused) {
      this.timerEvent.paused = false;
      if (this.warningEvent) {
        this.warningEvent.paused = false;
      }
      this.isPaused = false;
      console.log("▶️ Timer resumed");
    }
  }

  /**
   * ⏹️ STOP TIMER - Dừng và cleanup timer
   */
  public stopTimer(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }

    if (this.warningEvent) {
      this.warningEvent.destroy();
      this.warningEvent = undefined;
    }

    this.isRunning = false;
    this.isPaused = false;

    console.log("⏹️ Timer stopped");
  }

  /**
   * 📊 GET TIME LEFT - Lấy thời gian còn lại (giây)
   */
  public getTimeLeft(): number {
    if (!this.timerEvent || !this.isRunning) {
      return 0;
    }

    return Math.max(0, Math.ceil(this.timerEvent.getRemaining() / 1000));
  }
  /**
   * 📊 GET PROGRESS - Lấy % tiến độ (0-100)
   */
  public getProgress(): number {
    if (!this.isRunning || this.totalTime === 0) {
      return 0;
    }

    const timeLeft = this.getTimeLeft();
    const elapsed = this.totalTime - timeLeft;
    return Math.min(100, (elapsed / this.totalTime) * 100);
  }

  /**
   * 🔢 FORMAT TIME - Format thời gian thành MM:SS
   *
   * @param timeSeconds - Thời gian tính bằng giây
   * @returns Chuỗi định dạng MM:SS
   */
  public formatTime(timeSeconds: number): string {
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = timeSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  /**
   * ❓ IS RUNNING - Kiểm tra timer có đang chạy không
   */
  public isTimerRunning(): boolean {
    return this.isRunning && !this.isPaused;
  }

  /**
   * ⚠️ IS WARNING - Kiểm tra có đang trong thời gian cảnh báo không
   */
  public isInWarningTime(): boolean {
    const timeLeft = this.getTimeLeft();
    return timeLeft > 0 && timeLeft <= TIMER_CONFIG.WARNING_TIME;
  }

  /**
   * 🗑️ DESTROY - Cleanup khi destroy scene
   */
  public destroy(): void {
    this.stopTimer();

    // Remove event listeners
    EventBus.removeListener("pause-game-timer");

    this.onTimeUp = undefined;
    this.onWarning = undefined;
    this.onTick = undefined;

    console.log("🗑️ TimerManager destroyed");
  }
}
