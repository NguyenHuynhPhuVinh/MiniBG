"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms/form";
import {
  Settings,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Zap,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { courseGradeService } from "@/lib/services/api/course-grade.service";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";

// Validation schema
const gradeColumnSchema = z.object({
  column_name: z.string().min(1, "Tên cột điểm là bắt buộc"),
  weight_percentage: z
    .number()
    .min(1, "Trọng số phải lớn hơn 0")
    .max(100, "Trọng số không được vượt quá 100"),
  description: z.string().optional(),
});

const gradeSetupSchema = z.object({
  grade_columns: z
    .array(gradeColumnSchema)
    .min(1, "Phải có ít nhất 1 cột điểm"),
});

type GradeSetupFormData = z.infer<typeof gradeSetupSchema>;

interface GradeSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  onSuccess: () => void;
}

// Predefined templates
const GRADE_TEMPLATES = {
  standard: {
    name: "Chuẩn",
    description: "Phù hợp cho hầu hết các môn học",
    icon: BookOpen,
    columns: [
      {
        column_name: "Điểm chuyên cần",
        weight_percentage: 10,
        description: "Điểm danh, tham gia lớp",
      },
      {
        column_name: "Điểm giữa kỳ",
        weight_percentage: 40,
        description: "Kiểm tra giữa kỳ",
      },
      {
        column_name: "Điểm cuối kỳ",
        weight_percentage: 50,
        description: "Thi kết thúc môn",
      },
    ],
  },
  detailed: {
    name: "Chi tiết",
    description: "Đánh giá đa dạng với nhiều thành phần",
    icon: BarChart3,
    columns: [
      {
        column_name: "Chuyên cần",
        weight_percentage: 10,
        description: "Điểm danh, tham gia",
      },
      {
        column_name: "Bài tập",
        weight_percentage: 20,
        description: "Bài tập về nhà",
      },
      {
        column_name: "Kiểm tra",
        weight_percentage: 20,
        description: "Kiểm tra 15 phút",
      },
      {
        column_name: "Giữa kỳ",
        weight_percentage: 25,
        description: "Thi giữa kỳ",
      },
      {
        column_name: "Cuối kỳ",
        weight_percentage: 25,
        description: "Thi cuối kỳ",
      },
    ],
  },
  simple: {
    name: "Đơn giản",
    description: "Chỉ có 2 thành phần chính",
    icon: Zap,
    columns: [
      {
        column_name: "Điểm quá trình",
        weight_percentage: 40,
        description: "Tổng hợp điểm quá trình",
      },
      {
        column_name: "Điểm thi",
        weight_percentage: 60,
        description: "Điểm thi cuối kỳ",
      },
    ],
  },
};

export function GradeSetupWizard({
  isOpen,
  onClose,
  courseId,
  onSuccess,
}: GradeSetupWizardProps) {
  const [step, setStep] = useState<"template" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<
    keyof typeof GRADE_TEMPLATES | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GradeSetupFormData>({
    resolver: zodResolver(gradeSetupSchema),
    defaultValues: {
      grade_columns: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "grade_columns",
  });

  // Calculate total weight
  const watchedColumns = form.watch("grade_columns");
  const totalWeight = watchedColumns.reduce(
    (sum, col) => sum + (col.weight_percentage || 0),
    0
  );

  // Handle template selection
  const handleTemplateSelect = (templateKey: keyof typeof GRADE_TEMPLATES) => {
    setSelectedTemplate(templateKey);
    const template = GRADE_TEMPLATES[templateKey];
    form.setValue("grade_columns", template.columns);
    setStep("custom");
  };

  // Handle custom setup
  const handleCustomSetup = () => {
    form.setValue("grade_columns", [
      { column_name: "", weight_percentage: 0, description: "" },
    ]);
    setStep("custom");
  };

  // Add new column
  const addColumn = () => {
    append({ column_name: "", weight_percentage: 0, description: "" });
  };

  // Submit form
  const onSubmit = async (data: GradeSetupFormData) => {
    if (totalWeight !== 100) {
      showErrorToast("Tổng trọng số phải bằng 100%");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create grade columns sequentially
      for (let i = 0; i < data.grade_columns.length; i++) {
        const column = data.grade_columns[i];
        await courseGradeService.createGradeColumn({
          course_id: courseId,
          column_name: column.column_name,
          weight_percentage: column.weight_percentage,
          column_order: i + 1,
          description: column.description || undefined,
          is_active: true,
        });
      }

      showSuccessToast("Thiết lập cột điểm thành công!");
      onSuccess();
      onClose();

      // Reset form
      form.reset();
      setStep("template");
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error creating grade columns:", error);
      showErrorToast("Không thể tạo cột điểm. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset when dialog closes
  const handleClose = () => {
    form.reset();
    setStep("template");
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Thiết lập cột điểm
          </DialogTitle>
        </DialogHeader>

        {step === "template" && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Chọn mẫu thiết lập</h3>
              <p className="text-muted-foreground">
                Chọn một mẫu có sẵn hoặc tự thiết lập từ đầu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(GRADE_TEMPLATES).map(([key, template]) => {
                const IconComponent = template.icon;
                return (
                  <Card
                    key={key}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                    onClick={() =>
                      handleTemplateSelect(key as keyof typeof GRADE_TEMPLATES)
                    }
                  >
                    <CardContent className="p-6 text-center">
                      <IconComponent className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h4 className="font-semibold mb-2">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        {template.columns.map((col, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs"
                          >
                            <span>{col.column_name}</span>
                            <Badge variant="outline">
                              {col.weight_percentage}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleCustomSetup}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Thiết lập tùy chỉnh
              </Button>
            </div>
          </div>
        )}

        {step === "custom" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Weight Status */}
              <Card
                className={`border-l-4 ${
                  totalWeight === 100
                    ? "border-l-green-500 bg-green-50"
                    : totalWeight > 100
                    ? "border-l-red-500 bg-red-50"
                    : "border-l-yellow-500 bg-yellow-50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {totalWeight === 100 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        Tổng trọng số: {totalWeight}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {totalWeight === 100
                          ? "Hoàn hảo!"
                          : totalWeight > 100
                          ? "Vượt quá 100%"
                          : "Cần đủ 100%"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grade Columns */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Cột điểm</h3>
                  <Button type="button" variant="outline" onClick={addColumn}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm cột
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-4">
                          <FormField
                            control={form.control}
                            name={`grade_columns.${index}.column_name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tên cột điểm *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="VD: Điểm chuyên cần"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name={`grade_columns.${index}.weight_percentage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trọng số (%) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="10"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="md:col-span-5">
                          <FormField
                            control={form.control}
                            name={`grade_columns.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mô tả</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Mô tả về cột điểm này..."
                                    className="min-h-[60px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="md:col-span-1 flex justify-end">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("template")}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || totalWeight !== 100}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? "Đang tạo..." : "Tạo cột điểm"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
