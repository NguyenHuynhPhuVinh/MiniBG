// frontend/src/components/features/game/TestGameWrapper.tsx
"use client";

import React, { useLayoutEffect, useEffect, useState } from "react"; // Phaser cần useLayoutEffect
import StartGame from "../../../../phaser/GameEngine";
import { EventBus } from "../../../../phaser/EventBus";
import { MinigameOverlay } from "./MinigameOverlay";
import { SceneLoadingOverlay } from "./SceneLoadingOverlay";
import { MinigameCore, NetworkManager } from "../../../../phaser/classes";

// GLOBAL LOCK ĐỂ CHỐNG STRICT MODE - KHÔNG RESET KHI COMPONENT UNMOUNT
let globalGameInitialized = false;
let globalGameInstance: Phaser.Game | null = null;

// CLEANUP KHI THỰC SỰ RỜI TRANG
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    console.log("[GLOBAL CLEANUP] Page unloading, cleaning up game...");
    globalGameInitialized = false;
    if (globalGameInstance) {
      globalGameInstance.destroy(true);
      globalGameInstance = null;
    }
  });
}

interface TestGameWrapperProps {
  sceneToLaunch: string;
  onGameEnd: () => void;
}

const TestGameWrapper: React.FC<TestGameWrapperProps> = ({
  sceneToLaunch,
  onGameEnd,
}) => {
  // KHÔNG CẦN useRef NỮA - DÙNG GLOBAL VARIABLES
  const [loadingState, setLoadingState] = useState({
    isVisible: true,
    sceneName: sceneToLaunch,
    isReady: false,
  });

  useLayoutEffect(() => {
    // === GLOBAL LOCK CHỐNG STRICT MODE ===
    // Nếu đã khởi tạo rồi, không làm gì cả.
    if (globalGameInitialized) {
      console.log("[STRICT MODE] Game already initialized, skipping...");
      return;
    }
    // Đánh dấu là đã bắt đầu khởi tạo.
    globalGameInitialized = true;
    console.log("[INIT] Starting game initialization...");
    // ===================================

    MinigameCore.getInstance().resetCompletely();
    globalGameInstance = StartGame("test-game-container");

    const networkManager = NetworkManager.getInstance();

    const handleSceneReady = async (sceneInstance: Phaser.Scene) => {
      if (sceneInstance.scene.key !== "PreloadScene") return;

      // Gỡ listener ngay khi dùng xong để tránh gọi lại
      EventBus.removeListener("current-scene-ready", handleSceneReady);

      const testRoomId = `test_scene_${sceneToLaunch}`;
      console.log(
        `[TEST MODE] Preparing to join shared test room: "${testRoomId}"`
      );

      try {
        await networkManager.joinRoundRoom("test", 0, testRoomId);

        // Kiểm tra xem game có còn tồn tại không trước khi bắt đầu scene
        if (globalGameInstance) {
          console.log(
            `[TEST MODE] Successfully joined room. Launching scene: ${sceneToLaunch}`
          );
          sceneInstance.scene.start(sceneToLaunch, {
            roundData: {
              roundNumber: 1,
              gameTimeLimit: 999,
              isTestMode: true,
            },
          });
        }
      } catch (error) {
        console.error("[TEST MODE] Failed to join test room:", error);
      }
    };

    EventBus.on("current-scene-ready", handleSceneReady);

    // CLEANUP ĐƠN GIẢN - CHỈ LOG, KHÔNG RESET GLOBAL FLAG
    return () => {
      console.log(
        "[CLEANUP] TestGameWrapper cleanup function called - keeping game alive for Strict Mode."
      );
      // KHÔNG LÀM GÌ CẢ - để cho global lock hoạt động
      // Game sẽ được cleanup khi thực sự rời trang (window unload)
    };
  }, [sceneToLaunch]); // Phụ thuộc vẫn giữ nguyên

  // useEffect cho các event khác không thay đổi
  useEffect(() => {
    const handleQuizTrigger = () => {
      console.log("Test Mode: Quiz trigger detected. Calling onGameEnd.");
      onGameEnd();
    };

    const handleSceneLoadingStart = (data: { sceneName: string }) => {
      setLoadingState({
        isVisible: true,
        sceneName: data.sceneName,
        isReady: false,
      });
    };

    const handleUserStart = () => {
      console.log(
        "🎮 Test Wrapper: User started game, hiding loading overlay."
      );
      setLoadingState((prev) => ({ ...prev, isVisible: false }));
    };

    // THÊM LISTENER MỚI:
    // Đây là listener DUY NHẤT được phép ẩn loading overlay
    const handlePlayerReady = () => {
      console.log(
        "✅ Received player-ready-and-visible, enabling start button."
      );
      setLoadingState((prev) => ({ ...prev, isReady: true }));
    };

    EventBus.on("manual-quiz-trigger", handleQuizTrigger);
    EventBus.on("scene-loading-start", handleSceneLoadingStart);
    EventBus.on("scene-loading-user-start", handleUserStart);
    EventBus.on("player-ready-and-visible", handlePlayerReady);

    return () => {
      EventBus.removeListener("manual-quiz-trigger", handleQuizTrigger);
      EventBus.removeListener("scene-loading-start", handleSceneLoadingStart);
      EventBus.removeListener("scene-loading-user-start", handleUserStart);
      EventBus.removeListener("player-ready-and-visible", handlePlayerReady);
    };
  }, [onGameEnd]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div
        id="test-game-container"
        className="absolute inset-0 w-full h-full"
      />
      <SceneLoadingOverlay
        isVisible={loadingState.isVisible}
        sceneName={loadingState.sceneName} // Truyền sceneName vào
        isReady={loadingState.isReady}
      />
      <MinigameOverlay isVisible={!loadingState.isVisible} />
    </div>
  );
};

export default TestGameWrapper;
