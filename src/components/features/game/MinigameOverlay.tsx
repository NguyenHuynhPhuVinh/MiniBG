"use client";

import React, { useState, useEffect } from "react";
import { EventBus } from "../../../../phaser/EventBus";
import { MinigameCore } from "../../../../phaser/classes";
import {
  ChevronRight,
  ChevronLeft,
  Coins,
  Timer,
  Target,
  SkipForward,
  TrendingUp,
  TrendingDown,
  Trophy,
} from "lucide-react";

/**
 * 🎮 MINIGAME OVERLAY - Overlay Next.js hiển thị điểm tổng và thời gian vòng
 *
 * CHỨC NĂNG:
 * - Hiển thị điểm tổng từ MinigameCore
 * - Hiển thị thời gian vòng hiện tại
 * - Fixed position overlay ở góc trên phải
 * - Animation kéo ra/thu vào khi click
 * - Auto update khi có thay đổi từ Phaser
 */

interface MinigameOverlayProps {
  isVisible?: boolean;
  className?: string;
  userPosition?: number;
  totalParticipants?: number;
}

interface GameState {
  score: number;
  timeLeft: number;
  currentRound: number;
  isWarning: boolean;
  formatted: string;
}

export const MinigameOverlay: React.FC<MinigameOverlayProps> = ({
  isVisible = true,
  className = "",
  userPosition,
  totalParticipants,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 0,
    currentRound: 1,
    isWarning: false,
    formatted: "00:00",
  });

  // State cho animation kéo ra/thu vào
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Lắng nghe score update từ MinigameCore
    const handleScoreUpdate = (data: any) => {
      setGameState((prev) => ({
        ...prev,
        score: data.newScore || 0,
      }));
    };

    // Lắng nghe timer update từ game scenes
    const handleTimerUpdate = (data: any) => {
      setGameState((prev) => ({
        ...prev,
        timeLeft: data.timeLeft || 0,
        isWarning: data.isWarning || false,
        formatted: data.formatted || "00:00",
      }));
    };

    // Lắng nghe round update
    const handleRoundUpdate = (roundNumber: number) => {
      setGameState((prev) => ({
        ...prev,
        currentRound: roundNumber,
      }));

      setIsExpanded(false);
    };

    // Lắng nghe khi sắp trigger quiz
    const handleQuizTriggering = () => {
      console.log("🔄 MinigameOverlay: Quiz triggering, collapsing overlay");
      setIsExpanded(false);
    };

    // Đăng ký event listeners
    EventBus.on("minigame-score-updated", handleScoreUpdate);
    EventBus.on("game-timer-update", handleTimerUpdate);
    EventBus.on("round-started", handleRoundUpdate);
    EventBus.on("show-quiz-overlay", handleQuizTriggering);

    // Cleanup khi component unmount
    return () => {
      EventBus.removeListener("minigame-score-updated", handleScoreUpdate);
      EventBus.removeListener("game-timer-update", handleTimerUpdate);
      EventBus.removeListener("round-started", handleRoundUpdate);
      EventBus.removeListener("show-quiz-overlay", handleQuizTriggering);
    };
  }, []);

  // Handle skip minigame
  const handleSkipMinigame = () => {
    console.log("🚀 User clicked skip minigame");

    // Thu gọn overlay trước khi trigger quiz
    setIsExpanded(false);

    // Trigger quiz sau một chút để animation hoàn thành
    setTimeout(() => {
      MinigameCore.getInstance().triggerQuiz();
    }, 300); // 300ms để animation hoàn thành
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-0 z-50 ${className}`}>
      {/* Container chính - kéo theo cửa sổ */}
      <div
        className={`flex items-center transition-all duration-500 ease-in-out ${
          isExpanded ? "translate-x-0" : "-translate-x-72"
        }`}
      >
        {/* Panel thông tin */}
        <div className="bg-black/90 backdrop-blur-sm border-2 border-white/20 shadow-2xl w-72 rounded-r-lg">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="text-center border-b border-white/20 pb-3">
              <h3 className="text-white font-bold text-lg">Thông tin game</h3>
            </div>

            {/* Score Display */}
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Coins size={20} className="text-black" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-300">Điểm số</div>
                <div className="font-bold text-xl text-yellow-400">
                  {gameState.score}
                </div>
              </div>
            </div>

            {/* Timer Display */}
            <div className="flex items-center gap-3 text-white">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  gameState.isWarning
                    ? "bg-red-500 animate-pulse"
                    : "bg-blue-500"
                }`}
              >
                <Timer size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-300">Thời gian</div>
                <div
                  className={`font-bold text-xl font-mono ${
                    gameState.isWarning
                      ? "text-red-400 animate-pulse"
                      : "text-blue-400"
                  }`}
                >
                  {gameState.formatted}
                </div>
              </div>
            </div>

            {/* Round Display */}
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-300">Vòng chơi</div>
                <div className="font-bold text-xl text-green-400">
                  Vòng {gameState.currentRound}
                </div>
              </div>
            </div>

            {/* Leaderboard Position - Chỉ hiển thị khi có dữ liệu */}
            {userPosition && totalParticipants && (
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy size={20} className="text-black" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-300">Xếp hạng</div>
                  <div className="font-bold text-xl text-yellow-400">
                    #{userPosition}/{totalParticipants}
                  </div>
                </div>
              </div>
            )}

            {/* Skip Button */}
            <div className="pt-2 border-t border-white/20">
              <button
                onClick={handleSkipMinigame}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                title="Bỏ qua minigame và chuyển thẳng vào quiz"
              >
                <SkipForward size={18} />
                <span>Bỏ qua Minigame</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Button - Nằm bên phải panel */}
        <button
          onClick={toggleExpanded}
          className="w-8 h-32 bg-black/90 backdrop-blur-sm border-2 border-l-0 border-white/30 flex items-center justify-center text-white hover:bg-black transition-all duration-300 rounded-r-lg"
          title={
            isExpanded ? "Thu gọn bảng thông tin" : "Mở rộng bảng thông tin"
          }
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Score change animation */}
      {isExpanded && (
        <div className="relative">
          <ScoreChangeAnimation
            score={gameState.score}
            isExpanded={isExpanded}
          />
        </div>
      )}
    </div>
  );
};

/**
 * 🎊 SCORE CHANGE ANIMATION - Animation khi điểm thay đổi
 */
interface ScoreChangeAnimationProps {
  score: number;
  isExpanded: boolean;
}

const ScoreChangeAnimation: React.FC<ScoreChangeAnimationProps> = ({
  score,
  isExpanded,
}) => {
  const [prevScore, setPrevScore] = useState(score);
  const [showAnimation, setShowAnimation] = useState(false);
  const [scoreChange, setScoreChange] = useState(0);

  useEffect(() => {
    if (score !== prevScore) {
      const change = score - prevScore;
      setScoreChange(change);
      setShowAnimation(true);
      setPrevScore(score);

      // Ẩn animation sau 2 giây
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [score, prevScore]);

  if (!showAnimation || scoreChange === 0) {
    return null;
  }

  return (
    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
      <div
        className={`animate-bounce text-lg font-bold flex items-center gap-1 ${
          scoreChange > 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {scoreChange > 0 ? (
          <TrendingUp size={16} />
        ) : (
          <TrendingDown size={16} />
        )}
        <span>
          {scoreChange > 0 ? "+" : ""}
          {scoreChange}
        </span>
      </div>
    </div>
  );
};

export default MinigameOverlay;
