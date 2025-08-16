import { useState, useEffect, useCallback } from "react";
import quizService from "@/lib/services";

interface UseQuizTimerProps {
  quizId: number;
  quizCompleted: boolean;
  onTimeUp: () => void;
  onTimeChange?: (timeLeft: number) => void;
  initialTimeLeft?: number;
}

interface UseQuizTimerReturn {
  quizTimeLeft: number;
  formatTime: (seconds: number) => string;
}

export const useQuizTimer = ({
  quizId,
  quizCompleted,
  onTimeUp,
  onTimeChange,
  initialTimeLeft,
}: UseQuizTimerProps): UseQuizTimerReturn => {
  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(
    initialTimeLeft ?? 3600
  ); // Mặc định 60 phút (3600 giây) hoặc giá trị khôi phục

  // Format thời gian từ giây sang định dạng MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Gọi onTimeChange khi thời gian thay đổi
  useEffect(() => {
    if (onTimeChange) {
      onTimeChange(quizTimeLeft);
    }
  }, [quizTimeLeft, onTimeChange]);

  // Đồng hồ đếm ngược cho cả bài quiz (chỉ fetch khi chưa có initialTimeLeft)
  useEffect(() => {
    if (initialTimeLeft !== undefined) {
      // Đã có thời gian khôi phục, không cần fetch từ API
      return;
    }

    // Lấy thời gian từ API quiz
    const fetchQuizTime = async () => {
      try {
        // Lấy thông tin chi tiết của quiz từ API
        const response = await quizService.getQuizById(quizId);
        console.log("Thông tin quiz:", response);

        // Lấy thời gian từ trường duration trong quiz
        if (response.quiz && response.quiz.duration) {
          // Thời gian được trả về bằng phút, chuyển sang giây
          const durationInMinutes = parseInt(response.quiz.duration);
          const durationInSeconds = durationInMinutes * 60;

          setQuizTimeLeft(durationInSeconds);
          console.log(
            `Đã thiết lập thời gian làm bài: ${durationInMinutes} phút (${durationInSeconds} giây)`
          );
        } else if (response.duration) {
          // Trường hợp trường duration nằm trực tiếp trong response
          const durationInMinutes = parseInt(response.duration);
          const durationInSeconds = durationInMinutes * 60;

          setQuizTimeLeft(durationInSeconds);
          console.log(
            `Đã thiết lập thời gian làm bài: ${durationInMinutes} phút (${durationInSeconds} giây)`
          );
        } else {
          // Nếu không tìm thấy thông tin thời gian, sử dụng mặc định 60 phút
          setQuizTimeLeft(3600);
          console.log(
            "Không tìm thấy thời gian trong API, sử dụng mặc định 60 phút"
          );
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin quiz:", err);
        setQuizTimeLeft(3600); // Mặc định 60 phút nếu có lỗi
      }
    };

    fetchQuizTime();
  }, [quizId, initialTimeLeft]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (quizTimeLeft <= 0 || quizCompleted) return;

    const timer = setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Tự động nộp bài khi hết thời gian
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizTimeLeft, quizCompleted, onTimeUp]);

  return {
    quizTimeLeft,
    formatTime,
  };
};
