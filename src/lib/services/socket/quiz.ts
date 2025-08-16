import socketService from "./index";
import {
  Question,
  NewParticipantEvent,
  ParticipantsUpdateEvent,
} from "@/lib/types/quiz";

export interface QuizStartedEvent {
  quiz_id: number | string;
  name: string;
  start_time: string;
  end_time: string;
  pin: string;
  current_question: Question;
  total_questions: number;
  current_question_index: number;
}

export interface NewQuestionEvent {
  quiz_id: number | string;
  current_question?: Question;
  current_question_index: number;
  total_questions?: number;
  question?: Question;
  is_last_question?: boolean;
  userId?: string | number;
  question_start_time?: number;
}

export interface LeaderboardUpdateEvent {
  quiz_id: number | string;
  leaderboard: Array<{
    user_id: string | number;
    score: number;
    name?: string;
  }>;
  current_question_index: number;
  userId?: string | number;
  isLastQuestion?: boolean;
  duration?: number;
  show_animation?: boolean;
}

export interface QuizCompletedEvent {
  quiz_id: number | string;
  final_score: number;
}

export interface UserPositionUpdateEvent {
  quizId: number | string;
  userId: string | number;
  position: number;
  score: number;
  totalParticipants: number;
}

export interface RestoreProgressEvent {
  quiz_id: number | string;
  current_question?: Question;
  current_question_index: number;
  total_questions: number;
  score?: number;
  correct_answers?: number;
  total_answers?: number;
  answered_questions?: Record<
    string,
    {
      answer_id?: number;
      is_correct?: boolean;
      answer_time?: number;
    }
  >;
}

export interface RestoreQuestionTimerEvent {
  quiz_id: number | string;
  remaining_time: number;
  question_index: number;
}

export interface RestoreStateEvent {
  quiz_id: number | string;
  current_question?: Question;
  current_question_index: number;
  total_questions: number;
  question_start_time?: number;
}

class QuizSocketService {
  // Tham gia phòng quiz (chung)
  joinQuizRoom(quizId: number): void {
    socketService.joinRoom(`quiz:${quizId}`);
  }

  // Tham gia phòng giáo viên trong quiz
  joinTeacherRoom(quizId: number): void {
    socketService.joinRoom(`quiz:${quizId}:teachers`);
  }

  // Tham gia phòng học sinh trong quiz
  joinStudentRoom(quizId: number): void {
    socketService.joinRoom(`quiz:${quizId}:students`);
  }

  // Tham gia phòng cá nhân
  joinPersonalRoom(quizId: number, userId: string | number): void {
    socketService.joinRoom(`quiz:${quizId}:${userId}`);
  }

  // Tham gia tất cả các phòng liên quan đến quiz
  joinAllQuizRooms(
    quizId: number,
    isTeacher: boolean,
    userId?: string | number
  ): void {
    this.joinQuizRoom(quizId);
    if (isTeacher) {
      this.joinTeacherRoom(quizId);
    } else {
      this.joinStudentRoom(quizId);
    }
    if (userId) {
      this.joinPersonalRoom(quizId, userId);
    }
  }

  // Lắng nghe sự kiện quiz bắt đầu
  onQuizStarted(
    quizId: number,
    listenerId: string,
    callback: (data: QuizStartedEvent) => void
  ): void {
    socketService.on<QuizStartedEvent>("quizStarted", listenerId, (data) => {
      if (
        data &&
        data.quiz_id &&
        parseInt(data.quiz_id.toString()) === quizId
      ) {
        callback(data);
      }
    });
  }

  // Lắng nghe sự kiện câu hỏi mới
  onNewQuestion(
    quizId: number,
    listenerId: string,
    callback: (data: NewQuestionEvent) => void
  ): void {
    socketService.on<NewQuestionEvent>("newQuestion", listenerId, (data) => {
      if (
        data &&
        data.quiz_id &&
        parseInt(data.quiz_id.toString()) === quizId
      ) {
        callback(data);
      }
    });
  }

  // Lắng nghe sự kiện câu hỏi tiếp theo
  onNextQuestion(
    quizId: number,
    listenerId: string,
    callback: (data: NewQuestionEvent) => void
  ): void {
    socketService.on<NewQuestionEvent>("nextQuestion", listenerId, (data) => {
      if (
        data &&
        data.quiz_id &&
        parseInt(data.quiz_id.toString()) === quizId
      ) {
        callback(data);
      }
    });
  }

  // Lắng nghe sự kiện quiz hoàn thành
  onQuizCompleted(
    quizId: number,
    listenerId: string,
    callback: (data: QuizCompletedEvent) => void
  ): void {
    socketService.on<QuizCompletedEvent>(
      "quizCompleted",
      listenerId,
      (data) => {
        if (
          data &&
          data.quiz_id &&
          parseInt(data.quiz_id.toString()) === quizId
        ) {
          callback(data);
        }
      }
    );
  }

