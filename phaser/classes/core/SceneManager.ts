import { SCENE_KEYS } from "../../config/constants";

/**
 * 🎬 SCENE MANAGER - Quản lý việc chọn scene random và thông tin scene
 *
 * CHỨC NĂNG:
 * - Centralized random scene selection logic (FALLBACK - chính thức dùng SeededSceneSelector)
 * - Scene information và validation utilities
 * - Scene transition logging
 *
 * NOTE: RoundManager giờ sử dụng SeededSceneSelector để đảm bảo consistent random
 */
export class SceneManager {
  // Danh sách các gameplay scenes có thể random
  private static readonly GAMEPLAY_SCENES = [
    SCENE_KEYS.ORIGIN_VALLEY,
    SCENE_KEYS.TEMPEST_PEAK,
    SCENE_KEYS.WHISPERING_CAVERNS,
  ] as const;

  /**
   * 🎲 RANDOM GAMEPLAY SCENE - Chọn ngẫu nhiên 1 trong các scene chơi
   *
   * @param excludeScene - Scene cần loại trừ (optional)
   * @returns Scene key được chọn random
   */
  public static getRandomGameplayScene(excludeScene?: string): string {
    let availableScenes = [...this.GAMEPLAY_SCENES];

    // Loại trừ scene nếu được chỉ định
    if (excludeScene) {
      availableScenes = availableScenes.filter(
        (scene) => scene !== excludeScene
      );
    }

    // Nếu không còn scene nào sau khi loại trừ, dùng tất cả
    if (availableScenes.length === 0) {
      availableScenes = [...this.GAMEPLAY_SCENES];
    }

    const randomIndex = Math.floor(Math.random() * availableScenes.length);
    return availableScenes[randomIndex];
  }

  /**
   * 🎮 GET ALL GAMEPLAY SCENES - Lấy danh sách tất cả gameplay scenes
   *
   * @returns Array các scene keys (readonly)
   */
  public static getAllGameplayScenes(): readonly string[] {
    return this.GAMEPLAY_SCENES;
  }

  /**
   * 📊 GET SCENE INFO - Lấy thông tin về scene
   *
   * @param sceneKey - Key của scene
   * @returns Object chứa thông tin scene
   */
  public static getSceneInfo(sceneKey: string): {
    name: string;
    description: string;
  } {
    switch (sceneKey) {
      case SCENE_KEYS.ORIGIN_VALLEY:
        return {
          name: "Origin Valley",
          description: "Thung lũng khởi nguồn với địa hình đa dạng.",
        };
      case SCENE_KEYS.TEMPEST_PEAK:
        return {
          name: "Tempest Peak",
          description: "Chinh phục đỉnh núi cao trong gió bão.",
        };
      case SCENE_KEYS.WHISPERING_CAVERNS:
        return {
          name: "Whispering Caverns",
          description: "Khám phá hang động tối tăm chỉ với ánh đuốc leo lét.",
        };
      case SCENE_KEYS.PRELOAD:
        return {
          name: "Loading Scene",
          description: "Màn hình loading assets",
        };

      // Legacy support (deprecated)
      case SCENE_KEYS.GAME:
        return {
          name: "Forest Level (Legacy)",
          description: "Rừng xanh - phiên bản cũ (deprecated)",
        };

      default:
        return {
          name: "Unknown Scene",
          description: "Scene không xác định",
        };
    }
  }

  /**
   * 📝 LOG SCENE TRANSITION - Log thông tin chuyển scene
   *
   * @param fromScene - Scene hiện tại
   * @param toScene - Scene đích
   * @param reason - Lý do chuyển scene
   */
  public static logSceneTransition(
    fromScene: string,
    toScene: string,
    reason: string
  ): void {
    const fromInfo = this.getSceneInfo(fromScene);
    const toInfo = this.getSceneInfo(toScene);

    console.log(
      `🎬 Scene Transition: ${fromInfo.name} → ${toInfo.name} (${reason})`
    );
  }

  /**
   * ✅ VALIDATE SCENE KEY - Kiểm tra scene key có hợp lệ không
   *
   * @param sceneKey - Scene key cần kiểm tra
   * @returns true nếu hợp lệ
   */
  public static isValidSceneKey(sceneKey: string): boolean {
    return Object.values(SCENE_KEYS).includes(sceneKey as any);
  }
}
