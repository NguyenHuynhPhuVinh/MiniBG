/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import quizService from "@/lib/services";
import quizSocketService from "@/lib/services/socket/quiz";

// Định nghĩa interface cho item trong leaderboard
interface LeaderboardItem {
  user_id: string | number;
  score: number;
  name?: string;
  student_id?: string;
}

interface UseQuizSocketProps {
  quizId: number;
  user: any;
  questionsLength: number;
}

interface UseQuizSocketReturn {
  userPosition: number | undefined;
  totalParticipants: number | undefined;
  updateUserPosition: () => Promise<void>;
}

export const useQuizSocket = ({
  quizId,
  user,
  questionsLength,
}: UseQuizSocketProps): UseQuizSocketReturn => {
  // State cho vị trí bảng xếp hạng realtime
  const [userPosition, setUserPosition] = useState<number | undefined>(
    undefined
  );
  const [totalParticipants, setTotalParticipants] = useState<
    number | undefined
  >(undefined);

  // Function để cập nhật vị trí bảng xếp hạng hiện tại
  const updateUserPosition = useCallback(async () => {
    try {
      if (!user?.user_id) return;

      console.log("Fetching current leaderboard for position update...");
      const response = await quizService.getLeaderboard(quizId);
      console.log("Leaderboard response for position:", response);

      if (response.data?.leaderboard && response.data.leaderboard.length > 0) {
        // Tìm vị trí của user hiện tại trong bảng xếp hạng
        const userIndex = response.data.leaderboard.findIndex(
          (item: LeaderboardItem) =>
            item.user_id.toString() === user.user_id.toString()
        );

        if (userIndex !== -1) {
          const position = userIndex + 1; // Vị trí bắt đầu từ 1
          const total = response.data.leaderboard.length;

          console.log(`User position updated: #${position}/${total}`);
          setUserPosition(position);
          setTotalParticipants(total);
        } else {
          console.log("User not found in leaderboard");
        }
      }
    } catch (error) {
      console.error("Error updating user position:", error);
    }
  }, [quizId, user?.user_id]);

  // Lấy vị trí ban đầu khi component mount
  useEffect(() => {
    if (user?.user_id && questionsLength > 0) {
      updateUserPosition();
    }
  }, [user?.user_id, questionsLength, updateUserPosition]);

  // Socket listener cho cập nhật vị trí realtime
  useEffect(() => {
    if (!user || !quizId) {
      console.log("Socket setup skipped - missing user or quizId:", {
        user: !!user,
        quizId,
      });
      return;
    }

    const listenerId = `quiz-live-${quizId}-${user.user_id}`;
    console.log("Setting up socket listeners with listenerId:", listenerId);

    // Tham gia phòng quiz
    quizSocketService.joinQuizRoom(quizId);
    quizSocketService.joinStudentRoom(quizId);
    quizSocketService.joinPersonalRoom(quizId, user.user_id);
    console.log(
      "Joined quiz rooms for quizId:",
      quizId,
      "userId:",
      user.user_id
    );

    // Lắng nghe sự kiện cập nhật vị trí người dùng
    quizSocketService.onUserPositionUpdate(quizId, listenerId, (data) => {
      console.log("Nhận được cập nhật vị trí:", data);
      console.log(
        "Current user ID:",
        user.user_id,
        "Event user ID:",
        data.userId
      );

      // Chỉ cập nhật nếu là vị trí của người dùng hiện tại
      if (data.userId.toString() === user.user_id.toString()) {
        console.log(
          "Updating position:",
          data.position,
          "Total participants:",
          data.totalParticipants
        );
        setUserPosition(data.position);
        setTotalParticipants(data.totalParticipants);

        // Hiển thị toast thông báo vị trí mới
        toast.success(
          `Vị trí hiện tại: #${data.position}/${data.totalParticipants}`
        );
      }
    });

    // Cleanup khi component unmount
    return () => {
      console.log("Cleaning up socket listeners");
      quizSocketService.offEvent("userPositionUpdate", listenerId);
    };
  }, [user, quizId, updateUserPosition]);

  return {
    userPosition,
    totalParticipants,
    updateUserPosition,
  };
};
