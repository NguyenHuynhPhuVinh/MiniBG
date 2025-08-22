// frontend/phaser/scenes/platformer/rules/CavernRules.ts
import { WhisperingCavernsScene } from "../WhisperingCavernsScene";
import { StandardRules } from "./StandardRules";
import { BasePlatformerScene } from "../BasePlatformerScene";

/**
 * 🔥 CAVERN RULES - Bộ luật chơi đặc biệt cho màn hang động
 *
 * Kế thừa từ StandardRules và thêm vào logic điều khiển độ tối của màn chơi
 * mỗi khi người chơi kích hoạt một checkpoint mới.
 */
export class CavernRules extends StandardRules {
  // Biến để theo dõi cấp độ tối hiện tại
  private darknessLevel: number = 0;

  /**
   * Ghi đè phương thức xử lý đối tượng tương tác.
   * Logic mới: Xử lý riêng cho 'checkpoint' và gọi 'super' cho các trường hợp còn lại.
   */
  handleInteractiveObject(
    objectName: string,
    objectData: any,
    scene: BasePlatformerScene
  ): void {
    // Nếu đối tượng là checkpoint, chúng ta sẽ xử lý hoàn toàn ở đây
    if (objectName.includes("checkpoint")) {
      console.log("🔥 CavernRules: Taking control of checkpoint logic.");

      const checkpointX = objectData.x + objectData.width / 2;
      const checkpointY = objectData.y - objectData.height / 2;

      // Gọi setCheckpoint CHỈ MỘT LẦN và lưu kết quả
      const isNewCheckpoint = scene.setCheckpoint({
        x: checkpointX,
        y: checkpointY,
      });

      console.log(`🔥 CavernRules: Checkpoint is new? -> ${isNewCheckpoint}`);

      // Chỉ thực hiện logic nếu đây là checkpoint mới
      if (isNewCheckpoint) {
        this.darknessLevel++;

        // --- BƯỚC 1: Logic riêng của CavernRules ---
        // Ra lệnh cho scene thay đổi độ sáng
        (scene as WhisperingCavernsScene).setDarknessLevel(this.darknessLevel);
        console.log(
          `🔥 CavernRules: Increasing darkness to level ${this.darknessLevel}`
        );

        // --- BƯỚC 2: Tái sử dụng logic cộng điểm từ StandardRules ---
        // Chúng ta có thể sao chép logic cộng điểm nhỏ ở đây để tránh gọi super phức tạp
        scene.sound.play("coin", { volume: 0.8 }); // Tái sử dụng âm thanh coin
      }
    }
    // Nếu là bất kỳ đối tượng nào khác (vạch đích, bí mật...), hãy để StandardRules xử lý
    else {
      super.handleInteractiveObject(objectName, objectData, scene);
    }
  }
}
