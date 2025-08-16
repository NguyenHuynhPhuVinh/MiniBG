import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target } from "lucide-react";
import { QuizRound } from "@/lib/types/quiz";

interface RoundTransitionProps {
  visible: boolean;
  currentRound: number;
  roundConfig: QuizRound;
  questionsInRound: number;
  previousRoundStats?: {
    attempted: number;
    correct: number;
    incorrect: number;
  };
  onComplete: () => void;
}

export const RoundTransition: React.FC<RoundTransitionProps> = ({
  visible,
  currentRound,
  roundConfig,
  questionsInRound,
  previousRoundStats,
  onComplete,
}) => {
  const [, setProgress] = useState(0);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (visible) {
      // Hiển thị stats của vòng trước (nếu có) sau 0.5s
      if (previousRoundStats) {
        setTimeout(() => {
          setShowStats(true);
        }, 500);
      }

      // Bắt đầu progress bar sau 1s
      setTimeout(() => {
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 5;
          });
        }, 50);

        // Hoàn thành transition sau 3s
        setTimeout(() => {
          onComplete();
        }, 3000);

        return () => clearInterval(progressInterval);
      }, 1000);
    }
  }, [visible, previousRoundStats, onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="border-0 bg-card rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 20 }}
                className="flex justify-center mb-4"
              >
                <div className="p-4 rounded-full bg-primary/10">
                  <Target className="h-12 w-12 text-primary" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Hoàn thành Vòng {currentRound - 1}
              </h2>
              <p className="text-muted-foreground">
                Chuẩn bị chuyển sang vòng tiếp theo
              </p>
            </div>

            {/* Previous Round Stats */}
            {previousRoundStats && showStats && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="grid grid-cols-3 gap-4 mb-6"
              >
                <div className="text-center p-4 bg-card rounded-xl border-0">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {previousRoundStats.attempted}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Bỏ qua
                  </p>
                </div>
                <div className="text-center p-4 bg-card rounded-xl border-0">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {previousRoundStats.correct}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Câu đúng
                  </p>
                </div>
                <div className="text-center p-4 bg-card rounded-xl border-0">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {previousRoundStats.incorrect}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Câu sai
                  </p>
                </div>
              </motion.div>
            )}

            {/* Next Round Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-center p-6 rounded-2xl border bg-primary/5 mb-6"
            >
              <div className="text-lg font-semibold text-foreground mb-2">
                {roundConfig.name}
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-primary font-medium">
                  {questionsInRound} câu hỏi
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoundTransition;
