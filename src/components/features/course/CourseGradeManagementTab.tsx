"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge, Skeleton } from "@/components/ui/feedback";
import { Plus, AlertCircle, FileText, Users, Download } from "lucide-react";
import { toast } from "sonner";

import { courseGradeService } from "@/lib/services/api/course-grade.service";
import type {
  GradeColumnWithRelations,
  AvailableQuiz,
  GradeColumnFormData,
} from "@/lib/types/course-grade";

import {
  GradeColumnList,
  GradeColumnForm,
  QuizAssignDialog,
  QuizUnassignDialog,
} from "@/components/features/grade-management";

// Utility function to transform form data to API format
const transformFormDataToApiFormat = (
  data: GradeColumnFormData,
  columnOrder: number
) => ({
  column_name: data.name,
  weight_percentage: data.weight,
  column_order: columnOrder,
  description: data.description,
  course_id: data.course_id,
  is_active: true,
});

interface CourseGradeManagementTabProps {
  courseId: number;
}

export function CourseGradeManagementTab({
  courseId,
}: CourseGradeManagementTabProps) {
  // State management
  const [gradeColumns, setGradeColumns] = useState<GradeColumnWithRelations[]>(
    []
  );
  const [availableQuizzes, setAvailableQuizzes] = useState<AvailableQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQuizAssignmentOpen, setIsQuizAssignmentOpen] = useState(false);
  const [isQuizUnassignmentOpen, setIsQuizUnassignmentOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] =
    useState<GradeColumnWithRelations | null>(null);

  // Loading states for actions
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load grade columns data
  useEffect(() => {
    const loadGradeColumns = async () => {
      try {
        setLoading(true);
        const response = await courseGradeService.getGradeColumns(courseId);
        console.log("Grade Columns API Response:", response);
        if (response.success) {
          console.log("Grade Columns Data:", response.data.grade_columns);
          setGradeColumns(response.data.grade_columns);
        } else {
          toast.error("Không thể tải danh sách cột điểm");
        }
      } catch (error) {
        console.error("Error loading grade columns:", error);
        toast.error("Lỗi khi tải danh sách cột điểm");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadGradeColumns();
    }
  }, [courseId]);

  // Load available quizzes
  const loadAvailableQuizzes = async () => {
    try {
      const response = await courseGradeService.getAvailableQuizzes(courseId);
      console.log("Available Quizzes API Response:", response);
      if (response.success) {
        console.log("Available Quizzes Data:", response.data.available_quizzes);
        setAvailableQuizzes(response.data.available_quizzes);
      }
    } catch (error) {
      console.error("Error loading available quizzes:", error);
      toast.error("Lỗi khi tải danh sách quiz");
    }
  };

  // Event handlers
  const handleCreateColumn = () => {
    setSelectedColumn(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditColumn = (column: GradeColumnWithRelations) => {
    setSelectedColumn(column);
    setIsEditDialogOpen(true);
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa cột điểm này?")) {
      return;
    }

    try {
      const response = await courseGradeService.deleteGradeColumn(
        courseId,
        columnId
      );
      if (response.success) {
        setGradeColumns((prev) =>
          prev.filter((col) => col.column_id !== columnId)
        );
        toast.success("Đã xóa cột điểm thành công");
      } else {
        toast.error("Không thể xóa cột điểm");
      }
    } catch (error) {
      console.error("Error deleting grade column:", error);
      toast.error("Lỗi khi xóa cột điểm");
    }
  };

  const handleSubmitColumn = async (data: GradeColumnFormData) => {
    try {
      let response;

      // Transform form data to API format
      const apiData = transformFormDataToApiFormat(
        data,
        gradeColumns.length + 1 // Set order as next position
      );

      if (selectedColumn) {
        // Edit mode
        response = await courseGradeService.updateGradeColumn(
          courseId,
          selectedColumn.column_id,
          apiData
        );
      } else {
        // Create mode
        response = await courseGradeService.createGradeColumn(apiData);
      }

      if (response.success) {
        // Reload grade columns
        const columnsResponse = await courseGradeService.getGradeColumns(
          courseId
        );
        if (columnsResponse.success) {
          setGradeColumns(columnsResponse.data.grade_columns);
        }

        toast.success(
          selectedColumn
            ? "Đã cập nhật cột điểm thành công"
            : "Đã tạo cột điểm thành công"
        );

        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedColumn(null);
      } else {
        toast.error("Không thể lưu cột điểm");
      }
    } catch (error) {
      console.error("Error saving grade column:", error);
      toast.error("Lỗi khi lưu cột điểm");
    }
  };

  const handleAssignQuizzes = async (column: GradeColumnWithRelations) => {
    try {
      setIsLoadingQuizzes(true);
      setSelectedColumn(column);
      // Load available quizzes first, then open dialog
      await loadAvailableQuizzes();
      setIsQuizAssignmentOpen(true);
    } catch (error) {
      console.error("Error loading quizzes for assignment:", error);
      toast.error("Lỗi khi tải danh sách quiz");
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const handleUnassignQuizzes = async (column: GradeColumnWithRelations) => {
    setSelectedColumn(column);
    setIsQuizUnassignmentOpen(true);
  };

  const handleExportResults = async () => {
    try {
      setIsExporting(true);

      // Call API to export results as Excel
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/export-results?format=excel`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export results");
      }

      // Get the blob data
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ket-qua-khoa-hoc-${courseId}.xlsx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Đã xuất kết quả thành công");
    } catch (error) {
      console.error("Error exporting results:", error);
      toast.error("Lỗi khi xuất kết quả");
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate total weight percentage with memoization for performance
  const { totalWeight, isWeightValid } = useMemo(() => {
    const total = gradeColumns.reduce(
      (sum, col) => sum + (Number(col.weight_percentage) || 0),
      0
    );
    return {
      totalWeight: total,
      isWeightValid: Math.abs(total - 100) < 0.01,
    };
  }, [gradeColumns]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý điểm</h2>
          <p className="text-muted-foreground">
            Thiết lập và quản lý hệ thống điểm cho khóa học
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportResults}
            variant="outline"
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Đang xuất..." : "Xuất kết quả"}
          </Button>
          <Button
            onClick={handleCreateColumn}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm cột điểm
          </Button>
        </div>
      </div>

      {/* Grade Columns List */}
      <GradeColumnList
        columns={gradeColumns}
        loading={loading}
        isLoadingQuizzes={isLoadingQuizzes}
        courseId={courseId}
        onEdit={handleEditColumn}
        onDelete={handleDeleteColumn}
        onAssignQuizzes={handleAssignQuizzes}
        onUnassignQuizzes={handleUnassignQuizzes}
      />

      {/* Create Column Dialog */}
      <GradeColumnForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleSubmitColumn}
        existingColumns={gradeColumns}
        courseId={courseId}
      />

      {/* Edit Column Dialog */}
      <GradeColumnForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleSubmitColumn}
        existingColumns={gradeColumns}
        courseId={courseId}
        initialData={selectedColumn}
      />

      {/* Quiz Assignment Dialog */}
      <QuizAssignDialog
        open={isQuizAssignmentOpen}
        onOpenChange={setIsQuizAssignmentOpen}
        column={selectedColumn}
        availableQuizzes={availableQuizzes}
        courseId={courseId}
        onAssignmentComplete={() => {
          // Reload grade columns to update quiz counts
          const loadGradeColumns = async () => {
            const response = await courseGradeService.getGradeColumns(courseId);
            if (response.success) {
              setGradeColumns(response.data.grade_columns);
            }
          };
          loadGradeColumns();
        }}
      />

      {/* Quiz Unassignment Dialog */}
      <QuizUnassignDialog
        open={isQuizUnassignmentOpen}
        onOpenChange={setIsQuizUnassignmentOpen}
        column={selectedColumn}
        courseId={courseId}
        onUnassignComplete={() => {
          // Reload grade columns to update quiz counts
          const loadGradeColumns = async () => {
            const response = await courseGradeService.getGradeColumns(courseId);
            if (response.success) {
              setGradeColumns(response.data.grade_columns);
            }
          };
          loadGradeColumns();
        }}
      />
    </div>
  );
}
