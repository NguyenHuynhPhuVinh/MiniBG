"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback/dialog";
import { Button, Input, Label } from "@/components/ui/forms";
import { Checkbox } from "@/components/ui/forms";
import { Badge, Skeleton } from "@/components/ui/feedback";
import { Slider } from "@/components/ui/forms/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import {
  Search,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
  ArrowRight,
  ArrowLeft,
  Play,
  FileCheck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { courseGradeService } from "@/lib/services/api/course-grade.service";
import type {
  GradeColumnWithRelations,
  AvailableQuiz,
  QuizAssignmentWithWeight,
} from "@/lib/types/course-grade";

interface QuizAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: GradeColumnWithRelations | null;
  availableQuizzes: AvailableQuiz[];
  courseId: number;
  onAssignmentComplete: () => void;
}

export function QuizAssignDialog({
  open,
  onOpenChange,
  column,
  availableQuizzes,
  courseId,
  onAssignmentComplete,
}: QuizAssignDialogProps) {
  const [selectedQuizIds, setSelectedQuizIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState<"select" | "weight">("select");

  // New state for weight management
  const [useWeights, setUseWeights] = useState(false);
  const [quizWeights, setQuizWeights] = useState<Record<number, number>>({});

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Reset all state when dialog opens
      setSelectedQuizIds([]);
      setUseWeights(false);
      setQuizWeights({});
      setSearchTerm("");
      setCurrentStep("select");
    } else {
      // Reset state when dialog closes
      setSelectedQuizIds([]);
      setUseWeights(false);
      setQuizWeights({});
      setSearchTerm("");
      setCurrentStep("select");
    }
  }, [open, column]);

  // Filter quizzes based on search term and only show finished quizzes
  // Only show quizzes that are not currently assigned to this column
  const currentlyAssignedIds =
    column?.Quizzes?.map((quiz) => quiz.quiz_id) || [];
  const filteredQuizzes = (availableQuizzes || []).filter(
    (quiz) =>
      quiz.status === "finished" && // Only show finished quizzes
      !currentlyAssignedIds.includes(quiz.quiz_id) && // Exclude already assigned quizzes
      (quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.Subject?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleQuizToggle = (quizId: number) => {
    setSelectedQuizIds((prev) => {
      if (prev.includes(quizId)) {
        return prev.filter((id) => id !== quizId);
      } else {
        return [...prev, quizId];
      }
    });

    // Initialize weight if using weights and quiz is selected
    if (useWeights && !selectedQuizIds.includes(quizId)) {
      setQuizWeights((prev) => ({
        ...prev,
        [quizId]: 0,
      }));
    }
  };

  // Handle weight change for a specific quiz
  const handleWeightChange = (quizId: number, weight: number) => {
    setQuizWeights((prev) => ({
      ...prev,
      [quizId]: weight,
    }));
  };

  // Auto-distribute weights evenly
  const handleAutoDistribute = () => {
    if (selectedQuizIds.length === 0) return;

    const evenWeight = Math.round(100 / selectedQuizIds.length);
    const newWeights: Record<number, number> = {};

    selectedQuizIds.forEach((quizId, index) => {
      if (index === selectedQuizIds.length - 1) {
        // Last quiz gets the remainder to ensure total = 100%
        const usedWeight = (selectedQuizIds.length - 1) * evenWeight;
        newWeights[quizId] = 100 - usedWeight;
      } else {
        newWeights[quizId] = evenWeight;
      }
    });

    setQuizWeights(newWeights);
  };

  // Calculate total weight
  const getTotalWeight = () => {
    return selectedQuizIds.reduce((sum, quizId) => {
      return sum + (quizWeights[quizId] || 0);
    }, 0);
  };

  // Custom close handler to ensure state reset
  const handleClose = () => {
    setSelectedQuizIds([]);
    setUseWeights(false);
    setQuizWeights({});
    setSearchTerm("");
    setCurrentStep("select");
    onOpenChange(false);
  };

  const handleNextStep = () => {
    if (selectedQuizIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một quiz");
      return;
    }

    // Initialize weights for selected quizzes
    const initialWeights: Record<number, number> = {};
    const evenWeight = Math.round(100 / selectedQuizIds.length);

    selectedQuizIds.forEach((quizId, index) => {
      if (index === selectedQuizIds.length - 1) {
        initialWeights[quizId] =
          100 - (selectedQuizIds.length - 1) * evenWeight;
      } else {
        initialWeights[quizId] = evenWeight;
      }
    });

    setQuizWeights(initialWeights);
    setUseWeights(true);
    setCurrentStep("weight");
  };

  const handleBackStep = () => {
    setCurrentStep("select");
  };

  const handleSelectAll = (quizzes: AvailableQuiz[]) => {
    const quizIds = quizzes.map((q) => q.quiz_id);
    setSelectedQuizIds((prev) => {
      const newIds = [...prev];
      quizIds.forEach((id) => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      return newIds;
    });
  };

  const handleDeselectAll = () => {
    setSelectedQuizIds([]);
  };

  const handleSubmit = async () => {
    if (!column || selectedQuizIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một quiz để gán");
      return;
    }

    try {
      setLoading(true);

      // Prepare quiz assignments with weights if enabled
      const quizAssignments: QuizAssignmentWithWeight[] = selectedQuizIds.map(
        (quizId) => {
          const assignment: QuizAssignmentWithWeight = { quiz_id: quizId };

          // Only add weight_percentage if using weights and value is valid
          if (useWeights && quizWeights[quizId] && quizWeights[quizId] > 0) {
            assignment.weight_percentage = quizWeights[quizId];
          }

          return assignment;
        }
      );

      // Validate total weight if using weights
      if (useWeights) {
        const totalWeight = Object.values(quizWeights).reduce(
          (sum, weight) => sum + (weight || 0),
          0
        );
        if (Math.abs(totalWeight - 100) > 0.01) {
          toast.error(
            `Tổng tỷ lệ phần trăm phải bằng 100%. Hiện tại: ${totalWeight}%`
          );
          return;
        }
      }

      const response = await courseGradeService.assignQuizzesToColumn(
        courseId,
        column.column_id,
        { quiz_assignments: quizAssignments }
      );

      if (response.success) {
        toast.success(`Đã gán ${selectedQuizIds.length} quiz thành công`);
        onAssignmentComplete();
        handleClose();
      } else {
        toast.error("Không thể gán quiz");
      }
    } catch (error) {
      console.error("Error assigning quizzes:", error);
      toast.error("Lỗi khi gán quiz");
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatusIcon = (quiz: AvailableQuiz) => {
    switch (quiz.status) {
      case "active":
        return <Play className="h-4 w-4 text-green-500" />;
      case "finished":
        return <FileCheck className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "finished":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const QuizCard = ({ quiz }: { quiz: AvailableQuiz }) => {
    const isSelected = selectedQuizIds.includes(quiz.quiz_id);

    return (
      <div
        className={`p-2 border rounded-md cursor-pointer transition-all duration-200 hover:shadow-sm ${
          isSelected
            ? "ring-2 ring-primary bg-primary/5 border-primary"
            : "hover:bg-muted/30 border-muted"
        }`}
        onClick={() => handleQuizToggle(quiz.quiz_id)}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleQuizToggle(quiz.quiz_id)}
            className="h-4 w-4"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getQuizStatusIcon(quiz)}
              <h4 className="font-medium text-xs truncate">{quiz.name}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!column) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <LinkIcon className="h-5 w-5" />
            Gán Quiz cho "{column.column_name}"
            <span className="text-sm text-muted-foreground ml-2">
              -{" "}
              {currentStep === "select"
                ? "Bước 1: Chọn Quiz"
                : "Bước 2: Thiết lập Tỷ lệ"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {currentStep === "select" ? (
              <>
                Chọn các quiz để gán vào cột điểm này. Quiz đã gán sẽ được tính
                điểm theo trọng số của cột.
                <span className="block text-xs text-muted-foreground mt-1">
                  * Chỉ hiển thị quiz đã kết thúc và chưa được gán vào cột này
                </span>
              </>
            ) : (
              <>
                Thiết lập tỷ lệ phần trăm cho từng quiz. Tổng tỷ lệ phải bằng
                100%.
                <span className="block text-xs text-muted-foreground mt-1">
                  * Sử dụng slider hoặc nhập số để điều chỉnh tỷ lệ
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-hidden">
          {currentStep === "select" ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm quiz theo tên hoặc môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Quiz Selection Controls */}
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                <h3 className="font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Quiz có thể gán ({filteredQuizzes.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectAll(filteredQuizzes)}
                    disabled={filteredQuizzes.length === 0}
                    className="px-3 py-1.5 text-xs"
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeselectAll}
                    disabled={selectedQuizIds.length === 0}
                    className="px-3 py-1.5 text-xs"
                  >
                    Bỏ chọn tất cả
                  </Button>
                </div>
              </div>

              {/* Available Quizzes Grid */}
              <ScrollArea className="h-[450px]">
                <div className="pr-4">
                  {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {searchTerm
                          ? "Không tìm thấy quiz phù hợp"
                          : "Không có quiz nào có thể gán"}
                      </p>
                      <p className="text-xs mt-1 opacity-75">
                        Chỉ quiz đã kết thúc và chưa được gán mới có thể được
                        chọn
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pb-4">
                      {filteredQuizzes.map((quiz) => (
                        <QuizCard key={quiz.quiz_id} quiz={quiz} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              {/* Weight Management */}
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">
                    Thiết lập tỷ lệ điểm ({selectedQuizIds.length} quiz)
                  </h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoDistribute}
                      className="px-3 py-1.5 text-xs"
                    >
                      Phân bổ đều
                    </Button>
                    <div className="text-sm font-semibold">
                      Tổng: {getTotalWeight()}%
                      {Math.abs(getTotalWeight() - 100) > 0 && (
                        <span className="text-destructive ml-1">
                          (Phải = 100%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[450px]">
                <div className="grid grid-cols-2 gap-3 pr-4">
                  {selectedQuizIds.map((quizId) => {
                    const quiz = availableQuizzes.find(
                      (q) => q.quiz_id === quizId
                    );
                    const currentWeight = quizWeights[quizId] || 0;

                    return (
                      <div
                        key={quizId}
                        className="p-3 bg-white rounded-md border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium truncate flex-1 mr-2">
                            {quiz?.name || `Quiz ${quizId}`}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={currentWeight || ""}
                              onChange={(e) =>
                                handleWeightChange(
                                  quizId,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 h-7 text-xs text-center"
                              placeholder="0"
                            />
                            <span className="text-xs text-muted-foreground">
                              %
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Slider
                            value={[currentWeight]}
                            onValueChange={(value) =>
                              handleWeightChange(quizId, value[0])
                            }
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span className="font-medium">
                              {currentWeight}%
                            </span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm text-muted-foreground font-medium">
            {currentStep === "select"
              ? `Đã chọn: ${selectedQuizIds.length} quiz`
              : `Tổng tỷ lệ: ${getTotalWeight()}%`}
          </div>
          <div className="flex gap-2">
            {currentStep === "weight" && (
              <Button
                variant="outline"
                onClick={handleBackStep}
                disabled={loading}
                size="default"
                className="px-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quay lại
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              size="default"
              className="px-4"
            >
              Hủy
            </Button>
            {currentStep === "select" ? (
              <Button
                onClick={handleNextStep}
                disabled={selectedQuizIds.length === 0}
                size="default"
                className="px-4"
              >
                Tiếp theo
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  selectedQuizIds.length === 0 ||
                  Math.abs(getTotalWeight() - 100) > 0
                }
                size="default"
                className="px-4"
              >
                {loading ? "Đang gán..." : "Gán quiz"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
