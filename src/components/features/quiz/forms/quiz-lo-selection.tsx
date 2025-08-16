"use client";

import { useState, useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CreateQuizFormData, LO } from "@/lib/types/quiz";
import { loService } from "@/lib/services/api";
import { Checkbox } from "@/components/ui/forms";
import { Card, CardContent } from "@/components/ui/layout";
import { ScrollArea } from "@/components/ui/layout";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { cn } from "@/lib/utils";

interface QuizLoSelectionProps {
  subjectId: number;
  form: UseFormReturn<CreateQuizFormData>;
}

export function QuizLoSelection({ subjectId, form }: QuizLoSelectionProps) {
  const [los, setLos] = useState<LO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theo dõi giá trị được chọn
  const selectedLOs = useWatch({
    control: form.control,
    name: "question_criteria.loIds",
    defaultValue: [],
  });

  // Tự động xóa lỗi khi người dùng đã chọn đủ mục tiêu
  useEffect(() => {
    if (selectedLOs && selectedLOs.length > 0) {
      form.clearErrors("question_criteria.loIds");
    }
  }, [selectedLOs, form]);

  // Lấy danh sách mục tiêu học tập theo môn học
  useEffect(() => {
    const fetchLOs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await loService.getLOsBySubject(subjectId);
        console.log("LOs by Subject API Response:", response);

        if (
          response?.success &&
          response?.data &&
          Array.isArray(response.data.los)
        ) {
          setLos(response.data.los);
        } else {
          console.error("Dữ liệu LOs không đúng định dạng hoặc rỗng", response);
          setError("Không thể tải dữ liệu mục tiêu học tập");
          setLos([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách mục tiêu học tập:", error);
        setError("Đã xảy ra lỗi khi tải dữ liệu mục tiêu học tập");
        setLos([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (subjectId) {
      fetchLOs();
    }
  }, [subjectId]);

  // Xử lý chọn/bỏ chọn mục tiêu học tập
  const handleToggleLO = (loId: number) => {
    const currentLOs = form.getValues("question_criteria.loIds") || [];
    const newSelected = currentLOs.includes(loId)
      ? currentLOs.filter((id) => id !== loId)
      : [...currentLOs, loId];

    form.setValue("question_criteria.loIds", newSelected);

    if (newSelected.length > 0) {
      form.clearErrors("question_criteria.loIds");
    }
  };

  // Xử lý chọn tất cả
  const handleSelectAll = () => {
    const allLOIds = los.map((lo) => lo.lo_id);
    form.setValue("question_criteria.loIds", allLOIds);
    form.clearErrors("question_criteria.loIds");
  };

  // Xử lý bỏ chọn tất cả
  const handleDeselectAll = () => {
    form.setValue("question_criteria.loIds", []);
  };

  return (
    <div className="space-y-3">
      <Card className="border-primary/10">
        <CardContent>
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className="bg-primary/5 px-2 py-1 h-auto text-xs sm:text-sm"
              >
                {selectedLOs.length} / {los.length} được chọn
              </Badge>

              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={los.length === 0}
                  className="h-8 text-xs flex-1 sm:flex-none sm:text-sm cursor-pointer"
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Chọn tất cả
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedLOs.length === 0}
                  className="h-8 text-xs flex-1 sm:flex-none sm:text-sm cursor-pointer"
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Bỏ chọn
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-5 sm:py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm">Đang tải dữ liệu...</span>
              </div>
            ) : error ? (
              <div className="py-5 sm:py-6 text-center">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : los.length === 0 ? (
              <div className="py-5 sm:py-6 text-center">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Không có mục tiêu học tập nào cho môn học này
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[250px] xs:h-[280px] sm:h-[350px] pr-4 -mr-4">
                <div className="space-y-2 mb-2">
                  {los.map((lo) => (
                    <div
                      key={lo.lo_id}
                      className={cn(
                        "rounded-lg border p-2 sm:p-3 transition-colors cursor-pointer",
                        selectedLOs.includes(lo.lo_id)
                          ? "bg-primary/5 border-primary/30"
                          : "hover:bg-muted/40 hover:border-primary/20"
                      )}
                      onClick={() => handleToggleLO(lo.lo_id)}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id={`lo-${lo.lo_id}`}
                          checked={selectedLOs.includes(lo.lo_id)}
                          onCheckedChange={() => handleToggleLO(lo.lo_id)}
                          className="mt-0.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="space-y-1.5 w-full">
                          <div className="text-xs sm:text-sm font-medium leading-relaxed">
                            {lo.description || lo.name}
                          </div>

                          {lo.Chapters && lo.Chapters.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {lo.Chapters.map((ch) => (
                                <Badge
                                  key={ch.chapter_id}
                                  variant="secondary"
                                  className="text-[9px] h-4 px-1 sm:text-xs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {ch.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      {form.formState.errors.question_criteria?.loIds && (
        <p className="text-[10px] sm:text-xs text-destructive flex items-center mt-1">
          <Info className="h-3 w-3 mr-1" />
          {form.formState.errors.question_criteria.loIds.message}
        </p>
      )}
    </div>
  );
}
