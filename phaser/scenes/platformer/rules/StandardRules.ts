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

  initialize(scene: BasePlatformerScene, minigameCore: MinigameCore): void {
    this.scene = scene;
    this.minigameCore = minigameCore;
    console.log(`🎯 StandardRules: Initialized for ${scene.scene.key}`);
  }

  handleCollectible(
    tile: Phaser.Tilemaps.Tile,
    scene: BasePlatformerScene
  ): void {
    if (tile.properties?.name === "xu" || tile.properties?.type === "coin") {
      // Âm thanh và hiệu ứng thuộc về ruleset, không phải LogicCore
      scene.sound.play("coin");

      const score = tile.properties?.value || 10;
      this.minigameCore.addScore(score);
      console.log(`💰 StandardRules: Collected coin (+${score} points)`);
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
      this.minigameCore.addScore(-penalty);
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
      // Âm thanh thành công thuộc về ruleset
      scene.sound.play("success", { volume: 0.8 }); // Hoặc âm thanh phù hợp khác

      const bonus = objectData.properties?.completionBonus || 50;
      this.minigameCore.addScore(bonus);
      console.log(`🏁 StandardRules: Level completed (+${bonus} bonus)`);
      this.minigameCore.triggerQuiz();
    } else if (objectName.includes("quiz")) {
      console.log(`❓ StandardRules: Quiz object triggered`);
      this.minigameCore.triggerQuiz();
    } else if (objectName.includes("checkpoint")) {
      scene.sound.play("checkpoint", { volume: 0.6 });

      const checkpointBonus = objectData.properties?.checkpointBonus || 5;
      this.minigameCore.addScore(checkpointBonus);
      console.log(
        `🚩 StandardRules: Checkpoint activated (+${checkpointBonus} points)`
      );
    } else if (objectName.includes("secret")) {
      scene.sound.play("secret", { volume: 0.8 });

      const secretBonus = objectData.properties?.secretBonus || 30;
      this.minigameCore.addScore(secretBonus);
      console.log(
        `🔍 StandardRules: Secret area found (+${secretBonus} bonus)`
      );
    }
  }

  cleanup(): void {
    console.log(`🧹 StandardRules: Cleaning up`);
    // Không cần dọn dẹp gì đặc biệt trong bộ quy tắc tiêu chuẩn này
  }
}
