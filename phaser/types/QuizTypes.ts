/**
 * 🧠 QUIZ TYPES - Định nghĩa các kiểu dữ liệu cho hệ thống Quiz
 *
 * CHỨC NĂNG:
 * - Định nghĩa cấu trúc câu hỏi và session cho Phaser
 * - Type safety cho quiz data
 * - Config cho QuizManager
 */

// === CÂU HỎI QUIZ ===
export interface QuizQuestion {
  id: string;                    // ID duy nhất của câu hỏi
  question: string;              // Nội dung câu hỏi
  answers: string[];             // Mảng 4 đáp án (A, B, C, D)
  correctAnswer: number;         // Index của đáp án đúng (0-3)
  explanation?: string;          // Giải thích đáp án (tùy chọn)
  difficulty?: 'easy' | 'medium' | 'hard'; // Độ khó câu hỏi
  category?: string;             // Danh mục câu hỏi
}

// === PHIÊN QUIZ ===
export interface QuizSession {
  questions: QuizQuestion[];     // Danh sách câu hỏi trong phiên
  currentQuestionIndex: number;  // Index câu hỏi hiện tại
  startTime: number;             // Thời gian bắt đầu quiz (timestamp)
  isCompleted: boolean;          // Đã hoàn thành quiz chưa
}

// === CẤU HÌNH QUIZ ===
export interface QuizConfig {
  maxQuestions?: number;         // Số câu hỏi tối đa (mặc định: 3)
  timeLimit?: number;            // Giới hạn thời gian (ms, 0 = không giới hạn)
  showExplanation?: boolean;     // Hiển thị giải thích (mặc định: true)
  allowRetry?: boolean;          // Cho phép làm lại (mặc định: false)
  randomOrder?: boolean;         // Trộn thứ tự câu hỏi (mặc định: true)
}


