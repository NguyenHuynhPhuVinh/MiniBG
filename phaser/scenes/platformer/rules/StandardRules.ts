// phaser/scenes/platformer/rules/StandardRules.ts
import { IPlatformerRules } from "./IPlatformerRules";
import { MinigameCore } from "../../../classes";
import { BasePlatformerScene } from "../BasePlatformerScene";

/**
 * Bộ quy tắc tiêu chuẩn, được sử dụng bởi hầu hết các màn chơi.
 * - Xu: +10 điểm.
 * - Về đích: +50 điểm và kích hoạt quiz.
 */
export class StandardRules implements IPlatformerRules {
  private minigameCore!: MinigameCore;
  private scene!: BasePlatformerScene;
  private startTime: number = 0;

  initialize(scene: BasePlatformerScene, minigameCore: MinigameCore): void {
    this.scene = scene;
    this.minigameCore = minigameCore;
    // Start the time trial when rules are initialized
    this.startTime = scene.time.now;
    console.log(
      `🎯 StandardRules: Time trial started at ${this.startTime} for ${scene.scene.key}`
    );
  }

  handleCollectible(
    tile: Phaser.Tilemaps.Tile,
    scene: BasePlatformerScene
  ): void {
    if (tile.properties?.name === "xu" || tile.properties?.type === "coin") {
      // Coins are decorative in time-trial mode. Keep sound/FX only.
      scene.sound.play("coin");
      console.log(`💰 StandardRules: Collected coin (decorative, no score)`);
    }

    // Xử lý các vật phẩm khác nếu cần
    if (tile.properties?.name === "gem") {
      scene.sound.play("coin"); // Hoặc "gem" sound nếu có

      const score = tile.properties?.value || 25;
      this.minigameCore.addScore(score);
      console.log(`💎 StandardRules: Collected gem (+${score} points)`);
    }

    if (tile.properties?.name === "powerup") {
      scene.sound.play("powerup", { volume: 0.7 });

      const score = tile.properties?.value || 20;
      this.minigameCore.addScore(score);
      console.log(`⚡ StandardRules: Collected powerup (+${score} points)`);
    }

    if (tile.properties?.type === "trap") {
      scene.sound.play("trap", { volume: 0.8 });

      const penalty = tile.properties?.penalty || 5;
      this.minigameCore.subtractScore(penalty);
      console.log(`🕳️ StandardRules: Hit trap (-${penalty} points)`);
    }
  }

  handleInteractiveObject(
    objectName: string,
    objectData: any,
    scene: BasePlatformerScene
  ): void {
    console.log(`🎮 StandardRules: Handling object "${objectName}"`);

    if (objectName.includes("finish") || objectName.includes("level_end")) {
      // Compute elapsed time and convert to score (time trial)
      const endTime = scene.time.now;
      const elapsedSeconds = (endTime - this.startTime) / 1000;

      const baseScore = 1000;
      const penaltyPerSecond = 10;
      const timePenalty = Math.floor(elapsedSeconds * penaltyPerSecond);
      const finalScore = Math.max(50, baseScore - timePenalty);

      console.log(
        `🏁 StandardRules: Level completed in ${elapsedSeconds.toFixed(2)}s.`
      );
      console.log(`   - Time Penalty: ${timePenalty}`);
      console.log(`   - Final Score: ${finalScore}`);

      scene.sound.play("coin", { volume: 0.8 });

      this.minigameCore.addScore(finalScore);
      this.minigameCore.triggerQuiz();
    }
    // THÊM MỚI: Xử lý logic cho checkpoint
    else if (objectName.includes("checkpoint")) {
      // Vị trí của checkpoint object. Chú ý Tiled có gốc tọa độ Y ở đáy object.
      const checkpointX = objectData.x + objectData.width / 2;
      const checkpointY = objectData.y - objectData.height / 2;

      // Yêu cầu scene cập nhật vị trí checkpoint
      // Chúng ta truyền vào object để dễ dàng mở rộng sau này
      const checkpointActivated = scene.setCheckpoint({
        x: checkpointX,
        y: checkpointY,
      });

      // Chỉ cộng điểm và chơi âm thanh nếu đây là lần đầu kích hoạt checkpoint
      if (checkpointActivated) {
        const checkpointBonus = objectData.properties?.checkpointBonus || 5;
        this.minigameCore.addScore(checkpointBonus);
        console.log(
          `🚩 StandardRules: Checkpoint activated (+${checkpointBonus} points) at (${checkpointX}, ${checkpointY})`
        );
      }
    } else if (objectName.includes("secret")) {
      scene.sound.play("secret", { volume: 0.8 });

      const secretBonus = objectData.properties?.secretBonus || 30;
      this.minigameCore.addScore(secretBonus);
      console.log(
        `🔍 StandardRules: Secret area found (+${secretBonus} bonus)`
      );
    }
  }

  // THÊM MỚI: Triển khai phương thức xử lý va chạm với vật nguy hiểm
  handleHazardCollision(
    tile: Phaser.Tilemaps.Tile,
    scene: BasePlatformerScene
  ): void {
    console.log("💥 StandardRules: Player hit a hazard!");

    // Chơi âm thanh (tái sử dụng âm thanh 'trap' hoặc thêm âm thanh mới)
    scene.sound.play("hurt", { volume: 1.0, rate: 0.9 });

    console.log(`💀 Player penalized for hitting a hazard`);
  }

  cleanup(): void {
    console.log(`🧹 StandardRules: Cleaning up`);
    // Không cần dọn dẹp gì đặc biệt trong bộ quy tắc tiêu chuẩn này
  }
}