  // Lắng nghe sự kiện người tham gia mới
  onNewParticipant(
    quizId: number,
    listenerId: string,
    callback: (data: NewParticipantEvent) => void
  ): void {
    socketService.on<NewParticipantEvent>(
      "newParticipant",
      listenerId,
      (data) => {
        if (
          data &&
          data.quiz_id &&
          parseInt(data.quiz_id.toString()) === quizId
        ) {
          callback(data);
        }
      }
    );
  }

  // Lắng nghe sự kiện cập nhật danh sách người tham gia
  onParticipantsUpdate(
    quizId: number,
    listenerId: string,
    callback: (data: ParticipantsUpdateEvent) => void
  ): void {
    socketService.on<ParticipantsUpdateEvent>(
      "quizParticipantsUpdate",
      listenerId,
      (data) => {
        if (
          data &&
          data.quiz_id &&
          parseInt(data.quiz_id.toString()) === quizId
        ) {
          callback(data);
        }
      }
    );
  }

  // Lắng nghe sự kiện cập nhật bảng xếp hạng
  onLeaderboardUpdate(
    quizId: number,
    listenerId: string,
    callback: (data: LeaderboardUpdateEvent) => void
  ): void {
    socketService.on<LeaderboardUpdateEvent>(
      "leaderboardUpdate",
      listenerId,
      (data) => {
        if (
          data &&
          data.quiz_id &&
          parseInt(data.quiz_id.toString()) === quizId
        ) {
          callback(data);
        }
      }
    );
  }

  // Lắng nghe sự kiện hiển thị bảng xếp hạng sau mỗi câu hỏi
  onShowLeaderboard(
    quizId: number,
    listenerId: string,
    callback: (data: LeaderboardUpdateEvent) => void
  ): void {
    socketService.on<LeaderboardUpdateEvent>(
      "showLeaderboard",
      listenerId,
      (data) => {
        if (
          data &&
          data.quiz_id &&
          parseInt(data.quiz_id.toString()) === quizId
        ) {
          callback(data);
        }
      }
    );
  }

  // Lắng nghe sự kiện khôi phục tiến độ làm bài
  onRestoreProgress(
    quizId: number,
    listenerId: string,
    callback: (data: RestoreProgressEvent) => void
  ): void {
    socketService.on<RestoreProgressEvent>(
      "restoreProgress",
      listenerId,
      (data) => {
        if (
          data &&
          data.quiz_id &&
          parseInt(data.quiz_id.toString()) === quizId
        ) {
          callback(data);
        }
      }
    );
  }

  // Lắng nghe sự kiện khôi phục thời gian câu hỏi
  onRestoreQuestionTimer(
    quizId: number,
    listenerId: string,
    callback: (data: RestoreQuestionTimerEvent) => void
  ): void {
    socketService.on<RestoreQuestionTimerEvent>(
      "restoreQuestionTimer",
      listenerId,
      (data) => {
        if (
          data &&
          data.quiz_id &&
          parseInt(data.quiz_id.toString()) === quizId
        ) {
          callback(data);
        }
      }
    );
  }

  // Lắng nghe sự kiện cập nhật vị trí người dùng
  onUserPositionUpdate(
    quizId: number,
    listenerId: string,
    callback: (data: UserPositionUpdateEvent) => void
  ): void {
    socketService.on<UserPositionUpdateEvent>(
      "userPositionUpdate",
      listenerId,
      (data) => {
        if (
          data &&
          data.quizId &&
          parseInt(data.quizId.toString()) === quizId
        ) {
          callback(data);
        }
      }
    );
  }

  // Lắng nghe sự kiện khôi phục trạng thái sau khi kết nối lại
  onRestoreState(
    quizId: number,
    listenerId: string,
    callback: (data: RestoreStateEvent) => void
  ): void {
    socketService.on<RestoreStateEvent>("restoreState", listenerId, (data) => {
      if (
        data &&
        data.quiz_id &&
        parseInt(data.quiz_id.toString()) === quizId
      ) {
        callback(data);
      }
    });
  }

  // Hủy lắng nghe sự kiện
  offEvent(event: string, listenerId: string): void {
    socketService.off(event, listenerId);
  }

  // Hủy tất cả lắng nghe liên quan đến quiz
  offAllQuizEvents(listenerId: string): void {
    this.offEvent("quizStarted", listenerId);
    this.offEvent("newQuestion", listenerId);
    this.offEvent("nextQuestion", listenerId);
    this.offEvent("newParticipant", listenerId);
    this.offEvent("quizParticipantsUpdate", listenerId);
    this.offEvent("leaderboardUpdate", listenerId);
    this.offEvent("showLeaderboard", listenerId);
    this.offEvent("participantLeft", listenerId);
    this.offEvent("quizCompleted", listenerId);
    this.offEvent("restoreProgress", listenerId);
    this.offEvent("restoreQuestionTimer", listenerId);
    this.offEvent("restoreState", listenerId);
    this.offEvent("userPositionUpdate", listenerId);
  }
}

export default new QuizSocketService();
