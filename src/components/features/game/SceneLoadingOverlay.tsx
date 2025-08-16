"use client";

import React, { useState, useEffect } from "react";
import { EventBus } from "../../../../phaser/EventBus";
import { Trees, Mountain, Gamepad2, Lightbulb, Play, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 🎮 SCENE LOADING OVERLAY - Full screen overlay hiển thị khi scene đang preload
 *
 * CHỨC NĂNG:
 * - Full screen overlay với loading animation
 * - Hiển thị scene nào đang load cụ thể
 * - Progress bar cho quá trình loading
 * - Tips và thông tin về scene
 * - Auto hide khi loading hoàn thành
 */

interface SceneLoadingOverlayProps {
  isVisible?: boolean;
  className?: string;
}

interface LoadingState {
  isLoading: boolean;
  sceneName: string;
  sceneDisplayName: string;
  progress: number;
  loadingText: string;
  tips: string[];
  currentTipIndex: number;
  isComplete: boolean;
  currentStepIndex: number;
}

interface GameStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SCENE_INFO = {
  // Forest Scene variations
  GameScene: {
    displayName: "Rừng Xanh",
    description: "Khám phá khu rừng với những thử thách thú vị",
    tips: [
      "Môi trường rừng xanh mát với nhiều cây cối",
      "Có nhiều xu vàng ẩn giấu trong các góc khuất",
      "Địa hình có nhiều nền tảng để nhảy",
      "Thời gian hoàn thành: 2-3 phút",
    ],
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: Trees,
    steps: [
      {
        title: "Di chuyển",
        description: "Sử dụng WASD hoặc phím mũi tên để di chuyển nhân vật qua các địa hình khác nhau",
        icon: Gamepad2,
      },
      {
        title: "Nhảy",
        description: "Nhấn Space để nhảy qua các chướng ngại vật và lên các nền tảng cao",
        icon: Mountain,
      },
      {
        title: "Thu thập",
        description: "Thu thập xu vàng và các vật phẩm để tăng điểm số trong vòng chơi",
        icon: Trees,
      },
    ],
  },
  ForestScene: {
    displayName: "Rừng Xanh",
    description: "Khám phá khu rừng với những thử thách thú vị",
    tips: [
      "Môi trường rừng xanh mát với nhiều cây cối",
      "Có nhiều xu vàng ẩn giấu trong các góc khuất",
      "Địa hình có nhiều nền tảng để nhảy",
      "Thời gian hoàn thành: 2-3 phút",
    ],
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: Trees,
    steps: [
      {
        title: "Di chuyển",
        description: "Sử dụng WASD hoặc phím mũi tên để di chuyển nhân vật qua các địa hình khác nhau",
        icon: Gamepad2,
      },
      {
        title: "Nhảy",
        description: "Nhấn Space để nhảy qua các chướng ngại vật và lên các nền tảng cao",
        icon: Mountain,
      },
      {
        title: "Thu thập",
        description: "Thu thập xu vàng và các vật phẩm để tăng điểm số trong vòng chơi",
        icon: Trees,
      },
    ],
  },
  // Desert Scene
  DesertScene: {
    displayName: "Sa Mạc Vàng",
    description: "Vượt qua sa mạc với những thử thách khắc nghiệt",
    tips: [
      "Môi trường sa mạc khô cằn với nhiều thử thách",
      "Cần di chuyển nhanh để tránh các nguy hiểm",
      "Có nhiều kho báu ẩn giấu trong cát",
      "Thời gian hoàn thành: 3-4 phút",
    ],
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    icon: Mountain,
    steps: [
      {
        title: "Thăm dò",
        description: "Khám phá sa mạc và tìm kiếm các con đường an toàn qua địa hình hiểm trở",
        icon: Mountain,
      },
      {
        title: "Tránh nguy hiểm",
        description: "Cẩn thận với các chướng ngại vật và bẫy ẩn giấu trong sa mạc",
        icon: Lightbulb,
      },
      {
        title: "Thu thập kho báu",
        description: "Tìm và thu thập các kho báu quý giá ẩn giấu trong cát sa mạc",
        icon: Trees,
      },
    ],
  },
  // Default fallback cho các scene khác
  default: {
    displayName: "Đang tải game",
    description: "Chuẩn bị trải nghiệm game thú vị",
    tips: [
      "Chuẩn bị cho một cuộc phiêu lưu thú vị",
      "Kiểm tra các phím điều khiển",
      "Sẵn sàng cho thử thách mới",
      "Chúc bạn chơi game vui vẻ!",
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Gamepad2,
    steps: [
      {
        title: "Chuẩn bị",
        description: "Làm quen với các phím điều khiển và cách chơi cơ bản",
        icon: Gamepad2,
      },
      {
        title: "Khám phá",
        description: "Khám phá thế giới game và tìm hiểu các cơ chế gameplay",
        icon: Lightbulb,
      },
      {
        title: "Thử thách",
        description: "Hoàn thành các thử thách để tiến tới vòng tiếp theo",
        icon: Mountain,
      },
    ],
  },
};

export const SceneLoadingOverlay: React.FC<SceneLoadingOverlayProps> = ({
  isVisible = false,
  className = "",
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    sceneName: "",
    sceneDisplayName: "",
    progress: 0,
    loadingText: "Đang tải...",
    tips: [],
    currentTipIndex: 0,
    isComplete: false,
    currentStepIndex: 0,
  });

  useEffect(() => {
    // Lắng nghe scene loading start
    const handleSceneLoadingStart = (data: { sceneName: string }) => {
      console.log("🎬 SceneLoadingOverlay: Received scene-loading-start", data);

      let sceneInfo = SCENE_INFO[data.sceneName as keyof typeof SCENE_INFO];

      // Nếu không tìm thấy scene info, sử dụng default
      if (!sceneInfo) {
        console.log(`⚠️ Scene ${data.sceneName} not found in SCENE_INFO, using default`);
        sceneInfo = SCENE_INFO.default;
      }

      setLoadingState({
        isLoading: true,
        sceneName: data.sceneName,
        sceneDisplayName: sceneInfo.displayName,
        progress: 0,
        loadingText: `Đang tải ${sceneInfo.displayName}...`,
        tips: sceneInfo.tips,
        currentTipIndex: 0,
        isComplete: false,
        currentStepIndex: 0,
      });

      console.log("✅ SceneLoadingOverlay: Loading state set", {
        sceneName: data.sceneName,
        displayName: sceneInfo.displayName
      });
    };

    // Lắng nghe loading progress
    const handleLoadingProgress = (data: {
      progress: number;
      sceneName?: string;
    }) => {
      console.log("📊 SceneLoadingOverlay: Loading progress", data);
      setLoadingState((prev) => ({
        ...prev,
        progress: Math.round(data.progress * 100),
        loadingText:
          data.progress < 1
            ? `Đang tải ${prev.sceneDisplayName}... ${Math.round(
                data.progress * 100
              )}%`
            : `${prev.sceneDisplayName} đã sẵn sàng!`,
      }));
    };

    // Lắng nghe scene loading complete
    const handleSceneLoadingComplete = () => {
      console.log("✅ SceneLoadingOverlay: Scene loading complete");
      setLoadingState((prev) => ({
        ...prev,
        progress: 100,
        loadingText: `${prev.sceneDisplayName} đã sẵn sàng!`,
        isComplete: true,
      }));

      console.log("🔄 SceneLoadingOverlay: Waiting for user to start game");
    };

    // Đăng ký event listeners
    EventBus.on("scene-loading-start", handleSceneLoadingStart);
    EventBus.on("scene-loading-progress", handleLoadingProgress);
    EventBus.on("scene-loading-complete", handleSceneLoadingComplete);

    // Cleanup khi component unmount
    return () => {
      EventBus.removeListener("scene-loading-start", handleSceneLoadingStart);
      EventBus.removeListener("scene-loading-progress", handleLoadingProgress);
      EventBus.removeListener(
        "scene-loading-complete",
        handleSceneLoadingComplete
      );
    };
  }, []);



  // Auto rotate tips
  useEffect(() => {
    if (loadingState.isLoading && loadingState.tips.length > 0) {
      const interval = setInterval(() => {
        setLoadingState((prev) => ({
          ...prev,
          currentTipIndex: (prev.currentTipIndex + 1) % prev.tips.length,
        }));
      }, 3000); // Đổi tip mỗi 3 giây

      return () => clearInterval(interval);
    }
  }, [loadingState.isLoading, loadingState.tips.length]);

  // Debug log
  console.log("🎬 SceneLoadingOverlay render:", {
    isVisible,
    loadingState: loadingState.isLoading,
    sceneName: loadingState.sceneName,
    shouldShow: isVisible && loadingState.isLoading
  });

  if (!isVisible || !loadingState.isLoading) {
    return null;
  }

  const sceneInfo =
    SCENE_INFO[loadingState.sceneName as keyof typeof SCENE_INFO] || SCENE_INFO.default;

  const IconComponent = sceneInfo.icon;
  const currentStep = sceneInfo.steps[loadingState.currentStepIndex];
  const StepIconComponent = currentStep.icon;

  // Handle start game
  const handleStartGame = () => {
    // Emit event để QuizGameWrapper ẩn overlay
    EventBus.emit("scene-loading-user-start");
    console.log("🎮 User started the game");
  };

  // Handle step navigation
  const handlePrevStep = () => {
    setLoadingState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  };

  const handleNextStep = () => {
    setLoadingState((prev) => ({
      ...prev,
      currentStepIndex: Math.min(sceneInfo.steps.length - 1, prev.currentStepIndex + 1),
    }));
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background ${sceneInfo.bgColor} ${className}`}
    >
      {/* Header - Tên vòng ở trên căn giữa */}
      <div className="absolute top-0 left-0 right-0 text-center py-6 sm:py-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <IconComponent size={32} className={sceneInfo.color} />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            {loadingState.sceneDisplayName}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          {sceneInfo.description}
        </p>
      </div>

      {/* Main content - Ở giữa */}
      <div className="flex items-center justify-center h-full px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          {/* Current step */}
          <div className="bg-background/80 rounded-2xl p-6 sm:p-8 border border-border">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-muted ${sceneInfo.color}`}>
                <StepIconComponent size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {currentStep.title}
              </h2>
            </div>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
              {currentStep.description}
            </p>

            {/* Step navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevStep}
                disabled={loadingState.currentStepIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="text-sm">Trước</span>
              </button>

              <div className="flex space-x-2">
                {sceneInfo.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === loadingState.currentStepIndex
                        ? "bg-primary scale-125"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextStep}
                disabled={loadingState.currentStepIndex === sceneInfo.steps.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm">Tiếp</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Start button - chỉ hiện khi loading complete */}
            {loadingState.isComplete && (
              <button
                onClick={handleStartGame}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Play size={20} />
                <span>Bắt đầu chơi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom left - Loading và thông tin */}
      <div className="absolute bottom-6 left-6 flex items-center gap-4">
        {/* Loading spinner */}
        {!loadingState.isComplete && (
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary" />
            <div className="text-sm text-muted-foreground font-medium">
              {loadingState.loadingText}
            </div>
          </div>
        )}

        {/* Rotating tips */}
        <div className="bg-background/80 rounded-lg px-4 py-2 border border-border max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={14} className="text-primary" />
            <span className="text-xs font-medium text-foreground">Thông tin hữu ích</span>
          </div>
          <div className="text-xs text-muted-foreground transition-opacity duration-300">
            {loadingState.tips[loadingState.currentTipIndex]}
          </div>
        </div>
      </div>

      {/* Progress bar - bottom */}
      {!loadingState.isComplete && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${loadingState.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default SceneLoadingOverlay;
