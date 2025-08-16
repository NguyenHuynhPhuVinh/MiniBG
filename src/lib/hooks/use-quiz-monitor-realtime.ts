/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { quizService } from "@/lib/services/api";
import socketService from "@/lib/services/socket";
import quizSocketService from "@/lib/services/socket/quiz";
import { toast } from "sonner";

// Types cho realtime monitoring
export interface QuizStatistics {
  total_participants: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  completion_rate: number;
}

export interface RealtimeScore {
  user_id: string;
  score: number;
  name?: string;
}

export interface StudentDetailData {
  user_id: string;
  current_score: number;
  correct_answers: number;
  total_answers: number;
  status: string;
  answer_history: Array<{
    question_id: number;
    is_correct: boolean;
    timestamp: number;
    answer_time: number;
  }>;
}

export interface TeacherUpdatesEvent {
  quiz_id: number;
  scores?: RealtimeScore[];
  statistics?: QuizStatistics;
  detailed_scores?: any;
  timestamp: number;
}

export interface NewParticipantEvent {
  quiz_id: number;
  participant: {
    user_id: number;
    name: string;
    join_time: string;
  };
}

export interface ParticipantLeftEvent {
  quiz_id: number;
  participant: {
    user_id: number;
    name: string;
    leave_time: string;
  };
}

export const useQuizMonitorRealtime = (quizId: number) => {
  const [statistics, setStatistics] = useState<QuizStatistics | null>(null);
  const [realtimeScores, setRealtimeScores] = useState<RealtimeScore[]>([]);
  const [selectedStudentData, setSelectedStudentData] =
    useState<StudentDetailData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Component ID để quản lý event listeners
  const componentId = `quiz_monitor_${quizId}_${Date.now()}`;

  // Kết nối socket
  useEffect(() => {
    socketService.connect();
    setIsConnected(socketService.isSocketConnected());

    // Tham gia phòng giáo viên
    quizSocketService.joinTeacherRoom(quizId);

    return () => {
      // Cleanup khi component unmount
      quizSocketService.offAllQuizEvents(componentId);
    };
  }, [quizId, componentId]);

  // Lắng nghe sự kiện teacher updates
  useEffect(() => {
    const handleTeacherUpdates = (data: TeacherUpdatesEvent) => {
      console.log("Received teacher updates:", data);

      if (data.statistics) {
        setStatistics(data.statistics);
      }

      if (data.scores) {
        setRealtimeScores(data.scores);
      }
    };

    socketService.on<TeacherUpdatesEvent>(
      "teacherUpdates",
      componentId,
      handleTeacherUpdates
    );

    return () => {
      socketService.off("teacherUpdates", componentId);
    };
  }, [componentId]);

  // Lắng nghe sự kiện participant mới
  useEffect(() => {
    const handleNewParticipant = (data: NewParticipantEvent) => {
      console.log("New participant joined:", data);
      const message = `${data.participant.name} đã tham gia bài kiểm tra`;
      setNotifications((prev) => [message, ...prev.slice(0, 4)]); // Giữ tối đa 5 thông báo
      toast.success(message);
    };

    socketService.on<NewParticipantEvent>(
      "newParticipant",
      componentId,
      handleNewParticipant
    );

    return () => {
      socketService.off("newParticipant", componentId);
    };
  }, [componentId]);

  // Lắng nghe sự kiện participant rời
  useEffect(() => {
    const handleParticipantLeft = (data: ParticipantLeftEvent) => {
      console.log("Participant left:", data);
      const message = `${data.participant.name} đã rời khỏi bài kiểm tra`;
      setNotifications((prev) => [message, ...prev.slice(0, 4)]);
      toast.info(message);
    };

    socketService.on<ParticipantLeftEvent>(
      "participantLeft",
      componentId,
      handleParticipantLeft
    );

    return () => {
      socketService.off("participantLeft", componentId);
    };
  }, [componentId]);

  // Fetch thống kê ban đầu
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await quizService.getQuizStatistics(quizId);
      console.log("Quiz Statistics API Response:", response);

      if (response?.success && response?.data) {
        setStatistics(response.data.statistics || response.data);
      } else {
        console.warn(
          "Unexpected quiz statistics response structure:",
          response
        );
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Không thể tải thống kê");
    }
  }, [quizId]);

  // Fetch điểm số realtime ban đầu
  const fetchRealtimeScores = useCallback(async () => {
    try {
      const response = await quizService.getRealtimeScores(quizId);
      console.log("Realtime Scores API Response:", response);

      if (response?.success && response?.data) {
        setRealtimeScores(response.data.scores || response.data);
      } else {
        console.warn(
          "Unexpected realtime scores response structure:",
          response
        );
      }
    } catch (err) {
      console.error("Error fetching realtime scores:", err);
      setError("Không thể tải điểm số realtime");
    }
  }, [quizId]);

  // Fetch chi tiết học sinh
  const fetchStudentDetail = useCallback(
    async (userId: string) => {
      try {
        const response = await quizService.getStudentRealtimeData(
          quizId,
          userId
        );
        setSelectedStudentData(response.student);
      } catch (err) {
        console.error("Error fetching student detail:", err);
        setError("Không thể tải chi tiết học sinh");
      }
    },
    [quizId]
  );

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (quizId) {
      fetchStatistics();
      fetchRealtimeScores();
    }
  }, [quizId, fetchStatistics, fetchRealtimeScores]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear selected student
  const clearSelectedStudent = useCallback(() => {
    setSelectedStudentData(null);
  }, []);

  return {
    // Data
    statistics,
    realtimeScores,
    selectedStudentData,
    notifications,

    // Status
    isConnected,
    error,

    // Actions
    fetchStatistics,
    fetchRealtimeScores,
    fetchStudentDetail,
    clearNotifications,
    clearSelectedStudent,
  };
};
