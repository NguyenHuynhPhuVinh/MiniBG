import { z } from "zod";

// Schema validation cho form tạo quiz
export const createQuizSchema = z.object({
  subject_id: z.number({
    required_error: "Vui lòng chọn môn học",
  }),
  name: z.string().min(3, "Tên bài kiểm tra phải có ít nhất 3 ký tự"),
  duration: z
    .number({
      required_error: "Vui lòng nhập thời gian làm bài",
      invalid_type_error: "Thời gian phải là số phút",
    })
    .min(1, "Thời gian tối thiểu là 1 phút"),
  question_criteria: z.object({
    loIds: z.array(z.number()).min(1, "Chọn ít nhất một mục tiêu học tập"),
    totalQuestions: z
      .number({
        required_error: "Vui lòng nhập số lượng câu hỏi",
      })
      .min(1, "Phải có ít nhất 1 câu hỏi"),
    difficultyRatio: z
      .object({
        easy: z.number().min(0).max(100),
        medium: z.number().min(0).max(100),
        hard: z.number().min(0).max(100),
      })
      .refine((data) => data.easy + data.medium + data.hard === 100, {
        message: "Tổng tỷ lệ phải bằng 100%",
      }),
    type: z.number().optional(),
  }),
});
