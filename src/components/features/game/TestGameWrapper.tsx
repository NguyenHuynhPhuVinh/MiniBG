// frontend/src/components/features/game/TestGameWrapper.tsx
"use client";

import React, { useLayoutEffect, useRef, useEffect, useState } from "react";
import StartGame from "../../../../phaser/GameEngine";
import { EventBus } from "../../../../phaser/EventBus";
import { MinigameOverlay } from "./MinigameOverlay";
import { SceneLoadingOverlay } from "./SceneLoadingOverlay";
import { MinigameCore } from "../../../../phaser/classes";

interface TestGameWrapperProps {
  sceneToLaunch: string;
  onGameEnd: () => void;
}

const TestGameWrapper: React.FC<TestGameWrapperProps> = ({
  sceneToLaunch,
  onGameEnd,
}) => {
  const game = useRef<Phaser.Game | null>(null);
  const [showSceneLoading, setShowSceneLoading] = useState(true);

  // Khởi tạo và hủy Phaser game
  useLayoutEffect(() => {
    // Luôn reset điểm khi bắt đầu một màn chơi test mới
    MinigameCore.getInstance().resetCompletely();
    game.current = StartGame("test-game-container");

    const handleSceneReady = (sceneInstance: Phaser.Scene) => {
      // Khi PreloadScene sẵn sàng, thay vì đợi dữ liệu quiz,
      // chúng ta sẽ khởi chạy trực tiếp scene được yêu cầu.
      if (sceneInstance.scene.key === "PreloadScene") {
        console.log(`Directly launching scene: ${sceneToLaunch}`);
        // Cung cấp một đối tượng `roundData` giả để scene không bị lỗi
        sceneInstance.scene.start(sceneToLaunch, {
          roundData: {
            roundNumber: 1,
            gameTimeLimit: -1, // Thời gian dài để test thoải mái
            isTestMode: true,
          },
        });
      }
    };

    EventBus.on("current-scene-ready", handleSceneReady);

    return () => {
      if (game.current) {
        console.log("Destroying test game instance...");
        game.current.destroy(true);
        game.current = null;
      }
      EventBus.removeListener("current-scene-ready", handleSceneReady);
    };
  }, [sceneToLaunch]); // Hook này chỉ chạy một lần khi component mount

  // Lắng nghe các sự kiện từ game
  useEffect(() => {
    // Đây là sự kiện "kết thúc" trong chế độ test
    const handleQuizTrigger = () => {
      console.log("Test Mode: Quiz trigger detected. Calling onGameEnd.");
      onGameEnd();
    };

    const handleSceneLoadingStart = () => setShowSceneLoading(true);
    // Trong chế độ test, scene sẽ tự ẩn sau khi load xong hoặc người dùng nhấn bắt đầu
    const handleSceneLoadingComplete = () => {
      // setShowSceneLoading(false); // Có thể để user nhấn nút
    };
    const handleUserStart = () => setShowSceneLoading(false);

    EventBus.on("manual-quiz-trigger", handleQuizTrigger);
    EventBus.on("scene-loading-start", handleSceneLoadingStart);
    EventBus.on("scene-loading-complete", handleSceneLoadingComplete);
    EventBus.on("scene-loading-user-start", handleUserStart);

    return () => {
      EventBus.removeListener("manual-quiz-trigger", handleQuizTrigger);
      EventBus.removeListener("scene-loading-start", handleSceneLoadingStart);
      EventBus.removeListener(
        "scene-loading-complete",
        handleSceneLoadingComplete
      );
      EventBus.removeListener("scene-loading-user-start", handleUserStart);
    };
  }, [onGameEnd]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Container cho Phaser render */}
      <div
        id="test-game-container"
        className="absolute inset-0 w-full h-full"
      />

      {/* Overlay màn hình chờ */}
      <SceneLoadingOverlay isVisible={showSceneLoading} />

      {/* Overlay hiển thị điểm và thời gian */}
      <MinigameOverlay isVisible={!showSceneLoading} />
    </div>
  );
};

export default TestGameWrapper;
