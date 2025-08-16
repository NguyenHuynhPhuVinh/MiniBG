import { z } from "zod";

// ===== GRADE COLUMN VALIDATION SCHEMA =====

export const gradeColumnSchema = z.object({
  column_name: z
    .string()
    .min(1, "Tên cột điểm là bắt buộc")
    .max(100, "Tên cột điểm không được vượt quá 100 ký tự")
    .trim(),
  weight_percentage: z
    .number()
    .min(0.01, "Trọng số phải lớn hơn 0")
    .max(100, "Trọng số không được vượt quá 100%")
    .refine((val) => Number.isFinite(val), "Trọng số phải là số hợp lệ"),
  description: z
    .string()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
});

// ===== COURSE CREATION VALIDATION SCHEMA =====

export const createCourseWithGradesSchema = z
  .object({
    // Course basic information
    name: z
      .string()
      .min(1, "Tên khóa học là bắt buộc")
      .max(200, "Tên khóa học không được vượt quá 200 ký tự")
      .trim(),
    description: z
      .string()
      .max(1000, "Mô tả không được vượt quá 1000 ký tự")
      .optional()
      .or(z.literal("")),
    credits: z
      .number()
      .int("Số tín chỉ phải là số nguyên")
      .min(1, "Số tín chỉ phải lớn hơn 0")
      .max(10, "Số tín chỉ không được vượt quá 10")
      .optional(),
    semester: z
      .number()
      .int("Học kỳ phải là số nguyên")
      .min(1, "Học kỳ phải từ 1 trở lên")
      .max(3, "Học kỳ không được vượt quá 3")
      .optional(),
    year: z
      .number()
      .int("Năm học phải là số nguyên")
      .min(2020, "Năm học phải từ 2020 trở lên")
      .max(2030, "Năm học không được vượt quá 2030")
      .optional(),
    start_date: z.string().optional().or(z.literal("")),
    end_date: z.string().optional().or(z.literal("")),
    program_id: z
      .number()
      .int("ID chương trình phải là số nguyên")
      .min(1, "Vui lòng chọn chương trình đào tạo"),

    // Grade columns array
    grade_columns: z
      .array(gradeColumnSchema)
      .min(1, "Phải có ít nhất 1 cột điểm")
      .max(10, "Không được có quá 10 cột điểm"),
  })
  .refine(
    (data) => {
      // Validate total weight equals 100%
      const totalWeight = data.grade_columns.reduce(
        (sum, col) => sum + (col.weight_percentage || 0),
        0
      );
      return Math.abs(totalWeight - 100) < 0.01; // Allow small floating point errors
    },
    {
      message: "Tổng trọng số các cột điểm phải bằng 100%",
      path: ["grade_columns"],
    }
  )
  .refine(
    (data) => {
      // Validate unique column names
      const columnNames = data.grade_columns.map((col) =>
        col.column_name.toLowerCase().trim()
      );
      const uniqueNames = new Set(columnNames);
      return uniqueNames.size === columnNames.length;
    },
    {
      message: "Tên các cột điểm không được trùng lặp",
      path: ["grade_columns"],
    }
  );

// ===== COURSE UPDATE VALIDATION SCHEMA =====

export const updateCourseSchema = z.object({
  name: z
    .string()
    .min(1, "Tên khóa học là bắt buộc")
    .max(200, "Tên khóa học không được vượt quá 200 ký tự")
    .trim(),
  description: z
    .string()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
  credits: z
    .number()
    .int("Số tín chỉ phải là số nguyên")
    .min(1, "Số tín chỉ phải lớn hơn 0")
    .max(10, "Số tín chỉ không được vượt quá 10")
    .optional(),
  semester: z
    .number()
    .int("Học kỳ phải là số nguyên")
    .min(1, "Học kỳ phải từ 1 trở lên")
    .max(3, "Học kỳ không được vượt quá 3")
    .optional(),
  year: z
    .number()
    .int("Năm học phải là số nguyên")
    .min(2020, "Năm học phải từ 2020 trở lên")
    .max(2030, "Năm học không được vượt quá 2030")
    .optional(),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  program_id: z
    .number()
    .int("ID chương trình phải là số nguyên")
    .min(1, "Vui lòng chọn chương trình đào tạo")
    .optional(),
});

// ===== FORM DATA TYPES =====

export type GradeColumnFormData = z.infer<typeof gradeColumnSchema>;
export type CreateCourseWithGradesFormData = z.infer<
  typeof createCourseWithGradesSchema
>;
export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;

// ===== VALIDATION ERROR TYPES =====

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  success: boolean;
  errors?: ValidationError[];
  data?: CreateCourseWithGradesFormData;
}

// ===== HELPER FUNCTIONS =====

export const validateCourseForm = (data: unknown): FormValidationResult => {
  try {
    const validatedData = createCourseWithGradesSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: [{ field: "general", message: "Validation failed" }],
    };
  }
};

export const validateGradeColumn = (
  data: unknown
): {
  success: boolean;
  errors?: ValidationError[];
  data?: GradeColumnFormData;
} => {
  try {
    const validatedData = gradeColumnSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: [{ field: "general", message: "Validation failed" }],
    };
  }
};

export const validateUpdateCourse = (
  data: unknown
): {
  success: boolean;
  errors?: ValidationError[];
  data?: UpdateCourseFormData;
} => {
  try {
    const validatedData = updateCourseSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: [{ field: "general", message: "Validation failed" }],
    };
  }
};

// ===== DEFAULT VALUES =====

export const defaultGradeColumns: GradeColumnFormData[] = [
  {
    column_name: "Chuyên cần",
    weight_percentage: 10,
    description: "Điểm chuyên cần, tham gia lớp học",
  },
  {
    column_name: "Giữa kỳ",
    weight_percentage: 40,
    description: "Điểm kiểm tra giữa kỳ",
  },
  {
    column_name: "Cuối kỳ",
    weight_percentage: 50,
    description: "Điểm thi cuối kỳ",
  },
];

export const defaultCourseFormValues: Partial<CreateCourseWithGradesFormData> =
  {
    name: "",
    description: "",
    credits: 3,
    semester: 1,
    year: new Date().getFullYear(),
    start_date: "",
    end_date: "",
    program_id: undefined,
    grade_columns: defaultGradeColumns,
  };
