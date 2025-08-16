"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Loader2, Save, X, Target } from "lucide-react";
import { toast } from "sonner";

import { poService } from "@/lib/services/api/po.service";
import { programService } from "@/lib/services/api/program.service";
import {
  poCreateSchema,
  poUpdateSchema,
} from "@/lib/validations/program-management";
import type {
  POCreateRequest,
  POUpdateRequest,
  POWithRelations,
  Program,
} from "@/lib/types/program-management";

interface POFormProps {
  po?: POWithRelations;
  onSuccess?: (po: POWithRelations) => void;
  onCancel?: () => void;
  className?: string;
}

type POFormData = POCreateRequest;

export function POForm({ po, onSuccess, onCancel, className }: POFormProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  const isEditing = !!po;
  const schema = isEditing ? poUpdateSchema : poCreateSchema;

  const form = useForm<POFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: po?.name || "",
      description: po?.description || "",
      code: po?.code || "",
      program_id: po?.program_id || undefined,
    },
  });

  // Load programs for dropdown
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoadingPrograms(true);
        const response = await programService.getPrograms();
        if (response.success) {
          setPrograms(response.data.records);
        }
      } catch (error) {
        console.error("Error loading programs:", error);
        toast.error("Không thể tải danh sách chương trình");
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    loadPrograms();
  }, []);

  const onSubmit = async (data: POFormData) => {
    try {
      setIsSubmitting(true);

      let response;
      if (isEditing && po) {
        response = await poService.updatePO(po.po_id, data as POUpdateRequest);
      } else {
        response = await poService.createPO(data);
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "Chuẩn đầu ra đã được cập nhật"
            : "Chuẩn đầu ra đã được tạo thành công"
        );

        if (onSuccess) {
          onSuccess(response.data as POWithRelations);
        } else {
          router.push("/dashboard/admin/pos");
        }
      }
    } catch (error: any) {
      console.error("Error submitting PO form:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        backendErrors.forEach((err: any) => {
          form.setError(err.field as keyof POFormData, {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            (isEditing
              ? "Không thể cập nhật chuẩn đầu ra"
              : "Không thể tạo chuẩn đầu ra")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {isEditing ? "Chỉnh sửa chuẩn đầu ra" : "Tạo chuẩn đầu ra mới"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Cập nhật thông tin chuẩn đầu ra chương trình"
            : "Nhập thông tin để tạo chuẩn đầu ra chương trình mới"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Program Selection */}
            <FormField
              control={form.control}
              name="program_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chương trình đào tạo *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={isLoadingPrograms}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chương trình đào tạo" />
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
                  <FormDescription>
                    Chọn chương trình đào tạo mà chuẩn đầu ra này thuộc về
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PO Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chuẩn đầu ra *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên chuẩn đầu ra chương trình"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tên mô tả ngắn gọn về chuẩn đầu ra này
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PO Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã chuẩn đầu ra</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập mã chuẩn đầu ra (ví dụ: PO1, PO2)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mã định danh duy nhất cho chuẩn đầu ra (không bắt buộc)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PO Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả chi tiết về chuẩn đầu ra này"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả chi tiết về nội dung và yêu cầu của chuẩn đầu ra
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Cập nhật" : "Tạo chuẩn đầu ra"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
