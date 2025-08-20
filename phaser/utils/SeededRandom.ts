/**
 * 🎲 SEEDED RANDOM - Utility để tạo random có thể reproduce với seed
 *
 * CHỨC NĂNG:
 * - Tạo seed từ danh sách ID câu hỏi
 * - Random với seed để đảm bảo kết quả giống nhau trên mọi client
 * - Hỗ trợ random number, boolean, array shuffle
 */

export class SeededRandom {
  private seed: number;
  private originalSeed: number;

  constructor(seed: number | string) {
    // Chuyển string thành number nếu cần
    if (typeof seed === "string") {
      this.seed = this.stringToSeed(seed);
    } else {
      this.seed = seed;
    }
    this.originalSeed = this.seed;
  }

  /**
   * 🔢 STRING TO SEED - Chuyển string thành seed number
   */
  private stringToSeed(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash);
  }

  /**
   * 🎲 NEXT - Tạo số random tiếp theo (0-1)
   * Sử dụng Linear Congruential Generator (LCG)
   */
  private next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  /**
   * 🎯 RANDOM - Tạo số random trong khoảng [0, 1)
   */
  public random(): number {
    return this.next();
  }

  /**
   * 🎯 RANDOM INT - Tạo số nguyên random trong khoảng [min, max)
   */
  public randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min)) + min;
  }

  /**
   * 🎯 RANDOM BOOLEAN - Tạo boolean random
   */
  public randomBoolean(): boolean {
    return this.random() < 0.5;
  }

  /**
   * 🎯 RANDOM CHOICE - Chọn random một phần tử từ array
   */
  public randomChoice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot choose from empty array");
    }
    const index = this.randomInt(0, array.length);
    return array[index];
  }

  /**
   * 🔀 SHUFFLE - Xáo trộn array với Fisher-Yates algorithm
   */
  public shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /**
   * 🔄 RESET - Reset seed về giá trị ban đầu
   */
  public reset(): void {
    this.seed = this.originalSeed;
  }

  /**
   * 📊 GET SEED - Lấy seed hiện tại
   */
  public getSeed(): number {
    return this.originalSeed;
  }
}

/**
 * 🏭 SEED GENERATOR - Utility để tạo seed từ quiz data
 */
export class SeedGenerator {
  /**
   * 🎯 CREATE QUIZ SEED - Tạo seed từ danh sách câu hỏi
   */
  public static createQuizSeed(questions: any[]): string {
    if (!questions || questions.length === 0) {
      console.warn(
        "⚠️ No questions provided for seed generation, using default"
      );
      return "default-seed";
    }

    // Ghép ID của tất cả câu hỏi thành chuỗi
    const questionIds = questions
      .map((q) => q.id || q.question_id || "unknown")
      .sort() // Sort để đảm bảo thứ tự nhất quán
      .join("-");

    console.log(
      `🎲 Generated quiz seed from ${
        questions.length
      } questions: ${questionIds.substring(0, 50)}...`
    );
    return questionIds;
  }

  /**
   * 🎯 CREATE ROUND SEED - Tạo seed cho từng round
   */
  public static createRoundSeed(quizSeed: string, roundNumber: number): string {
    const roundSeed = `${quizSeed}-round-${roundNumber}`;
    console.log(
      `🎲 Generated round ${roundNumber} seed: ${roundSeed.substring(0, 50)}...`
    );
    return roundSeed;
  }

  /**
   * 🎯 CREATE SCENE SEED - Tạo seed cho scene selection
   */
  public static createSceneSeed(quizSeed: string): string {
    const sceneSeed = `${quizSeed}-scenes`;
    console.log(`🎲 Generated scene seed: ${sceneSeed.substring(0, 50)}...`);
    return sceneSeed;
  }
}

/**
 * 🎮 SEEDED SCENE SELECTOR - Chọn scene với seed
 */
export class SeededSceneSelector {
  private random: SeededRandom;
  private availableScenes: string[];

  constructor(
    seed: string,
    availableScenes: string[] = ["OriginValleyScene", "TempestPeakScene"]
  ) {
    this.random = new SeededRandom(seed);
    this.availableScenes = availableScenes;

    console.log(
      `🎮 SeededSceneSelector initialized with seed: ${seed.substring(
        0,
        30
      )}...`
    );
    console.log(`🎮 Available scenes: ${availableScenes.join(", ")}`);
  }

  /**
   * 🎯 SELECT SCENES FOR ROUNDS - Chọn scene cho từng round
   */
  public selectScenesForRounds(numberOfRounds: number): string[] {
    const selectedScenes: string[] = [];

    for (let i = 0; i < numberOfRounds; i++) {
      const scene = this.random.randomChoice(this.availableScenes);
      selectedScenes.push(scene);

      console.log(`🎯 Round ${i + 1}: Selected scene ${scene}`);
    }

    return selectedScenes;
  }

  /**
   * 🔀 SHUFFLE SCENES - Xáo trộn scenes với seed
   */
  public shuffleScenes(scenes: string[]): string[] {
    const shuffled = this.random.shuffle(scenes);
    console.log(`🔀 Shuffled scenes: ${shuffled.join(" → ")}`);
    return shuffled;
  }

  /**
   * 🎲 GET RANDOM SCENE - Lấy một scene random
   */
  public getRandomScene(): string {
    const scene = this.random.randomChoice(this.availableScenes);
    console.log(`🎲 Random scene selected: ${scene}`);
    return scene;
  }

  /**
   * 🔄 RESET - Reset random generator
   */
  public reset(): void {
    this.random.reset();
    console.log("🔄 SeededSceneSelector reset");
  }
}

export default SeededRandom;
