import { EventBus } from "../../EventBus";
import { SceneManager } from "./SceneManager";
import { SeedGenerator, SeededSceneSelector } from "../../utils/SeededRandom";
import { NetworkManager } from "./NetworkManager"; // Import NetworkManager

/**
 * 🎯 ROUND MANAGER - Quản lý 4 vòng quiz với scene selection
 *
 * LOGIC:
 * 1. Nhận quiz data từ React wrapper
 * 2. Chia thành 4 vòng (questions + time)
 * 3. Sử dụng SceneManager để random scene cho mỗi vòng
 * 4. Quản lý progression giữa các vòng
 */

interface RoundData {
  roundNumber: number;
  questions: any[];
  timeLimit: number; // Quiz time
  gameTimeLimit: number; // Game time
  sceneKey: string;
}

interface QuizData {
  quizId: number;
  userId: number | string;
  user?: {
    user_id?: number;
    fullName?: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
  }; // <-- CẬP NHẬT: Thêm đầy đủ thông tin user
  questions: any[];
  duration: number;
  quizInfo: any;
}

export class RoundManager {
  private static instance: RoundManager;
  private rounds: RoundData[] = [];
  private currentRound: number = 0;
  private totalScore: number = 0;
  private quizData: QuizData | null = null;
  private isInitialized: boolean = false;
  private scene: Phaser.Scene | null = null;
  private eventListenersSetup: boolean = false;
  private sceneSelector: SeededSceneSelector | null = null;
  private quizSeed: string = "";
  private isProcessingRound: boolean = false; // Guard để tránh duplicate round completion
  private networkManager: NetworkManager; // Thêm thuộc tính networkManager

  private constructor() {
    this.networkManager = NetworkManager.getInstance(); // Khởi tạo singleton
    // Event listeners sẽ được setup trong initialize()
  }

  public static getInstance(): RoundManager {
    if (!RoundManager.instance) {
      RoundManager.instance = new RoundManager();
    }
    return RoundManager.instance;
  }

  /**
   * 🎬 SET SCENE REFERENCE - Set reference đến scene để có thể start scenes
   *
   * @param scene - Scene reference (thường là PreloadScene)
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * 🚀 INITIALIZE - Khởi tạo với quiz data từ backend
   *
   * @param data - Quiz data chứa questions, duration, quizId, userId
   */
  public initialize(data: QuizData): void {
    console.log(`🚀 RoundManager.initialize called for quiz ${data.quizId}`);

    // Guard: Tránh duplicate initialization cho cùng 1 quiz
    if (this.isInitialized && this.quizData?.quizId === data.quizId) {
      console.log(
        `⚠️ RoundManager already initialized for quiz ${data.quizId}, skipping...`
      );
      return;
    }

    console.log(`🔄 RoundManager initializing for quiz ${data.quizId}...`);

    this.quizData = data;
    this.currentRound = 0;
    this.totalScore = 0;
    this.rounds = [];
    this.isInitialized = false;
    this.isProcessingRound = false; // Reset guard

    // Tạo seed từ danh sách câu hỏi
    this.quizSeed = SeedGenerator.createQuizSeed(data.questions);

    // Tạo scene selector với seed
    const sceneSeed = SeedGenerator.createSceneSeed(this.quizSeed);
    this.sceneSelector = new SeededSceneSelector(sceneSeed);

    // Setup event listeners chỉ 1 lần
    if (!this.eventListenersSetup) {
      this.setupEventListeners();
      this.eventListenersSetup = true;
    }

    this.createRounds();
    this.startFirstRound();
  }

