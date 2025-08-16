"use client";

import React, { useState } from "react";
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

import { programService } from "@/lib/services/api";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import {
  programCreateSchema,
  programUpdateSchema,
} from "@/lib/validations/program-management";
import type {
  Program,
  ProgramCreateRequest,
  ProgramUpdateRequest,
} from "@/lib/types/program-management";

interface ProgramFormProps {
  mode: "create" | "edit";
  initialData?: Program;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ProgramForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
  className,
}: ProgramFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Choose validation schema based on mode
  const validationSchema =
    mode === "create" ? programCreateSchema : programUpdateSchema;

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  // Watch for form changes to detect unsaved changes
  React.useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof validationSchema>) {
    try {
      setIsSubmitting(true);

      if (mode === "create") {
        const createData: ProgramCreateRequest = {
          name: values.name!,
          description: values.description,
        };

        const response = await programService.createProgram(createData);

        if (response.success) {
          showSuccessToast("Tạo chương trình đào tạo thành công");
          setHasUnsavedChanges(false);

          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/dashboard/admin/programs");
          }
        }
      } else if (mode === "edit" && initialData) {
        const updateData: ProgramUpdateRequest = {
          name: values.name,
          description: values.description,
        };

        const response = await programService.updateProgram(
          initialData.program_id,
          updateData
        );

        if (response.success) {
          showSuccessToast("Cập nhật chương trình đào tạo thành công");
          setHasUnsavedChanges(false);

          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/dashboard/admin/programs");
          }
        }
      }
    } catch (error) {
      const errorMessage =
        mode === "create"
          ? "Không thể tạo chương trình đào tạo"
          : "Không thể cập nhật chương trình đào tạo";
      showErrorToast(errorMessage);
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle cancel action with unsaved changes warning
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = confirm(
        "Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn thoát?"
      );
      if (!confirmLeave) return;
    }

    if (onCancel) {
      onCancel();
    } else {
      router.push("/dashboard/admin/programs");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Thông tin chương trình đào tạo mới"
            : "Chỉnh sửa chương trình đào tạo"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Nhập thông tin chi tiết cho chương trình đào tạo mới"
            : "Cập nhật thông tin chương trình đào tạo"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Program Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên chương trình <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Công nghệ thông tin"
                      {...field}
                    />
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
                      placeholder="Mô tả chi tiết về chương trình đào tạo..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {mode === "create" ? "Tạo chương trình" : "Cập nhật"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
