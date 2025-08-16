import { EventBus } from "../../EventBus";

/**
 * 🎮 MINIGAME CORE - Core đơn giản quản lý điểm chung và trigger quiz
 *
 * CHỨC NĂNG:
 * - Quản lý điểm số chung cho toàn bộ round
 * - Trigger quiz khi cần thiết
 * - API đơn giản cho các scene gọi
 * - Tự động trigger quiz khi hết thời gian
 */

export class MinigameCore {
  private static instance: MinigameCore;
  private currentScore: number = 0;
  private isGameActive: boolean = true;
  private isQuizTriggered: boolean = false;

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): MinigameCore {
    if (!MinigameCore.instance) {
      MinigameCore.instance = new MinigameCore();
    }
    return MinigameCore.instance;
  }

  /**
   * 🎧 SETUP EVENT LISTENERS
   */
  private setupEventListeners(): void {
    // Lắng nghe game timer timeout - tự động trigger quiz
    EventBus.on("game-timer-update", (data: any) => {
      if (data.timeLeft <= 0 && this.isGameActive && !this.isQuizTriggered) {
        console.log(
          "⏰ MinigameCore: Game timer timeout, auto triggering quiz..."
        );
        this.triggerQuiz(); // Sẽ gọi qua RoundManager để stop scene đúng cách
      }
    });
  }

  // === API ĐƠN GIẢN CHO SCENES ===

  /**
   * ➕ ADD SCORE - Cộng điểm (gọi từ scene)
   */
  public addScore(amount: number): number {
    if (!this.isGameActive) return this.currentScore;

    const oldScore = this.currentScore;
    this.currentScore += amount;

    console.log(`➕ Score: ${oldScore} → ${this.currentScore} (+${amount})`);

    // Emit event để UI cập nhật
    EventBus.emit("minigame-score-updated", {
      oldScore,
      newScore: this.currentScore,
      change: amount,
    });

    return this.currentScore;
  }

  /**
   * ➖ SUBTRACT SCORE - Trừ điểm (gọi từ scene)
   */
  public subtractScore(amount: number): number {
    if (!this.isGameActive) return this.currentScore;

    const oldScore = this.currentScore;
    this.currentScore = Math.max(0, this.currentScore - amount); // Không cho điểm âm

    console.log(`➖ Score: ${oldScore} → ${this.currentScore} (-${amount})`);

    // Emit event để UI cập nhật
    EventBus.emit("minigame-score-updated", {
      oldScore,
      newScore: this.currentScore,
      change: -amount,
    });

    return this.currentScore;
  }

  /**
   * 📊 GET CURRENT SCORE - Lấy điểm hiện tại
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * 🧠 TRIGGER QUIZ - Gọi từ scene để mở quiz (gọi từ scene)
   */
  public triggerQuiz(): void {
    if (this.isQuizTriggered || !this.isGameActive) {
      console.log("⚠️ Quiz already triggered or game inactive");
      return;
    }

    console.log(
      `🧠 MinigameCore: Triggering quiz with score: ${this.currentScore}`
    );

    this.isQuizTriggered = true;
    this.isGameActive = false;

    // Pause game timer trước khi trigger quiz
    EventBus.emit("pause-game-timer");

    // Emit event để RoundManager handle việc stop scene và start quiz
    EventBus.emit("manual-quiz-trigger", {
      finalScore: this.currentScore,
      reason: "manual_trigger",
    });
  }

  // === UTILITY METHODS ===

  /**
   * ❓ IS GAME ACTIVE - Kiểm tra game có đang active không
   */
  public isActive(): boolean {
    return this.isGameActive;
  }

  /**
   * 🔄 RESET FOR NEW ROUND - Reset cho round mới (GIỮ NGUYÊN ĐIỂM TỔNG)
   */
  public resetForNewRound(): void {
    // KHÔNG reset currentScore - giữ nguyên điểm tích lũy qua các vòng
    this.isQuizTriggered = false;
    this.isGameActive = true;

    console.log(
      `🔄 MinigameCore reset for new round - keeping score: ${this.currentScore}`
    );

    // Emit event để UI cập nhật (không thay đổi score)
    EventBus.emit("minigame-score-updated", {
      oldScore: this.currentScore,
      newScore: this.currentScore,
      change: 0,
    });
  }

  /**
   * 🔄 RESET COMPLETELY - Reset hoàn toàn (chỉ dùng khi bắt đầu game mới)
   */
  public resetCompletely(): void {
    this.currentScore = 0;
    this.isQuizTriggered = false;
    this.isGameActive = true;

    console.log("🔄 MinigameCore reset completely");

    // Emit event để UI reset về 0
    EventBus.emit("minigame-score-updated", {
      oldScore: this.currentScore,
      newScore: 0,
      change: 0,
    });
  }

  /**
   * 🗑️ CLEANUP - Cleanup event listeners
   */
  public cleanup(): void {
    EventBus.removeListener("game-timer-update");
    console.log("🗑️ MinigameCore cleanup");
  }
}
