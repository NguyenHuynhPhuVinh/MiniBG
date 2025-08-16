"use client";

import React from "react";
import { Clock, Award, Trophy, Target } from "lucide-react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { QuizRound } from "@/lib/types/quiz";

interface QuizHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentScore: number;
  totalQuestionsOverall?: number; // Tổng số câu hỏi của toàn bộ quiz
  quizTimeLeft: number;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  formatTime: (seconds: number) => string;
  // Thêm props cho vị trí bảng xếp hạng
  userPosition?: number;
  totalParticipants?: number;
  // Thêm props cho round system
  currentRound?: number;
  roundConfig?: QuizRound;
  canNavigateBack?: boolean;
  // Thêm props cho chuyển vòng
  canMoveToNextRound?: boolean;
  onMoveToNextRound?: () => void;
  // Thêm props cho game mode
  isGameMode?: boolean; // Ẩn navigation khi ở game mode
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  currentQuestionIndex,
  totalQuestions,
  currentScore,
  totalQuestionsOverall,
  quizTimeLeft,
  onPrevQuestion,
  onNextQuestion,
  formatTime,
  userPosition,
  totalParticipants,
  roundConfig,
  canNavigateBack = true,
  canMoveToNextRound = false,
  onMoveToNextRound,
  isGameMode = false,
}) => {
  return (
    <div className="fixed top-4 left-4 right-4 z-10 bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex justify-between items-center">
        {/* Left: Navigation - Ẩn khi ở game mode */}
        {!isGameMode ? (
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onPrevQuestion}
              disabled={currentQuestionIndex === 0 || !canNavigateBack}
              className={cn(
                "p-2 rounded-lg w-10 h-10 flex items-center justify-center",
                currentQuestionIndex === 0 || !canNavigateBack
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
              )}
            >
              <FaChevronLeft />
            </button>

            <div className="text-lg font-semibold text-gray-800 min-w-[60px] text-center">
              {currentQuestionIndex + 1}/{totalQuestions}
            </div>

            {canMoveToNextRound ? (
              <button
                onClick={onMoveToNextRound}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
              >
                Chuyển vòng
              </button>
            ) : (
              <button
                onClick={onNextQuestion}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className={cn(
                  "p-2 rounded-lg w-10 h-10 flex items-center justify-center",
                  currentQuestionIndex === totalQuestions - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                )}
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        ) : (
          // Game mode: UI đẹp hơn cho thông tin câu hỏi
          <div className="flex items-center gap-4 flex-1">
            {/* Question progress với style giống timer */}
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border-2",
                "bg-gradient-to-r from-gray-50 to-blue-50 border-gray-300 shadow-sm"
              )}
            >
              <div className="font-bold text-sm text-gray-700">
                Câu {currentQuestionIndex + 1}/{totalQuestions}
              </div>
            </div>
          </div>
        )}

        {/* Center: Round Info */}
        <div className="flex justify-center flex-1">
          {roundConfig && (
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border-2 border-purple-300">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="font-bold text-purple-700 text-sm">
                {roundConfig.name}
              </span>
            </div>
          )}
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {/* Position - Làm nổi bật hơn */}
          {userPosition && totalParticipants ? (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border-2",
                userPosition <= 3
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-sm"
                  : userPosition <= 10
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-sm"
                  : "bg-gray-50 border-gray-300"
              )}
            >
              <Trophy
                className={cn(
                  "h-4 w-4",
                  userPosition <= 3
                    ? "text-yellow-500"
                    : userPosition <= 10
                    ? "text-blue-500"
                    : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "font-bold text-sm",
                  userPosition <= 3
                    ? "text-yellow-700"
                    : userPosition <= 10
                    ? "text-blue-700"
                    : "text-gray-600"
                )}
              >
                #{userPosition}/{totalParticipants}
              </span>
              {userPosition <= 3 && (
                <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                  TOP {userPosition}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-gray-50 border-gray-300">
              <Trophy className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-sm text-gray-400">
                Đang tải...
              </span>
            </div>
          )}

          {/* Score - Cải thiện hiển thị */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border-2",
              currentScore < (totalQuestionsOverall || totalQuestions) * 0.4
                ? "bg-red-50 border-red-300"
                : currentScore < (totalQuestionsOverall || totalQuestions) * 0.7
                ? "bg-orange-50 border-orange-300"
                : "bg-green-50 border-green-300"
            )}
          >
            <Award
              className={cn(
                "h-4 w-4",
                currentScore < (totalQuestionsOverall || totalQuestions) * 0.4
                  ? "text-red-500"
                  : currentScore <
                    (totalQuestionsOverall || totalQuestions) * 0.7
                  ? "text-orange-500"
                  : "text-green-500"
              )}
            />
            <span
              className={cn(
                "font-bold text-sm",
                currentScore < (totalQuestionsOverall || totalQuestions) * 0.4
                  ? "text-red-700"
                  : currentScore <
                    (totalQuestionsOverall || totalQuestions) * 0.7
                  ? "text-orange-700"
                  : "text-green-700"
              )}
            >
              {currentScore}/{totalQuestionsOverall || totalQuestions}
            </span>
          </div>

          {/* Timer - Cải thiện hiển thị */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border-2",
              quizTimeLeft < 300
                ? "bg-red-50 border-red-300 shadow-sm"
                : quizTimeLeft < 600
                ? "bg-orange-50 border-orange-300"
                : "bg-blue-50 border-blue-300"
            )}
          >
            <Clock
              className={cn(
                "h-4 w-4",
                quizTimeLeft < 300
                  ? "text-red-500"
                  : quizTimeLeft < 600
                  ? "text-orange-500"
                  : "text-blue-500"
              )}
            />
            <span
              className={cn(
                "font-bold font-mono text-sm",
                quizTimeLeft < 300
                  ? "text-red-700"
                  : quizTimeLeft < 600
                  ? "text-orange-700"
                  : "text-blue-700"
              )}
            >
              {formatTime(quizTimeLeft)}
            </span>
            {quizTimeLeft < 300 && (
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                SẮP HẾT
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizHeader;
