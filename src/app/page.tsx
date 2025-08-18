"use client";

import React, { useLayoutEffect, useEffect, useState } from "react";
import StartGame from "../../phaser/GameEngine";
import { EventBus } from "../../phaser/EventBus";
import { MinigameOverlay } from "../components/features/game/MinigameOverlay";
import { SceneLoadingOverlay } from "../components/features/game/SceneLoadingOverlay";
import { MinigameCore, NetworkManager } from "../../phaser/classes";

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
  const [loadingState, setLoadingState] = useState({
    isVisible: true,
    sceneName: sceneToLaunch,
  });

  useLayoutEffect(() => {
    if (globalGameInitialized) {
      console.log("[STRICT MODE] Game already initialized, skipping...");
      return;
    }
    globalGameInitialized = true;
    console.log("[INIT] Starting game initialization...");

    MinigameCore.getInstance().resetCompletely();
    globalGameInstance = StartGame("test-game-container");

    const networkManager = NetworkManager.getInstance();

    const handleSceneReady = async (sceneInstance: Phaser.Scene) => {
      if (sceneInstance.scene.key !== "PreloadScene") return;
      EventBus.removeListener("current-scene-ready", handleSceneReady);

      const testRoomId = `test_scene_${sceneToLaunch}`;
      console.log(
        `[TEST MODE] Preparing to join shared test room: "${testRoomId}"`
      );

      try {
        await networkManager.joinRoundRoom("test", 0, testRoomId);

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

    return () => {
      console.log(
        "[CLEANUP] TestGameWrapper cleanup function called - keeping game alive for Strict Mode."
      );
    };
  }, [sceneToLaunch]);

  useEffect(() => {
    const handleQuizTrigger = () => {
      console.log("Test Mode: Quiz trigger detected. Calling onGameEnd.");
      onGameEnd();
    };

    const handleSceneLoadingStart = (data: { sceneName: string }) => {
      setLoadingState({ isVisible: true, sceneName: data.sceneName });
    };

    const handleUserStart = () => {
      setLoadingState((prev) => ({ ...prev, isVisible: false }));
    };

    EventBus.on("manual-quiz-trigger", handleQuizTrigger);
    EventBus.on("scene-loading-start", handleSceneLoadingStart);
    EventBus.on("scene-loading-user-start", handleUserStart);

    return () => {
      EventBus.removeListener("manual-quiz-trigger", handleQuizTrigger);
      EventBus.removeListener("scene-loading-start", handleSceneLoadingStart);
      EventBus.removeListener("scene-loading-user-start", handleUserStart);
    };
  }, [onGameEnd]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div id="test-game-container" className="absolute inset-0 w-full h-full" />
      <SceneLoadingOverlay
        isVisible={loadingState.isVisible}
        sceneName={loadingState.sceneName}
      />
      <MinigameOverlay isVisible={!loadingState.isVisible} />
    </div>
  );
}

// Next.js page: render the TestGameWrapper with simple defaults.
export default function Page() {
  const handleGameEnd = () => {
    console.log("Test page: game ended.");
  };

  return <TestGameWrapper sceneToLaunch="PreloadScene" onGameEnd={handleGameEnd} />;
}
