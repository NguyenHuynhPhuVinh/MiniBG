"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  ArrowUpDown,
  User,
  Mail,
  Calculator,
  RefreshCw,
  History,
  Award,
} from "lucide-react";
import { GradeColumnWithRelations } from "@/lib/types/course-grade";
import type { StudentGradeData } from "@/lib/types/student-grade";
import { cn } from "@/lib/utils";

interface StudentGradeTableProps {
  gradeColumns: GradeColumnWithRelations[];
  studentGrades: StudentGradeData[];
  onUpdateFinalScore: (studentId: number, score: number) => Promise<void>;
  onRecalculateGrade?: (studentId: number) => Promise<void>;
}

type SortField =
  | "student_name"
  | "process_average"
  | "final_exam_score"
  | "total_score"
  | "grade"
  | string;
type SortOrder = "asc" | "desc";

export function StudentGradeTable({
  gradeColumns,
  studentGrades,
  onUpdateFinalScore,
  onRecalculateGrade,
}: StudentGradeTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [editingFinalScore, setEditingFinalScore] = useState<{
    studentId: number;
    value: string;
  } | null>(null);
  const [sortField, setSortField] = useState<SortField>("student_name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingActions, setLoadingActions] = useState<Set<number>>(new Set());
  const itemsPerPage = 20;

  // Toggle row expansion
  const toggleRowExpansion = (studentId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedRows(newExpanded);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sort students data
  const sortedStudents = useMemo(() => {
    return [...studentGrades].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "student_name") {
        aValue = a.student_name.toLowerCase();
        bValue = b.student_name.toLowerCase();
      } else if (sortField === "process_average") {
        aValue = a.process_average;
        bValue = b.process_average;
      } else if (sortField === "final_exam_score") {
        aValue = a.final_exam_score ?? -1;
        bValue = b.final_exam_score ?? -1;
      } else if (sortField === "total_score") {
        aValue = a.total_score;
        bValue = b.total_score;
      } else if (sortField === "grade") {
        aValue = a.grade;
        bValue = b.grade;
      } else {
        // Handle grade column sorting
        const columnId = parseInt(sortField);
        aValue = a.grade_scores[columnId] ?? -1;
        bValue = b.grade_scores[columnId] ?? -1;
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
    });
  }, [studentGrades, sortField, sortOrder]);

  // Paginate data
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedStudents, currentPage]);

  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);

  // Handle final exam score editing
  const startEditingFinalScore = (studentId: number, currentScore?: number) => {
    setEditingFinalScore({
      studentId,
      value: currentScore?.toString() || "",
    });
  };

  const cancelEditingFinalScore = () => {
    setEditingFinalScore(null);
  };

  const saveFinalScore = async () => {
    if (!editingFinalScore) return;

    const score = parseFloat(editingFinalScore.value);
    if (isNaN(score) || score < 0 || score > 10) {
      alert("Điểm phải là số từ 0 đến 10");
      return;
    }

    try {
      await onUpdateFinalScore(editingFinalScore.studentId, score);
      setEditingFinalScore(null);
    } catch (error) {
      console.error("Error saving final score:", error);
    }
  };

  // Get grade badge color - memoized for performance
  const getGradeBadgeColor = useMemo(() => {
    return (grade: string) => {
      switch (grade) {
        case "A":
        case "A+":
          return "bg-green-100 text-green-800";
        case "B":
        case "B+":
          return "bg-blue-100 text-blue-800";
        case "C":
        case "C+":
          return "bg-yellow-100 text-yellow-800";
        case "D":
        case "D+":
          return "bg-orange-100 text-orange-800";
        case "F":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  }, []);

  // Render sort button
  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-1 font-medium"
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Bảng điểm sinh viên
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tổng cộng: {studentGrades.length} sinh viên</span>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="min-w-[200px]">
                  <SortButton field="student_name">Sinh viên</SortButton>
                </TableHead>
                {gradeColumns.map((column) => (
                  <TableHead
                    key={column.column_id}
                    className="text-center min-w-[100px]"
                  >
                    <SortButton field={column.column_id.toString()}>
                      {column.column_name}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        ({column.weight_percentage}%)
                      </span>
                    </SortButton>
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[100px]">
                  <SortButton field="process_average">
                    Điểm QT
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Trung bình
                    </span>
                  </SortButton>
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  <SortButton field="final_exam_score">
                    Thi CK
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Cuối kỳ
                    </span>
                  </SortButton>
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  <SortButton field="total_score">Tổng điểm</SortButton>
                </TableHead>
                <TableHead className="text-center min-w-[80px]">
                  <SortButton field="grade">Xếp loại</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => (
                <React.Fragment key={student.student_id}>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(student.student_id)}
                        className="h-6 w-6 p-0"
                      >
                        {expandedRows.has(student.student_id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {student.student_name}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.student_email}
                        </div>
                      </div>
                    </TableCell>
                    {gradeColumns.map((column) => (
                      <TableCell key={column.column_id} className="text-center">
                        {student.grade_scores[column.column_id] !==
                        undefined ? (
                          <span className="font-medium">
                            {student.grade_scores[column.column_id].toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <span className="font-medium">
                        {student.process_average.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {editingFinalScore?.studentId === student.student_id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={editingFinalScore.value}
                            onChange={(e) =>
                              setEditingFinalScore({
                                ...editingFinalScore,
                                value: e.target.value,
                              })
                            }
                            className="w-16 h-8 text-center"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={saveFinalScore}
                            className="h-6 w-6 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditingFinalScore}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium">
                            {student.final_exam_score?.toFixed(1) || "-"}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              startEditingFinalScore(
                                student.student_id,
                                student.final_exam_score
                              )
                            }
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">
                        {student.total_score.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "text-xs",
                          getGradeBadgeColor(student.grade)
                        )}
                      >
                        {student.grade}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {/* Expanded row content */}
                  {expandedRows.has(student.student_id) && (
                    <TableRow>
                      <TableCell colSpan={gradeColumns.length + 6}>
                        <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Chi tiết điểm số - {student.student_name}
                            </h4>
                            <div className="flex items-center gap-2">
                              {onRecalculateGrade && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    onRecalculateGrade(student.student_id)
                                  }
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Tính lại điểm
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <History className="h-3 w-3 mr-1" />
                                Lịch sử điểm
                              </Button>
                            </div>
                          </div>

                          {/* Grade Columns Breakdown */}
                          <div>
                            <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Chi tiết điểm từng cột
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {gradeColumns.map((column) => (
                                <div
                                  key={column.column_id}
                                  className="border rounded-lg p-3 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium text-sm">
                                      {column.column_name}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {column.weight_percentage}%
                                    </Badge>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">
                                        Điểm hiện tại:{" "}
                                      </span>
                                      <span className="font-medium">
                                        {student.grade_scores[
                                          column.column_id
                                        ]?.toFixed(1) || "Chưa có"}
                                      </span>
                                    </div>

                                    {/* Quiz scores breakdown - placeholder for now */}
                                    <div className="text-xs text-muted-foreground">
                                      <div>Quiz 1: 8.5</div>
                                      <div>Quiz 2: 7.0</div>
                                      <div>Quiz 3: 9.0</div>
                                      <div className="font-medium mt-1">
                                        Trung bình:{" "}
                                        {student.grade_scores[
                                          column.column_id
                                        ]?.toFixed(1) || "N/A"}
                                      </div>
                                    </div>
                                  </div>

                                  {column.description && (
                                    <div className="text-xs text-muted-foreground border-t pt-2">
                                      {column.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Final Exam Score Management */}
                          <div className="border-t pt-4">
                            <h5 className="font-medium text-sm mb-3">
                              Quản lý điểm thi cuối kỳ
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">
                                  Điểm thi cuối kỳ hiện tại
                                </label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={student.final_exam_score || ""}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      if (!isNaN(value)) {
                                        onUpdateFinalScore(
                                          student.student_id,
                                          value
                                        );
                                      }
                                    }}
                                    className="w-24"
                                    placeholder="0.0"
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    / 10
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">
                                  Tổng điểm cuối cùng
                                </label>
                                <div className="text-lg font-bold">
                                  {student.total_score.toFixed(1)} / 10
                                  <Badge
                                    className={cn(
                                      "ml-2",
                                      getGradeBadgeColor(student.grade)
                                    )}
                                  >
                                    {student.grade}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Grade History - placeholder */}
                          <div className="border-t pt-4">
                            <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                              <History className="h-4 w-4" />
                              Lịch sử thay đổi điểm
                            </h5>
                            <div className="text-sm text-muted-foreground">
                              <div className="space-y-1">
                                <div>
                                  • 15/08/2025 10:30 - Cập nhật điểm thi cuối
                                  kỳ: 8.5
                                </div>
                                <div>
                                  • 10/08/2025 14:20 - Cập nhật điểm Quiz 3: 9.0
                                </div>
                                <div>
                                  • 05/08/2025 09:15 - Cập nhật điểm Quiz 2: 7.0
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, sortedStudents.length)}{" "}
              trong tổng số {sortedStudents.length} sinh viên
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
