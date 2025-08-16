import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionTransitionProps {
  questionIndex: number;
  totalQuestions: number;
  onComplete: () => void;
  visible: boolean;
}

export const QuestionTransition: React.FC<QuestionTransitionProps> = ({
  questionIndex,
  totalQuestions,
  onComplete,
  visible,
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Điều khiển trạng thái hiển thị để animation thoát hoạt động đúng
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      // Bắt đầu animation progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 4; // Tốc độ điền progress
        });
      }, 25);

      // Thời gian hiển thị animation
      const completeTimer = setTimeout(() => {
        // Trigger animation thoát
        setIsVisible(false);

        // Đợi animation thoát chạy xong rồi mới gọi onComplete
        setTimeout(() => {
          onComplete();
        }, 500); // 500ms để animation thoát chạy xong
      }, 1500);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(completeTimer);
      };
    }
  }, [visible, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.4,
              ease: "easeOut",
            },
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex flex-col items-center justify-center h-screen"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 1.1,
              opacity: 0,
              transition: {
                duration: 0.4,
                ease: "easeOut",
              },
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
          >
            <motion.div
              className="flex items-end justify-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{
                y: -30,
                opacity: 0,
                transition: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 200,
                delay: 0.1,
              }}
            >
              <motion.span
                className="text-[10rem] sm:text-[12rem] md:text-[16rem] font-extrabold text-primary leading-none"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{
                  scale: 0.8,
                  opacity: 0,
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                }}
                transition={{
                  type: "spring",
                  damping: 12,
                  stiffness: 150,
                  delay: 0.15,
                }}
              >
                {questionIndex + 1}
              </motion.span>
              <motion.span
                className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-medium text-gray-400 pb-4 ml-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: -10,
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.25,
                }}
              >
                /{totalQuestions}
              </motion.span>
            </motion.div>

            {/* Progress Bar Animation */}
            <motion.div
              className="mt-20 w-full flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: 10,
                transition: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-[200px] sm:w-[300px] md:w-[400px] h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  exit={{
                    width: "100%",
                    transition: {
                      duration: 0.4,
                      ease: "easeOut",
                    },
                  }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionTransition;
