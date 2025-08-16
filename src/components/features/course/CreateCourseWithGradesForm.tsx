"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  RotateCcw,
} from "lucide-react";

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";

// Types and Validation
import type { CourseWithGradeColumnsRequest } from "@/lib/types/course-grade";
import type { Program } from "@/lib/types/program-management";
import {
  createCourseWithGradesSchema,
  defaultCourseFormValues,
  type CreateCourseWithGradesFormData,
} from "@/lib/validations/course";

// Services
import { courseGradeService } from "@/lib/services/api/course-grade.service";
import { programService } from "@/lib/services/api/program.service";

// Auth Hook
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface CreateCourseWithGradesFormProps {
  onSuccess?: (courseData: any) => void;
  onCancel?: () => void;
}

export function CreateCourseWithGradesForm({
  onSuccess,
  onCancel,
}: CreateCourseWithGradesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  // Get current user information
  const { getUser } = useAuthStatus();

  // Form setup
  const form = useForm<CreateCourseWithGradesFormData>({
    resolver: zodResolver(createCourseWithGradesSchema),
    defaultValues: defaultCourseFormValues,
  });

  // Field array for grade columns
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "grade_columns",
  });

  // Watch grade columns for real-time weight calculation
  const watchedColumns = useWatch({
    control: form.control,
    name: "grade_columns",
  });

  // Watch all form values for validation
  const watchedValues = useWatch({
    control: form.control,
  });

  // Memoized weight calculation for better performance
  const { totalWeight, isWeightValid } = useMemo(() => {
    const total =
      watchedColumns?.reduce(
        (sum: number, col: any) => sum + (col.weight_percentage || 0),
        0
      ) || 0;

    return {
      totalWeight: total,
      isWeightValid: Math.abs(total - 100) < 0.01,
    };
  }, [watchedColumns]);

  // Check if form is valid and complete
  const isFormValid = useMemo(() => {
    if (!watchedValues) return false;

    // Check required fields with type-safe access
    const hasRequiredFields = !!(
      watchedValues.name &&
      watchedValues.name.trim() !== "" &&
      watchedValues.credits &&
      watchedValues.credits > 0 &&
      watchedValues.semester &&
      watchedValues.year &&
      watchedValues.program_id &&
      watchedValues.start_date &&
      watchedValues.end_date
    );

    // Check grade columns are valid
    const hasValidGradeColumns =
      watchedColumns?.every(
        (col: any) =>
          col.column_name &&
          col.column_name.trim() !== "" &&
          col.weight_percentage > 0
      ) || false;

    // Check weight is valid (100%)
    const hasValidWeight = isWeightValid;

    return hasRequiredFields && hasValidGradeColumns && hasValidWeight;
  }, [watchedValues, watchedColumns, isWeightValid]);

  // Load programs on component mount
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoadingPrograms(true);
        const response = await programService.getPrograms({ limit: 100 });
        if (response.success && response.data.records) {
          setPrograms(response.data.records);
        }
      } catch (error) {
        console.error("Error loading programs:", error);
        toast.error("Không thể tải danh sách chương trình đào tạo");
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    loadPrograms();
  }, []);

  // Add new grade column
  const addGradeColumn = () => {
    append({
      column_name: "",
      weight_percentage: 0,
      description: "",
    });
  };

  // Remove grade column
  const removeGradeColumn = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("Phải có ít nhất 1 cột điểm");
    }
  };

  // Reset grade columns to default
  const resetGradeColumns = () => {
    try {
      // Reset form values directly
      form.setValue("grade_columns", [
        {
          column_name: "Chuyên cần",
          weight_percentage: 10,
          description: "Điểm danh, tham gia lớp",
        },
        {
          column_name: "Giữa kỳ",
          weight_percentage: 40,
          description: "Kiểm tra giữa kỳ",
        },
        {
          column_name: "Cuối kỳ",
          weight_percentage: 50,
          description: "Thi cuối kỳ",
        },
      ]);
      toast.success("Đã reset về cấu hình mặc định");
    } catch (error) {
      console.error("Error resetting grade columns:", error);
      toast.error("Có lỗi khi reset cấu hình");
    }
  };

  // Form submission handler
  const onSubmit = async (data: CreateCourseWithGradesFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user ID from auth context
      const currentUser = getUser();
      if (!currentUser?.user_id) {
        toast.error(
          "Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại."
        );
        return;
      }

      // Format request payload
      const requestData: CourseWithGradeColumnsRequest = {
        user_id: currentUser.user_id,
        name: data.name,
        description: data.description || undefined,
        credits: data.credits,
        semester: data.semester,
        year: data.year,
        start_date: data.start_date,
        end_date: data.end_date,
        program_id: data.program_id,
        grade_config: {
          final_exam_weight: 50, // TODO: Make this configurable in future versions
          process_weight: 50,
        },
        grade_columns: data.grade_columns.map((col) => ({
          column_name: col.column_name,
          weight_percentage: col.weight_percentage,
          description: col.description || undefined,
        })),
      };

      // Call API
      const response = await courseGradeService.createCourseWithGradeColumns(
        requestData
      );

      if (response.success) {
        toast.success("Tạo khóa học thành công!");
        form.reset();
        onSuccess?.(response.data);
      } else {
        throw new Error(response.message || "Tạo khóa học thất bại");
      }
    } catch (error: unknown) {
      console.error("Error creating course:", error);

      // Enhanced error handling with specific error types
      let errorMessage = "Có lỗi xảy ra khi tạo khóa học";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as { message: unknown }).message);
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Course Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khóa học</CardTitle>
              <CardDescription>
                Nhập thông tin cơ bản cho khóa học mới
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khóa học *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên khóa học" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả khóa học (tùy chọn)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Credits, Semester, Year Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tín chỉ</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="3"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học kỳ</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn học kỳ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Học kỳ 1</SelectItem>
                          <SelectItem value="2">Học kỳ 2</SelectItem>
                          <SelectItem value="3">Học kỳ 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm học</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2020"
                          max="2030"
                          placeholder="2024"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Program Selection */}
              <FormField
                control={form.control}
                name="program_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chương trình đào tạo *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={isLoadingPrograms}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingPrograms
                                ? "Đang tải..."
                                : "Chọn chương trình đào tạo"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem
                            key={program.program_id}
                            value={program.program_id.toString()}
                          >
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Grade Columns Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cấu hình cột điểm</span>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetGradeColumns}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  {isWeightValid ? (
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {totalWeight.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {totalWeight.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Thiết lập các cột điểm và trọng số cho khóa học. Tổng trọng số
                phải bằng 100%.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                        STT
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                        Tên cột điểm
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                        Trọng số (%)
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                        Mô tả
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-700">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-600">
                          {index + 1}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <FormField
                            control={form.control}
                            name={`grade_columns.${index}.column_name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="VD: Chuyên cần, Giữa kỳ..."
                                    className="border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <FormField
                            control={form.control}
                            name={`grade_columns.${index}.weight_percentage`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="space-y-3">
                                  {/* Input number */}
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={field.value || 0}
                                        onChange={(e) => {
                                          const value =
                                            parseInt(e.target.value) || 0;
                                          field.onChange(
                                            Math.min(100, Math.max(0, value))
                                          );
                                        }}
                                        className="w-20 h-8 text-center border-gray-300 focus:border-blue-500"
                                      />
                                    </FormControl>
                                    <span className="text-sm text-gray-500">
                                      %
                                    </span>
                                  </div>

                                  {/* Slider */}
                                  <FormControl>
                                    <Slider
                                      min={0}
                                      max={100}
                                      step={1}
                                      value={[field.value || 0]}
                                      onValueChange={(values) => {
                                        field.onChange(values[0]);
                                      }}
                                      className="w-full"
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <FormField
                            control={form.control}
                            name={`grade_columns.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Mô tả ngắn gọn..."
                                    className="border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeGradeColumn(index)}
                            disabled={fields.length <= 1}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Grade Column Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addGradeColumn}
                  className="flex items-center gap-2 px-6"
                  disabled={fields.length >= 10}
                >
                  <Plus className="h-4 w-4" />
                  Thêm cột điểm mới
                  {fields.length >= 10 && (
                    <span className="text-xs text-gray-500">(Tối đa 10)</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6"
              >
                Hủy bỏ
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`min-w-[140px] px-6 transition-all duration-200 ${
                !isFormValid
                  ? "opacity-50 cursor-not-allowed bg-gray-300 hover:bg-gray-300 text-gray-500"
                  : ""
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tạo...
                </span>
              ) : (
                "Tạo khóa học"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
