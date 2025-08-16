import * as z from "zod";

// ===== GRADE COLUMN VALIDATION SCHEMAS =====

export const gradeColumnCreateSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Tên cột điểm phải có ít nhất 2 ký tự.",
    })
    .max(100, {
      message: "Tên cột điểm không được vượt quá 100 ký tự.",
    }),
  weight: z
    .number({
      required_error: "Vui lòng nhập trọng số.",
      invalid_type_error: "Trọng số phải là số.",
    })
    .min(0.01, {
      message: "Trọng số phải ít nhất 0.01%.",
    })
    .max(100, {
      message: "Trọng số không được vượt quá 100%.",
    }),
  description: z
    .string()
    .max(500, {
      message: "Mô tả không được vượt quá 500 ký tự.",
    })
    .optional(),
  course_id: z
    .number({
      required_error: "ID khóa học là bắt buộc.",
      invalid_type_error: "ID khóa học phải là số.",
    })
    .positive({
      message: "ID khóa học phải là số dương.",
    }),
});

export const gradeColumnUpdateSchema = gradeColumnCreateSchema
  .partial()
  .extend({
    column_id: z
      .number({
        required_error: "ID cột điểm là bắt buộc.",
        invalid_type_error: "ID cột điểm phải là số.",
      })
      .positive({
        message: "ID cột điểm phải là số dương.",
      }),
  });

// ===== QUIZ ASSIGNMENT VALIDATION SCHEMAS =====

export const quizAssignmentSchema = z.object({
  quiz_ids: z.array(z.number().positive()).min(0, {
    message: "Danh sách quiz không hợp lệ.",
  }),
});

// New validation schemas for updated Quiz Assignment API
export const quizAssignmentWithWeightSchema = z.object({
  quiz_id: z
    .number({
      required_error: "ID quiz là bắt buộc.",
      invalid_type_error: "ID quiz phải là số.",
    })
    .positive({
      message: "ID quiz phải là số dương.",
    }),
  weight_percentage: z
    .number({
      invalid_type_error: "Tỷ lệ phần trăm phải là số.",
    })
    .min(0.01, {
      message: "Tỷ lệ phần trăm phải ít nhất 0.01%.",
    })
    .max(100, {
      message: "Tỷ lệ phần trăm không được vượt quá 100%.",
    })
    .optional(),
});

export const quizAssignmentWithWeightRequestSchema = z
  .object({
    quiz_assignments: z
      .array(quizAssignmentWithWeightSchema)
      .min(1, {
        message: "Phải có ít nhất 1 quiz để gán.",
      })
      .max(50, {
        message: "Không thể gán quá 50 quiz cho một cột điểm.",
      }),
  })
  .refine(
    (data) => {
      // Check if all assignments have weight_percentage or none have it
      const withWeight = data.quiz_assignments.filter(
        (assignment) => assignment.weight_percentage !== undefined
      );
      const withoutWeight = data.quiz_assignments.filter(
        (assignment) => assignment.weight_percentage === undefined
      );

      // Either all have weight or none have weight
      return withWeight.length === 0 || withoutWeight.length === 0;
    },
    {
      message:
        "Tất cả quiz phải có tỷ lệ phần trăm hoặc tất cả đều không có tỷ lệ phần trăm.",
    }
  )
  .refine(
    (data) => {
      // If using weights, total must equal 100%
      const withWeight = data.quiz_assignments.filter(
        (assignment) => assignment.weight_percentage !== undefined
      );

      if (withWeight.length === 0) return true; // No weights, skip validation

      const total = withWeight.reduce(
        (sum, assignment) => sum + (assignment.weight_percentage || 0),
        0
      );

      return Math.abs(total - 100) <= 0.01; // Allow small floating point errors
    },
    {
      message: "Tổng tỷ lệ phần trăm phải bằng 100%.",
    }
  );

export const unassignQuizzesSchema = z.object({
  quiz_ids: z
    .array(z.number().positive())
    .min(1, {
      message: "Phải chọn ít nhất 1 quiz để bỏ gán.",
    })
    .max(50, {
      message: "Không thể bỏ gán quá 50 quiz cùng lúc.",
    }),
});

// ===== GRADE CALCULATION VALIDATION SCHEMAS =====

export const gradeCalculationSchema = z.object({
  student_ids: z.array(z.number().positive()).optional(),
  recalculate_all: z.boolean().optional(),
});

export const finalExamScoreUpdateSchema = z.object({
  student_id: z
    .number({
      required_error: "ID sinh viên là bắt buộc.",
      invalid_type_error: "ID sinh viên phải là số.",
    })
    .positive({
      message: "ID sinh viên phải là số dương.",
    }),
  final_exam_score: z
    .number({
      required_error: "Điểm thi cuối kỳ là bắt buộc.",
      invalid_type_error: "Điểm thi cuối kỳ phải là số.",
    })
    .min(0, {
      message: "Điểm thi cuối kỳ phải từ 0 trở lên.",
    })
    .max(10, {
      message: "Điểm thi cuối kỳ không được vượt quá 10.",
    }),
});

// ===== EXPORT VALIDATION SCHEMAS =====

export const exportRequestSchema = z.object({
  format: z.enum(["json", "excel"], {
    required_error: "Vui lòng chọn định dạng xuất.",
    invalid_type_error: "Định dạng xuất không hợp lệ.",
  }),
  include_student_details: z.boolean().optional(),
  include_grade_breakdown: z.boolean().optional(),
});

// ===== FILTER AND PAGINATION SCHEMAS =====

export const gradeColumnFilterSchema = z.object({
  page: z
    .number()
    .min(1, {
      message: "Trang phải ít nhất 1.",
    })
    .optional(),
  limit: z
    .number()
    .min(1, {
      message: "Giới hạn phải ít nhất 1.",
    })
    .max(100, {
      message: "Giới hạn không được vượt quá 100.",
    })
    .optional(),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(["ASC", "DESC"]).optional(),
  course_id: z.number().positive().optional(),
});

export const availableQuizFilterSchema = z.object({
  page: z
    .number()
    .min(1, {
      message: "Trang phải ít nhất 1.",
    })
    .optional(),
  limit: z
    .number()
    .min(1, {
      message: "Giới hạn phải ít nhất 1.",
    })
    .max(100, {
      message: "Giới hạn không được vượt quá 100.",
    })
    .optional(),
  search: z.string().optional(),
  subject_id: z.number().positive().optional(),
  status: z.enum(["pending", "active", "finished"]).optional(),
  exclude_assigned: z.boolean().optional(),
});

// ===== FORM DATA TYPES =====

export type GradeColumnFormData = z.infer<typeof gradeColumnCreateSchema>;
export type GradeColumnUpdateFormData = z.infer<typeof gradeColumnUpdateSchema>;
export type QuizAssignmentFormData = z.infer<typeof quizAssignmentSchema>;
export type GradeCalculationFormData = z.infer<typeof gradeCalculationSchema>;
export type FinalExamScoreFormData = z.infer<typeof finalExamScoreUpdateSchema>;
export type ExportFormData = z.infer<typeof exportRequestSchema>;
export type GradeColumnFilterFormData = z.infer<typeof gradeColumnFilterSchema>;
export type AvailableQuizFilterFormData = z.infer<
  typeof availableQuizFilterSchema
>;
