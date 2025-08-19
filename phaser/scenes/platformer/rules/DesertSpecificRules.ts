// phaser/scenes/platformer/rules/DesertSpecificRules.ts
import { IPlatformerRules } from "./IPlatformerRules";
import { MinigameCore } from "../../../classes";
import { BasePlatformerScene } from "../BasePlatformerScene";

/**
 * 🏜️ DESERT SPECIFIC RULES - Bộ quy tắc đặc biệt cho sa mạc
 *
 * Ví dụ về cách tạo bộ quy tắc riêng cho một màn chơi cụ thể.
 * Desert có những điều kiện khắc nghiệt hơn, nên scores và penalties khác biệt.
 *
 * ĐIỂM KHÁC BIỆT SO VỚI STANDARDRULES:
 * - Xu có giá trị cao hơn (15 thay vì 10) - khó tìm trong sa mạc
 * - Power-up có giá trị cao hơn (25 thay vì 20) - hiếm trong sa mạc
 * - Trap penalty nặng hơn (10 thay vì 5) - sa mạc khắc nghiệt
 * - Completion bonus lớn hơn (100 thay vì 50) - vượt qua sa mạc khó
 * - Secret bonus cao hơn (50 thay vì 25) - ốc đảo hiếm có
 */
export class DesertSpecificRules implements IPlatformerRules {
  private minigameCore!: MinigameCore;
  private scene!: BasePlatformerScene;
  private startTime: number = 0;

  initialize(scene: BasePlatformerScene, minigameCore: MinigameCore): void {
    this.scene = scene;
    this.minigameCore = minigameCore;
    this.startTime = scene.time.now;
    console.log(
      `🏜️ DesertSpecificRules: Time trial started at ${this.startTime} for desert scene`
    );
  }

  handleCollectible(
    tile: Phaser.Tilemaps.Tile,
    scene: BasePlatformerScene
  ): void {
    if (tile.properties?.name === "xu" || tile.properties?.type === "coin") {
      // Coins are decorative in desert time-trial. Keep a small sound only.
      scene.sound.play("coin", { volume: 0.8, rate: 0.9 });
      console.log(`🏜️ DesertRules: Collected coin (decorative, no score)`);
    }

    if (tile.properties?.name === "gem") {
      scene.sound.play("coin", { volume: 1.0, rate: 1.2 }); // Higher pitch for precious gem

      const score = 40; // Much higher in desert (vs 25 in standard)
      this.minigameCore.addScore(score);
      console.log(
        `💎 DesertRules: Precious gem in desert (+${score} points - extremely rare!)`
      );
    }

    if (tile.properties?.name === "water") {
      // Desert-specific collectible: Water bottles
      scene.sound.play("powerup", { volume: 0.9 }); // Refreshing sound for water

      const score = 30;
      this.minigameCore.addScore(score);
      console.log(`💧 DesertRules: Life-saving water (+${score} points)`);
    }

    if (tile.properties?.type === "trap") {
      // Desert traps are harsher
      scene.sound.play("trap", { volume: 1.0, rate: 0.8 }); // Deeper, more ominous

      const penalty = 15; // Harsher penalty in desert for time-trial
      this.minigameCore.subtractScore(penalty);
      console.log(
        `🏜️ DesertRules: Desert trap! (-${penalty} points - harsh penalty)`
      );
    }
  }

  handleInteractiveObject(
    objectName: string,
    objectData: any,
    scene: BasePlatformerScene
  ): void {
    console.log(
      `🏜️ DesertRules: Handling object "${objectName}" in desert environment`
    );

    if (objectName.includes("finish") || objectName.includes("level_end")) {
      // Compute elapsed time and convert to score (stricter formula for desert)
      const endTime = scene.time.now;
      const elapsedSeconds = (endTime - this.startTime) / 1000;

      const baseScore = 1500; // higher base for desert
      const penaltyPerSecond = 15; // harsher penalty per second
      const timePenalty = Math.floor(elapsedSeconds * penaltyPerSecond);
      const finalScore = Math.max(100, baseScore - timePenalty);

      console.log(
        `🏁 DesertRules: Desert conquered in ${elapsedSeconds.toFixed(2)}s.`
      );
      console.log(`   - Time Penalty: ${timePenalty}`);
      console.log(`   - Final Score: ${finalScore}`);

      scene.sound.play("coin", { volume: 1.0, rate: 0.9 });

      this.minigameCore.addScore(finalScore);
      this.minigameCore.triggerQuiz();
    } else if (objectName.includes("checkpoint")) {
      scene.sound.play("checkpoint", { volume: 0.8 });

      const checkpointBonus = 10;
      this.minigameCore.addScore(checkpointBonus);
      console.log(
        `🚩 DesertRules: Desert checkpoint - crucial rest point (+${checkpointBonus} points)`
      );
    } else if (objectName.includes("secret")) {
      scene.sound.play("secret", { volume: 1.0, rate: 1.1 });

      const secretBonus = 50;
      this.minigameCore.addScore(secretBonus);
      console.log(
        `🏝️ DesertRules: Hidden oasis discovered! (+${secretBonus} points - miracle find!)`
      );
    } else if (objectName.includes("cactus")) {
      scene.sound.play("trap", { volume: 0.7, rate: 1.3 });

      const penalty = 8;
      this.minigameCore.subtractScore(penalty);
      console.log(`🌵 DesertRules: Cactus sting! (-${penalty} points)`);
    } else if (objectName.includes("mirage")) {
      scene.sound.play("trap", { volume: 0.5, rate: 0.7 });

      const penalty = 15;
      this.minigameCore.subtractScore(penalty);
      console.log(
        `🌀 DesertRules: Mirage deception! (-${penalty} points - wasted energy)`
      );
    }
  }

  // THÊM MỚI: Triển khai phương thức xử lý va chạm với vật nguy hiểm
  handleHazardCollision(
    tile: Phaser.Tilemaps.Tile,
    scene: BasePlatformerScene
  ): void {
    console.log("💥 DesertSpecificRules: Player hit a HARSH hazard!");

    scene.sound.play("hurt", { volume: 1.0, rate: 0.7 }); // Âm thanh trầm hơn

    console.log(`💀 Player penalized for hitting a desert hazard`);
  }

  cleanup(): void {
    console.log(
      `🏜️ DesertSpecificRules: Survived the harsh desert - cleaning up`
    );
  }
}

/*
=== CÁCH SỬ DỤNG TRONG DESERT SCENE ===

Trong DesertScene.ts, thay đổi method createRules():

protected createRules(): IPlatformerRules {
  console.log("🏜️ DesertScene: Using DesertSpecificRules for harsh desert environment");
  return new DesertSpecificRules();
}

=== KẾT QUẢ ===

- ForestScene dùng StandardRules: Xu = 10 điểm, Completion = 50 điểm
- DesertScene dùng DesertSpecificRules: Xu = 15 điểm, Completion = 100 điểm

Chỉ cần thay đổi 1 dòng code, toàn bộ logic nghiệp vụ của scene đã thay đổi!
Đây chính là sức mạnh của Strategy Pattern.
*/
