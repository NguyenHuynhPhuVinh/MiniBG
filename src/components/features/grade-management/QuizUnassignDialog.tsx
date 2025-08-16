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
import { Button } from "@/components/ui/forms";
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
  Unlink,
  Trash2,
  Play,
  FileCheck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { courseGradeService } from "@/lib/services/api/course-grade.service";
import type { GradeColumnWithRelations } from "@/lib/types/course-grade";

interface QuizUnassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: GradeColumnWithRelations | null;
  courseId: number;
  onUnassignComplete: () => void;
}

export function QuizUnassignDialog({
  open,
  onOpenChange,
  column,
  courseId,
  onUnassignComplete,
}: QuizUnassignDialogProps) {
  const [selectedQuizIds, setSelectedQuizIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedQuizIds([]);
      setSearchTerm("");
    } else {
      setSelectedQuizIds([]);
      setSearchTerm("");
    }
  }, [open]);

  // Get assigned quizzes from column data
  const assignedQuizzes = (column?.Quizzes || []).filter(
    (quiz) =>
      quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.Subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuizToggle = (quizId: number) => {
    setSelectedQuizIds((prev) => {
      if (prev.includes(quizId)) {
        return prev.filter((id) => id !== quizId);
      } else {
        return [...prev, quizId];
      }
    });
  };

  const handleSelectAll = () => {
    const allQuizIds = assignedQuizzes.map((q) => q.quiz_id);
    setSelectedQuizIds(allQuizIds);
  };

  const handleDeselectAll = () => {
    setSelectedQuizIds([]);
  };

  // Custom close handler to ensure state reset
  const handleClose = () => {
    setSelectedQuizIds([]);
    setSearchTerm("");
    onOpenChange(false);
  };

  const handleUnassignSelected = async () => {
    if (!column || selectedQuizIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một quiz để gỡ");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc chắn muốn gỗ ${selectedQuizIds.length} quiz đã chọn?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await courseGradeService.unassignQuizzesFromColumn(
        courseId,
        column.column_id,
        { quiz_ids: selectedQuizIds }
      );

      if (response.success) {
        toast.success(
          `Đã gỡ ${response.data.unassigned_quizzes} quiz thành công`
        );
        onUnassignComplete();
        handleClose();
      } else {
        toast.error("Không thể gỡ quiz");
      }
    } catch (error) {
      console.error("Error unassigning quizzes:", error);
      toast.error("Lỗi khi gỡ quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignAll = async () => {
    if (!column || assignedQuizzes.length === 0) return;

    if (
      !confirm(
        `Bạn có chắc chắn muốn gỡ tất cả ${assignedQuizzes.length} quiz đã gán?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await courseGradeService.unassignAllQuizzesFromColumn(
        courseId,
        column.column_id
      );

      if (response.success) {
        toast.success(
          `Đã gỡ tất cả ${response.data.unassigned_quizzes} quiz thành công`
        );
        onUnassignComplete();
        handleClose();
      } else {
        toast.error("Không thể gỡ tất cả quiz");
      }
    } catch (error) {
      console.error("Error unassigning all quizzes:", error);
      toast.error("Lỗi khi gỡ tất cả quiz");
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatusIcon = (quiz: any) => {
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

  const QuizCard = ({ quiz }: { quiz: any }) => {
    const isSelected = selectedQuizIds.includes(quiz.quiz_id);

    return (
      <div
        className={`p-2 border rounded-md cursor-pointer transition-all duration-200 hover:shadow-sm ${
          isSelected
            ? "ring-2 ring-destructive bg-destructive/5 border-destructive"
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
              {quiz.weight_percentage && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {quiz.weight_percentage}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!column) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Unlink className="h-5 w-5 text-destructive" />
            Gỡ Quiz khỏi "{column.column_name}"
          </DialogTitle>
          <DialogDescription className="text-sm">
            Chọn các quiz để gỡ khỏi cột điểm này. Quiz được gỡ sẽ không còn
            được tính điểm trong cột này.
            <span className="block text-xs text-yellow-600 mt-1">
              ⚠️ Điểm đã tính sẽ được cập nhật lại sau khi gỡ quiz
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-hidden">
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
          <div className="flex items-center justify-between bg-red-50 p-3 rounded-md border border-red-200">
            <h3 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Quiz đã gán ({assignedQuizzes.length})
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                disabled={assignedQuizzes.length === 0}
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

          {/* Assigned Quizzes */}
          <ScrollArea className="h-[380px]">
            <div className="pr-4">
              {assignedQuizzes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchTerm
                      ? "Không tìm thấy quiz phù hợp"
                      : "Chưa có quiz nào được gán"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pb-4">
                  {assignedQuizzes.map((quiz) => (
                    <QuizCard key={quiz.quiz_id} quiz={quiz} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground font-medium">
              Đã chọn: {selectedQuizIds.length} quiz
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUnassignAll}
              disabled={loading || assignedQuizzes.length === 0}
              className="flex items-center gap-1 px-3"
            >
              <Trash2 className="h-3 w-3" />
              Gỡ tất cả
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              size="default"
              className="px-4"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnassignSelected}
              disabled={loading || selectedQuizIds.length === 0}
              size="default"
              className="px-4"
            >
              {loading ? "Đang gỡ..." : "Gỡ quiz đã chọn"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