  /**
   * 🎮 CREATE ROUNDS - Chia quiz thành 4 vòng với scene selection
   */
  private createRounds(): void {
    if (!this.quizData) return;

    const { questions, duration } = this.quizData;

    // Chia câu hỏi thành 4 vòng
    const questionsPerRound = Math.ceil(questions.length / 4);
    const gameTimePerRound = Math.floor((duration * 0.6) / 4); // 60% thời gian cho game, chia 4
    const quizTimePerRound = Math.floor((duration * 0.4) / 4); // 40% thời gian cho quiz, chia 4

    console.log(
      `🎮 Creating 4 rounds: ${questionsPerRound} questions/round, ${gameTimePerRound}s game time, ${quizTimePerRound}s quiz time`
    );

    // Sử dụng seeded scene selector để chọn scenes cho 4 vòng
    const selectedScenes = this.sceneSelector?.selectScenesForRounds(4) || [
      "ForestScene",
      "DesertScene",
      "ForestScene",
      "DesertScene",
    ];

    console.log(`🎲 Quiz seed: ${this.quizSeed.substring(0, 50)}...`);
    console.log(
      `🎮 Selected scenes for 4 rounds: ${selectedScenes.join(" → ")}`
    );
    console.log(
      `🔄 This sequence will be identical for all clients with same question set`
    );

    for (let i = 0; i < 4; i++) {
      const startIndex = i * questionsPerRound;
      const endIndex = Math.min(
        startIndex + questionsPerRound,
        questions.length
      );
      const roundQuestions = questions.slice(startIndex, endIndex);

      if (roundQuestions.length > 0) {
        // Sử dụng scene đã được chọn với seed
        const selectedScene = selectedScenes[i];

        this.rounds.push({
          roundNumber: i + 1,
          questions: roundQuestions,
          timeLimit: quizTimePerRound,
          gameTimeLimit: gameTimePerRound,
          sceneKey: selectedScene,
        });

        console.log(
          `🎲 Round ${i + 1}: ${selectedScene} (${
            roundQuestions.length
          } questions) [SEEDED]`
        );
      }
    }

    console.log(`✅ Created ${this.rounds.length} rounds successfully`);
    this.isInitialized = true;
  }

  /**
   * 🎬 START FIRST ROUND - Bắt đầu vòng đầu tiên
   */
  private startFirstRound(): void {
    if (this.rounds.length === 0) return;
    this.startRound(0);
  }

  /**
   * 🎮 START ROUND - Bắt đầu một vòng cụ thể
   */
  private async startRound(roundIndex: number): Promise<void> {
    // Thêm async
    if (roundIndex >= this.rounds.length) {
      this.showFinalResults();
      return;
    }

    const round = this.rounds[roundIndex];
    const previousRound = this.rounds[this.currentRound - 1]; // Previous round là round vừa hoàn thành

    // Log scene transition sử dụng SceneManager
    if (previousRound) {
      SceneManager.logSceneTransition(
        previousRound.sceneKey,
        round.sceneKey,
        `Round ${previousRound.roundNumber} → Round ${round.roundNumber}`
      );
    }

    // ===== LOGIC MỚI: THAM GIA PHÒNG CỦA VÒNG MỚI =====
    if (this.quizData) {
      // Ưu tiên fullName, sau đó name, cuối cùng fallback
      const username =
        this.quizData.user?.fullName ||
        this.quizData.user?.name ||
        this.quizData.user?.username ||
        "Guest";
      await this.networkManager.joinRoundRoom(
        this.quizData.quizId,
        round.roundNumber,
        username // <-- Truyền tên thực tế vào
      );
    }
    // =================================================

    EventBus.emit("round-started", round.roundNumber);

    if (this.scene) {
      console.log(`🎮 Starting scene: ${round.sceneKey}`);

      // Sử dụng scene.scene.start() truyền thống - an toàn hơn
      try {
        this.scene.scene.start(round.sceneKey, {
          roundData: {
            ...round,
            quizId: this.quizData?.quizId,
            userId: this.quizData?.userId,
          },
        });
      } catch (error) {
        console.error(`❌ Error starting scene ${round.sceneKey}:`, error);
        // Fallback: thử với scene manager
        if (this.scene.scene.manager) {
          this.scene.scene.manager.start(round.sceneKey, {
            roundData: {
              ...round,
              quizId: this.quizData?.quizId,
              userId: this.quizData?.userId,
            },
          });
        }
      }
    }
  }

  /**
   * 🧠 GET CURRENT ROUND QUIZ - Lấy quiz data của vòng hiện tại
   */
  public getCurrentRoundQuiz(): any {
    const round = this.rounds[this.currentRound];
    if (!round || !this.quizData) return null;

    return {
      roundNumber: round.roundNumber,
      questions: round.questions,
      timeLimit: round.timeLimit,
      quizId: this.quizData.quizId,
      userId: this.quizData.userId,
    };
  }

  /**
   * ✅ COMPLETE ROUND - Hoàn thành vòng hiện tại và chuyển vòng tiếp theo
   *
   * @param score - Điểm số đạt được trong vòng này
   */
  public completeRound(score: number): void {
    // Guard: Tránh duplicate round completion
    if (this.isProcessingRound) {
      console.warn(
        `⚠️ Round completion already in progress, ignoring duplicate call`
      );
      return;
    }

    const round = this.rounds[this.currentRound];

    // Guard: Kiểm tra round có hợp lệ không
    if (!round) {
      console.warn(`⚠️ Invalid round index: ${this.currentRound}`);
      return;
    }

    this.isProcessingRound = true;

    const oldTotalScore = this.totalScore;
    this.totalScore += score;

    console.log(
      `📊 Round ${round.roundNumber} complete: +${score} score, total: ${oldTotalScore} → ${this.totalScore}`
    );

    // Mark round hiện tại là completed
    this.currentRound++;

    // Chuyển vòng tiếp theo sau 1 giây
    setTimeout(() => {
      this.isProcessingRound = false; // Reset guard
      this.startRound(this.currentRound);
    }, 1000);
  }

