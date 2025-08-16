import * as z from "zod";

// ===== PROGRAM VALIDATION SCHEMAS =====

export const programCreateSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Tên chương trình phải có ít nhất 2 ký tự.",
    })
    .max(255, {
      message: "Tên chương trình không được vượt quá 255 ký tự.",
    }),
  description: z.string().optional(),
});

export const programUpdateSchema = programCreateSchema.partial();

// ===== PO VALIDATION SCHEMAS =====

export const poCreateSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Tên chuẩn đầu ra chương trình phải có ít nhất 2 ký tự.",
    })
    .max(255, {
      message: "Tên chuẩn đầu ra chương trình không được vượt quá 255 ký tự.",
    }),
  description: z.string().optional(),
  code: z
    .string()
    .min(2, {
      message: "Mã chuẩn đầu ra chương trình phải có ít nhất 2 ký tự.",
    })
    .max(50, {
      message: "Mã chuẩn đầu ra chương trình không được vượt quá 50 ký tự.",
    })
    .optional(),
  program_id: z
    .number({
      required_error: "Vui lòng chọn chương trình.",
      invalid_type_error: "ID chương trình phải là số.",
    })
    .positive({
      message: "ID chương trình phải là số dương.",
    }),
});

export const poUpdateSchema = poCreateSchema.partial().extend({
  program_id: z.number().positive().optional(),
});

// ===== PLO VALIDATION SCHEMAS =====

export const ploCreateSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Tên chuẩn đầu ra học phần phải có ít nhất 2 ký tự.",
    })
    .max(255, {
      message: "Tên chuẩn đầu ra học phần không được vượt quá 255 ký tự.",
    }),
  description: z.string().optional(),
  code: z
    .string()
    .min(2, {
      message: "Mã chuẩn đầu ra học phần phải có ít nhất 2 ký tự.",
    })
    .max(50, {
      message: "Mã chuẩn đầu ra học phần không được vượt quá 50 ký tự.",
    })
    .optional(),
  program_id: z
    .number({
      required_error: "Vui lòng chọn chương trình.",
      invalid_type_error: "ID chương trình phải là số.",
    })
    .positive({
      message: "ID chương trình phải là số dương.",
    }),
  po_id: z
    .number({
      invalid_type_error: "ID chuẩn đầu ra chương trình phải là số.",
    })
    .positive({
      message: "ID chuẩn đầu ra chương trình phải là số dương.",
    })
    .optional(),
});

export const ploUpdateSchema = ploCreateSchema.partial().extend({
  program_id: z.number().positive().optional(),
});

// ===== COURSE VALIDATION SCHEMAS =====

export const courseCreateSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Tên học phần phải có ít nhất 2 ký tự.",
    })
    .max(255, {
      message: "Tên học phần không được vượt quá 255 ký tự.",
    }),
  description: z.string().optional(),
  code: z
    .string()
    .min(2, {
      message: "Mã học phần phải có ít nhất 2 ký tự.",
    })
    .max(50, {
      message: "Mã học phần không được vượt quá 50 ký tự.",
    })
    .optional(),
  credits: z
    .number()
    .min(1, {
      message: "Số tín chỉ phải ít nhất 1.",
    })
    .max(10, {
      message: "Số tín chỉ không được vượt quá 10.",
    })
    .optional(),
  semester: z
    .number()
    .min(1, {
      message: "Học kỳ phải ít nhất 1.",
    })
    .max(3, {
      message: "Học kỳ không được vượt quá 3.",
    })
    .optional(),
  year: z
    .number()
    .min(2020, {
      message: "Năm học phải từ 2020 trở lên.",
    })
    .max(2030, {
      message: "Năm học không được vượt quá 2030.",
    })
    .optional(),
  teacher_id: z
    .number({
      invalid_type_error: "ID giảng viên phải là số.",
    })
    .positive({
      message: "ID giảng viên phải là số dương.",
    })
    .optional(),
  program_id: z
    .number({
      invalid_type_error: "ID chương trình phải là số.",
    })
    .positive({
      message: "ID chương trình phải là số dương.",
    })
    .optional(),
});

export const courseUpdateSchema = courseCreateSchema.partial();

// ===== PAGINATION VALIDATION SCHEMAS =====

export const paginationSchema = z.object({
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
});

// ===== FILTER VALIDATION SCHEMAS =====

export const programFilterSchema = paginationSchema.extend({
  duration_years: z.number().min(1).max(10).optional(),
});

export const poFilterSchema = paginationSchema.extend({
  program_id: z.number().positive().optional(),
});

export const ploFilterSchema = paginationSchema.extend({
  program_id: z.number().positive().optional(),
  po_id: z.number().positive().optional(),
});

export const courseFilterSchema = paginationSchema.extend({
  teacher_id: z.number().positive().optional(),
  program_id: z.number().positive().optional(),
  semester: z.number().min(1).max(3).optional(),
  year: z.number().min(2020).max(2030).optional(),
  credits: z.number().min(1).max(10).optional(),
});

// ===== TYPE EXPORTS =====

export type ProgramCreateFormData = z.infer<typeof programCreateSchema>;
export type ProgramUpdateFormData = z.infer<typeof programUpdateSchema>;
export type POCreateFormData = z.infer<typeof poCreateSchema>;
export type POUpdateFormData = z.infer<typeof poUpdateSchema>;
export type PLOCreateFormData = z.infer<typeof ploCreateSchema>;
export type PLOUpdateFormData = z.infer<typeof ploUpdateSchema>;
export type CourseCreateFormData = z.infer<typeof courseCreateSchema>;
export type CourseUpdateFormData = z.infer<typeof courseUpdateSchema>;
export type PaginationFormData = z.infer<typeof paginationSchema>;
export type ProgramFilterFormData = z.infer<typeof programFilterSchema>;
export type POFilterFormData = z.infer<typeof poFilterSchema>;
export type PLOFilterFormData = z.infer<typeof ploFilterSchema>;
export type CourseFilterFormData = z.infer<typeof courseFilterSchema>;
