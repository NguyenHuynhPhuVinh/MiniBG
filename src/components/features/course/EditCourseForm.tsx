"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Save, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";

import { courseService } from "@/lib/services/api/course.service";
import { programService } from "@/lib/services/api/program.service";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import { updateCourseSchema } from "@/lib/validations/course";
import type {
  Course,
  CourseWithRelations,
  CourseUpdateRequest,
} from "@/lib/types/course";
import type { Program } from "@/lib/types/program-management";

interface EditCourseFormProps {
  initialData: Course | CourseWithRelations;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function EditCourseForm({
  initialData,
  onSuccess,
  onCancel,
  className,
}: EditCourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof updateCourseSchema>>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      credits: initialData?.credits || 3,
      semester: initialData?.semester || 1,
      year: initialData?.year || new Date().getFullYear(),
      start_date: initialData?.start_date || "",
      end_date: initialData?.end_date || "",
      program_id: initialData?.program_id || undefined,
    },
  });

  // Load programs for dropdown
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoadingPrograms(true);
        const response = await programService.getPrograms({ limit: 100 });
        if (response.success && response.data.records) {
          setPrograms(response.data.records);
        }
      } catch (error) {
        showErrorToast("Không thể tải danh sách chương trình đào tạo");
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    loadPrograms();
  }, []);

  // Watch for form changes to detect unsaved changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof updateCourseSchema>) {
    try {
      setIsSubmitting(true);

      const updateData: CourseUpdateRequest = {
        name: values.name,
        description: values.description,
        credits: values.credits,
        semester: values.semester,
        year: values.year,
        start_date: values.start_date,
        end_date: values.end_date,
        program_id: values.program_id,
      };

      const response = await courseService.updateCourse(
        initialData.course_id,
        updateData
      );

      if (response.success) {
        showSuccessToast("Cập nhật khóa học thành công");
        setHasUnsavedChanges(false);

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/teaching/courses");
        }
      }
    } catch (error) {
      showErrorToast("Không thể cập nhật khóa học");
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle cancel with unsaved changes warning
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm(
        "Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy?"
      );
      if (!confirmed) return;
    }

    if (onCancel) {
      onCancel();
    } else {
      router.push("/dashboard/teaching/courses");
    }
  };

  const isInDialog = className?.includes("border-0");

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Cập nhật khóa học
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isInDialog) {
    return formContent;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Chỉnh sửa khóa học</CardTitle>
        <CardDescription>
          Cập nhật thông tin khóa học "{initialData.name}"
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