  /**
   * 📊 SHOW FINAL RESULTS - Hiển thị kết quả cuối
   */
  private showFinalResults(): void {
    if (!this.quizData) return;

    const totalQuestions = this.rounds.reduce(
      (sum, round) => sum + round.questions.length,
      0
    );
    const percentage = Math.round((this.totalScore / totalQuestions) * 100);

    console.log(
      `🏁 Final calculation: ${this.totalScore}/${totalQuestions} = ${percentage}%`
    );

    const results = {
      quizId: this.quizData.quizId,
      userId: this.quizData.userId,
      totalScore: this.totalScore,
      totalQuestions: totalQuestions,
      percentage: percentage,
      rounds: this.rounds.map((round) => ({
        roundNumber: round.roundNumber,
        totalQuestions: round.questions.length,
        completed: true, // Tất cả rounds đều completed khi đến showFinalResults
      })),
    };

    // Emit event để hiển thị kết quả
    EventBus.emit("quiz-completed", results);
  }

  /**
   * 📊 GET STATUS - Lấy trạng thái hiện tại
   */
  public getStatus(): any {
    return {
      currentRound: this.currentRound + 1,
      totalRounds: this.rounds.length,
      totalScore: this.totalScore,
      isCompleted: this.currentRound >= this.rounds.length,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * 🎧 SETUP EVENT LISTENERS
   */
  private setupEventListeners(): void {
    console.log("🎧 Setting up RoundManager event listeners");

    // Lắng nghe khi round quiz hoàn thành
    EventBus.on("round-quiz-completed", (data: { score: number }) => {
      console.log(
        `🎯 Received round-quiz-completed event: score=${data.score}, currentRound=${this.currentRound}`
      );
      this.completeRound(data.score);
    });

    // Lắng nghe request current round quiz
    EventBus.on("request-current-round-quiz", () => {
      const quizData = this.getCurrentRoundQuiz();
      if (quizData) {
        EventBus.emit("current-round-quiz-data", quizData);
      }
    });

    // Lắng nghe manual quiz trigger từ MinigameCore
    EventBus.on(
      "manual-quiz-trigger",
      async (data: { finalScore: number; reason: string }) => {
        // Thêm async
        console.log(
          `🧠 RoundManager: Manual quiz trigger received (score: ${data.finalScore}, reason: ${data.reason})`
        );

        // ===== LOGIC MỚI: RỜI KHỎI PHÒNG HIỆN TẠI KHI QUIZ BẮT ĐẦU =====
        await this.networkManager.leaveCurrentRoom();
        // ==============================================================

        const round = this.rounds[this.currentRound];
        if (round && this.scene) {
          // Lấy scene hiện tại đang chạy
          const currentScene = this.scene.scene.manager.getScene(
            round.sceneKey
          ) as any;

          if (currentScene && currentScene.scene.isActive()) {
            console.log(`🛑 Stopping current scene: ${round.sceneKey}`);

            // Cleanup timer của scene hiện tại trước khi stop
            if (
              currentScene.cleanupTimer &&
              typeof currentScene.cleanupTimer === "function"
            ) {
              currentScene.cleanupTimer();
            }

            // Stop scene hiện tại
            currentScene.scene.stop();
          }

          // Emit event để React hiển thị quiz overlay
          console.log(
            `🧠 Emitting show-quiz-overlay event for round ${round.roundNumber}`
          );
          EventBus.emit("show-quiz-overlay", {
            roundNumber: round.roundNumber, // Giữ nguyên 1-based index
            questions: round.questions,
            timeLimit: round.timeLimit,
            quizId: this.quizData?.quizId,
            userId: this.quizData?.userId,
            finalScore: data.finalScore,
          });
        }
      }
    );
  }

  /**
   * 🧹 RESET - Reset manager
   */
  public reset(): void {
    this.rounds = [];
    this.currentRound = 0;
    this.totalScore = 0;
    this.quizData = null;
    this.isInitialized = false;
    this.isProcessingRound = false; // Reset guard
  }
}
