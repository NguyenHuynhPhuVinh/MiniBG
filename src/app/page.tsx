// frontend/app/test-game/page.tsx
"use client";

import React from "react";
import { useState } from "react";
import { SceneManager } from "../../phaser/classes/core/SceneManager";
import dynamic from "next/dynamic";
import { Gamepad2, Loader2 } from "lucide-react";

// Dynamic import Wrapper để chỉ chạy ở client-side
const TestGameWrapper = dynamic(
  () => import("../components/features/game/TestGameWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-white" />
          <p className="text-white text-lg">Đang khởi tạo môi trường game...</p>
        </div>
      </div>
    ),
  }
);

const TestGamePage = () => {
  // State để lưu scene đang được chọn để chơi
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  // Lấy danh sách các scene có thể chơi từ logic game
  const availableScenes = SceneManager.getAllGameplayScenes();

  // Hàm được gọi khi người dùng chọn một scene
  const handleSceneSelect = (sceneKey: string) => {
    console.log(`🚀 Launching test scene: ${sceneKey}`);
    setSelectedScene(sceneKey);
  };

  // Hàm được gọi khi game kết thúc (trigger quiz / skip) để quay lại màn hình chọn
  const handleGameEnd = () => {
    console.log("🎬 Game session ended. Returning to scene selection.");
    setSelectedScene(null);
  };

  // Nếu đã có scene được chọn, render game
  if (selectedScene) {
    return (
      <TestGameWrapper
        sceneToLaunch={selectedScene}
        onGameEnd={handleGameEnd}
      />
    );
  }

  // Nếu chưa có scene nào được chọn, hiển thị UI lựa chọn
  return (
    <div className="w-full h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <Gamepad2 size={64} className="mx-auto mb-6 text-indigo-400" />
        <h1 className="text-4xl font-bold mb-4">Sân chơi Thử nghiệm</h1>
        <p className="text-gray-400 mb-8">
          Chọn một màn chơi để vào trực tiếp và thử nghiệm các tính năng.
        </p>

        <div className="space-y-4">
          {availableScenes.map((sceneKey: string) => {
            const sceneInfo = SceneManager.getSceneInfo(sceneKey);
            return (
              <button
                key={sceneKey}
                onClick={() => handleSceneSelect(sceneKey)}
                className="w-full text-left p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 group"
              >
                <div className="font-bold text-lg">{sceneInfo.name}</div>
                <div className="text-sm text-gray-400 group-hover:text-white">
                  {sceneInfo.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestGamePage;
