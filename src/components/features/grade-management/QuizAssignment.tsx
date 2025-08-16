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
  Unlink,
} from "lucide-react";
import { toast } from "sonner";

import { courseGradeService } from "@/lib/services/api/course-grade.service";
import type {
  GradeColumnWithRelations,
  AvailableQuiz,
  QuizAssignmentWithWeight,
} from "@/lib/types/course-grade";

interface QuizAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: GradeColumnWithRelations | null;
  availableQuizzes: AvailableQuiz[];
  courseId: number;
  onAssignmentComplete: () => void;
}

export function QuizAssignment({
  open,
  onOpenChange,
  column,
  availableQuizzes,
  courseId,
  onAssignmentComplete,
}: QuizAssignmentProps) {
  const [selectedQuizIds, setSelectedQuizIds] = useState<number[]>([]);
  const [currentlyAssigned, setCurrentlyAssigned] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // New state for weight management
  const [useWeights, setUseWeights] = useState(false);
  const [quizWeights, setQuizWeights] = useState<Record<number, number>>({});
  const [unassignMode, setUnassignMode] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Reset all state when dialog opens
      setSelectedQuizIds([]);
      setUseWeights(false);
      setQuizWeights({});
      setSearchTerm("");
      setUnassignMode(false);

      // Set currently assigned quizzes
      if (column?.Quizzes) {
        setCurrentlyAssigned(column.Quizzes.map((q) => q.quiz_id));
      }
    } else {
      // Reset state when dialog closes
      setSelectedQuizIds([]);
      setUseWeights(false);
      setQuizWeights({});
      setSearchTerm("");
      setUnassignMode(false);
    }
  }, [open, column]);

  // Load currently assigned quizzes when dialog opens
  useEffect(() => {
    if (open && column) {
      console.log("QuizAssignment Dialog - Column data:", column);
      console.log(
        "QuizAssignment Dialog - Available quizzes:",
        availableQuizzes
      );
      const assignedIds = column.Quizzes?.map((quiz) => quiz.quiz_id) || [];
      console.log("QuizAssignment Dialog - Assigned IDs:", assignedIds);
      setCurrentlyAssigned(assignedIds);
      setSelectedQuizIds([...assignedIds]);
    }
  }, [open, column, availableQuizzes]);

  // Filter quizzes based on search term and only show finished quizzes
  const filteredQuizzes = (availableQuizzes || []).filter(
    (quiz) =>
      quiz.status === "finished" && // Only show finished quizzes
      (quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.Subject?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get assigned quizzes from column data (not from availableQuizzes)
  const assignedQuizzes = (column?.Quizzes || [])
    .filter((quiz) => currentlyAssigned.includes(quiz.quiz_id))
    .filter(
      (quiz) =>
        quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.Subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Available quizzes are all unassigned (from API)
  const availableUnassigned = filteredQuizzes;

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

    const evenWeight = Math.round((100 / selectedQuizIds.length) * 100) / 100;
    const newWeights: Record<number, number> = {};

    selectedQuizIds.forEach((quizId, index) => {
      if (index === selectedQuizIds.length - 1) {
        // Last quiz gets the remainder to ensure total = 100%
        const usedWeight = (selectedQuizIds.length - 1) * evenWeight;
        newWeights[quizId] = Math.round((100 - usedWeight) * 100) / 100;
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
    setUnassignMode(false);
    onOpenChange(false);
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

  const handleDeselectAll = (quizzes: AvailableQuiz[] | any[]) => {
    const quizIds = quizzes.map((q) => q.quiz_id);
    setSelectedQuizIds((prev) => prev.filter((id) => !quizIds.includes(id)));
  };

  const handleSubmit = async () => {
    if (!column) return;

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
            `Tổng tỷ lệ phần trăm phải bằng 100%. Hiện tại: ${totalWeight.toFixed(
              2
            )}%`
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
        toast.success("Đã cập nhật gán quiz thành công");
        onAssignmentComplete();
        handleClose();
      } else {
        toast.error("Không thể cập nhật gán quiz");
      }
    } catch (error) {
      console.error("Error assigning quizzes:", error);
      toast.error("Lỗi khi gán quiz");
    } finally {
      setLoading(false);
    }
  };

  // Handle unassign specific quizzes
  const handleUnassignSelected = async () => {
    if (!column || selectedQuizIds.length === 0) return;

    try {
      setLoading(true);

      const response = await courseGradeService.unassignQuizzesFromColumn(
        courseId,
        column.column_id,
        { quiz_ids: selectedQuizIds }
      );

      if (response.success) {
        toast.success(
          `Đã bỏ gán ${response.data.unassigned_quizzes} quiz thành công`
        );

        // Update local state immediately for better UX
        setCurrentlyAssigned((prev) =>
          prev.filter((id) => !selectedQuizIds.includes(id))
        );
        setSelectedQuizIds([]);

        // Also refresh parent component data
        onAssignmentComplete();
      } else {
        toast.error("Không thể bỏ gán quiz");
      }
    } catch (error) {
      console.error("Error unassigning quizzes:", error);
      toast.error("Lỗi khi bỏ gán quiz");
    } finally {
      setLoading(false);
    }
  };

  // Handle unassign all quizzes
  const handleUnassignAll = async () => {
    if (!column) return;

    try {
      setLoading(true);

      const response = await courseGradeService.unassignAllQuizzesFromColumn(
        courseId,
        column.column_id
      );

      if (response.success) {
        toast.success(
          `Đã bỏ gán tất cả ${response.data.unassigned_quizzes} quiz thành công`
        );

        // Update local state immediately for better UX
        setCurrentlyAssigned([]);
        setSelectedQuizIds([]);

        // Also refresh parent component data
        onAssignmentComplete();
      } else {
        toast.error("Không thể bỏ gán tất cả quiz");
      }
    } catch (error) {
      console.error("Error unassigning all quizzes:", error);
      toast.error("Lỗi khi bỏ gán tất cả quiz");
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatusIcon = (quiz: AvailableQuiz) => {
    switch (quiz.status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "finished":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
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

  const QuizCard = ({
    quiz,
    isAssigned,
  }: {
    quiz: AvailableQuiz | any; // Allow both AvailableQuiz and column.Quizzes type
    isAssigned: boolean;
  }) => {
    const isSelected = selectedQuizIds.includes(quiz.quiz_id);

    return (
      <Card
        className={`cursor-pointer transition-colors ${
          isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleQuizToggle(quiz.quiz_id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {getQuizStatusIcon(quiz)}
                <h4 className="font-medium truncate">{quiz.name}</h4>
                <Badge
                  variant={getStatusBadgeVariant(quiz.status)}
                  className="text-xs"
                >
                  {quiz.status === "active" && "Đang diễn ra"}
                  {quiz.status === "finished" && "Đã kết thúc"}
                  {quiz.status === "pending" && "Chờ bắt đầu"}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  <span>{quiz.Subject?.name || "Không xác định"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{quiz.duration} phút</span>
                </div>
                {quiz.start_time && (
                  <div className="text-xs">
                    Bắt đầu: {new Date(quiz.start_time).toLocaleString("vi-VN")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!column) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Gán Quiz cho "{column.column_name}"
          </DialogTitle>
          <DialogDescription>
            Chọn các quiz để gán vào cột điểm này. Quiz đã gán sẽ được tính điểm
            theo trọng số của cột.
            <br />
            <span className="text-sm text-muted-foreground">
              * Chỉ hiển thị quiz đã kết thúc để đảm bảo tính chính xác của điểm
              số
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm quiz theo tên hoặc môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 flex-1 overflow-hidden">
            {/* Available Quizzes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Quiz đã kết thúc ({availableUnassigned.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectAll(availableUnassigned)}
                    disabled={availableUnassigned.length === 0}
                  >
                    Chọn tất cả
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {availableUnassigned.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? "Không tìm thấy quiz đã kết thúc phù hợp"
                            : "Không có quiz đã kết thúc nào có thể gán"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Chỉ quiz đã kết thúc mới có thể được gán vào cột điểm
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    availableUnassigned.map((quiz) => (
                      <QuizCard
                        key={quiz.quiz_id}
                        quiz={quiz}
                        isAssigned={false}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Currently Assigned Quizzes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Quiz đã gán ({assignedQuizzes.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeselectAll(assignedQuizzes)}
                    disabled={assignedQuizzes.length === 0}
                  >
                    <Unlink className="h-3 w-3 mr-1" />
                    Bỏ gán tất cả
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {assignedQuizzes.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Chưa có quiz nào được gán
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    assignedQuizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.quiz_id}
                        quiz={quiz}
                        isAssigned={true}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Weight Management Section */}
        {selectedQuizIds.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={useWeights}
                    onCheckedChange={(checked) => setUseWeights(!!checked)}
                  />
                  Sử dụng tỷ lệ phân bổ điểm tùy chỉnh
                </Label>
                {useWeights && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoDistribute}
                  >
                    Phân bổ đều
                  </Button>
                )}
              </div>
              {useWeights && (
                <div className="text-sm">
                  Tổng: {getTotalWeight().toFixed(2)}%
                  {Math.abs(getTotalWeight() - 100) > 0.01 && (
                    <span className="text-destructive ml-1">(Phải = 100%)</span>
                  )}
                </div>
              )}
            </div>

            {useWeights && selectedQuizIds.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {selectedQuizIds.map((quizId) => {
                  const quiz = availableQuizzes.find(
                    (q) => q.quiz_id === quizId
                  );
                  return (
                    <div key={quizId} className="flex items-center gap-2">
                      <Label className="text-xs truncate flex-1">
                        {quiz?.name || `Quiz ${quizId}`}
                      </Label>
                      <Input
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        value={quizWeights[quizId] || ""}
                        onChange={(e) =>
                          handleWeightChange(
                            quizId,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20 h-8 text-xs"
                        placeholder="0.00"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Đã chọn: {selectedQuizIds.length} quiz
            </div>
            {/* Unassign Controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnassignSelected}
                disabled={loading || selectedQuizIds.length === 0}
                className="text-destructive hover:text-destructive"
              >
                Bỏ gán đã chọn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnassignAll}
                disabled={loading || (column?.Quizzes?.length || 0) === 0}
                className="text-destructive hover:text-destructive"
              >
                Bỏ gán tất cả
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                (useWeights && Math.abs(getTotalWeight() - 100) > 0.01)
              }
            >
              {loading ? "Đang lưu..." : "Gán quiz"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
