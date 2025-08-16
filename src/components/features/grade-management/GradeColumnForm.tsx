"use client";

import React, { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { AlertCircle, Calculator } from "lucide-react";

import { gradeColumnCreateSchema } from "@/lib/validations/course-grade";
import type {
  GradeColumnFormData,
  GradeColumnWithRelations,
} from "@/lib/types/course-grade";

interface GradeColumnFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GradeColumnFormData) => Promise<void>;
  existingColumns: GradeColumnWithRelations[];
  courseId: number;
  initialData?: GradeColumnWithRelations | null;
}

export function GradeColumnForm({
  open,
  onOpenChange,
  onSubmit,
  existingColumns,
  courseId,
  initialData,
}: GradeColumnFormProps) {
  const isEditing = !!initialData;

  const form = useForm<GradeColumnFormData>({
    resolver: zodResolver(gradeColumnCreateSchema),
    defaultValues: {
      name: "",
      weight: 0,
      description: "",
      course_id: courseId,
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.column_name,
          weight: initialData.weight_percentage,
          description: initialData.description || "",
          course_id: courseId,
        });
      } else {
        form.reset({
          name: "",
          weight: 0,
          description: "",
          course_id: courseId,
        });
      }
    }
  }, [open, initialData, courseId, form]);

  // Calculate current total weight excluding the column being edited (memoized)
  const currentTotalWeight = useMemo(() => {
    return existingColumns
      .filter((col) => !isEditing || col.column_id !== initialData?.column_id)
      .reduce((sum, col) => sum + (Number(col.weight_percentage) || 0), 0);
  }, [existingColumns, isEditing, initialData?.column_id]);

  // Watch weight percentage to provide real-time validation
  const watchedWeight = form.watch("weight");
  
  // Memoize validation calculations
  const { projectedTotal, isWeightValid, isWeightExceeded } = useMemo(() => {
    const total = currentTotalWeight + (watchedWeight || 0);
    return {
      projectedTotal: total,
      isWeightValid: Math.abs(total - 100) < 0.01,
      isWeightExceeded: total > 100,
    };
  }, [currentTotalWeight, watchedWeight]);

  const handleSubmit = async (data: GradeColumnFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {isEditing ? "Chỉnh sửa cột điểm" : "Thêm cột điểm mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin cột điểm. Đảm bảo tổng trọng số của tất cả cột bằng 100%."
              : "Tạo cột điểm mới cho khóa học. Đảm bảo tổng trọng số của tất cả cột bằng 100%."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Column Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên cột điểm *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Bài tập, Kiểm tra giữa kỳ, Thi cuối kỳ..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight Percentage */}
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trọng số (%) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : parseFloat(value));
                        }}
                        value={field.value || ""}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                  
                  {/* Real-time weight validation */}
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tổng trọng số hiện tại:
                      </span>
                      <Badge
                        variant={
                          currentTotalWeight === 0 ? "secondary" : "outline"
                        }
                        className="font-mono"
                      >
                        {(Number(currentTotalWeight) || 0).toFixed(2)}%
                      </Badge>
                    </div>

                    {watchedWeight > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tổng sau khi thêm:
                        </span>
                        <Badge
                          variant={
                            isWeightValid
                              ? "default"
                              : isWeightExceeded
                              ? "destructive"
                              : "secondary"
                          }
                          className="font-mono"
                        >
                          {(Number(projectedTotal) || 0).toFixed(2)}%
                        </Badge>
                      </div>
                    )}

                    {watchedWeight > 0 && !isWeightValid && (
                      <div
                        className={`flex items-center gap-2 text-sm ${
                          isWeightExceeded ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {isWeightExceeded
                            ? `Vượt quá ${(
                                Number(projectedTotal) - 100
                              ).toFixed(2)}%. Vui lòng giảm trọng số.`
                            : `Còn thiếu ${(
                                100 - Number(projectedTotal)
                              ).toFixed(2)}% để đạt 100%.`}
                        </span>
                      </div>
                    )}

                    {watchedWeight > 0 && isWeightValid && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Tổng trọng số đạt 100%. Hoàn hảo!</span>
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về cột điểm này..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                * Trường bắt buộc
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Đang lưu..."
                    : isEditing
                    ? "Cập nhật"
                    : "Tạo mới"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
