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
import { Loader2, Save, X, CheckSquare } from "lucide-react";
import { toast } from "sonner";

import { ploService } from "@/lib/services/api/plo.service";
import { programService } from "@/lib/services/api/program.service";
import { poService } from "@/lib/services/api/po.service";
import {
  ploCreateSchema,
  ploUpdateSchema,
} from "@/lib/validations/program-management";
import type {
  PLOCreateRequest,
  PLOUpdateRequest,
  PLOWithRelations,
  Program,
  PO,
} from "@/lib/types/program-management";

interface PLOFormProps {
  plo?: PLOWithRelations;
  onSuccess?: (plo: PLOWithRelations) => void;
  onCancel?: () => void;
  className?: string;
}

type PLOFormData = PLOCreateRequest;

export function PLOForm({ plo, onSuccess, onCancel, className }: PLOFormProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [pos, setPOs] = useState<PO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [isLoadingPOs, setIsLoadingPOs] = useState(false);

  const isEditing = !!plo;
  const schema = isEditing ? ploUpdateSchema : ploCreateSchema;

  const form = useForm<PLOFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: plo?.name || "",
      description: plo?.description || "",
      code: plo?.code || "",
      program_id: plo?.program_id || undefined,
      po_id: plo?.po_id || undefined,
    },
  });

  const selectedProgramId = form.watch("program_id");

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

  // Load POs when program is selected
  useEffect(() => {
    if (!selectedProgramId) {
      setPOs([]);
      return;
    }

    const loadPOs = async () => {
      try {
        setIsLoadingPOs(true);
        const response = await poService.getPOsByProgram(selectedProgramId);
        if (response.success && Array.isArray(response.data)) {
          setPOs(response.data);
        } else {
          setPOs([]);
        }
      } catch (error) {
        console.error("Error loading POs:", error);
        setPOs([]);
        toast.error("Không thể tải danh sách chuẩn đầu ra chương trình");
      } finally {
        setIsLoadingPOs(false);
      }
    };

    loadPOs();
  }, [selectedProgramId]);

  const onSubmit = async (data: PLOFormData) => {
    try {
      setIsSubmitting(true);

      let response;
      if (isEditing && plo) {
        response = await ploService.updatePLO(
          plo.plo_id,
          data as PLOUpdateRequest
        );
      } else {
        response = await ploService.createPLO(data);
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "Chuẩn đầu ra học phần đã được cập nhật"
            : "Chuẩn đầu ra học phần đã được tạo thành công"
        );

        if (onSuccess) {
          onSuccess(response.data as PLOWithRelations);
        } else {
          router.push("/dashboard/admin/plos");
        }
      }
    } catch (error: any) {
      console.error("Error submitting PLO form:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        backendErrors.forEach((err: any) => {
          form.setError(err.field as keyof PLOFormData, {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            (isEditing
              ? "Không thể cập nhật chuẩn đầu ra học phần"
              : "Không thể tạo chuẩn đầu ra học phần")
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
          <CheckSquare className="h-5 w-5" />
          {isEditing
            ? "Chỉnh sửa chuẩn đầu ra học phần"
            : "Tạo chuẩn đầu ra học phần mới"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Cập nhật thông tin chuẩn đầu ra học phần"
            : "Nhập thông tin để tạo chuẩn đầu ra học phần mới"}
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
                    onValueChange={(value) => {
                      field.onChange(parseInt(value));
                      // Reset PO selection when program changes
                      form.setValue("po_id", undefined);
                    }}
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
                    Chọn chương trình đào tạo mà chuẩn đầu ra học phần này thuộc
                    về
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PO Selection */}
            <FormField
              control={form.control}
              name="po_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chuẩn đầu ra chương trình (PO)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === "none" ? undefined : parseInt(value)
                      )
                    }
                    value={field.value?.toString()}
                    disabled={!selectedProgramId || isLoadingPOs}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chuẩn đầu ra chương trình (tùy chọn)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        Không liên kết với PO nào
                      </SelectItem>
                      {Array.isArray(pos) &&
                        pos.map((po) => (
                          <SelectItem
                            key={po.po_id}
                            value={po.po_id.toString()}
                          >
                            {po.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chọn chuẩn đầu ra chương trình mà PLO này liên quan đến
                    (không bắt buộc)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PLO Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chuẩn đầu ra học phần</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên chuẩn đầu ra học phần"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tên ngắn gọn cho chuẩn đầu ra học phần (không bắt buộc)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PLO Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã chuẩn đầu ra học phần</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập mã chuẩn đầu ra học phần (ví dụ: PLO1, PLO2)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mã định danh duy nhất cho chuẩn đầu ra học phần (không bắt
                    buộc)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PLO Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả chi tiết về chuẩn đầu ra học phần này"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả chi tiết về nội dung và yêu cầu của chuẩn đầu ra học
                    phần
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
                    {isEditing ? "Cập nhật" : "Tạo chuẩn đầu ra học phần"}
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
