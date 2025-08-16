"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge, Skeleton } from "@/components/ui/feedback";
import {
  Edit,
  Trash2,
  Link as LinkIcon,
  Unlink,
  FileText,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

import type { GradeColumnWithRelations } from "@/lib/types/course-grade";

interface GradeColumnListProps {
  columns: GradeColumnWithRelations[];
  loading: boolean;
  isLoadingQuizzes?: boolean;
  courseId?: number;
  onEdit: (column: GradeColumnWithRelations) => void;
  onDelete: (columnId: number) => void;
  onAssignQuizzes: (column: GradeColumnWithRelations) => void;
  onUnassignQuizzes: (column: GradeColumnWithRelations) => void;
}

export function GradeColumnList({
  columns,
  loading,
  isLoadingQuizzes = false,
  courseId,
  onEdit,
  onDelete,
  onAssignQuizzes,
  onUnassignQuizzes,
}: GradeColumnListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Chưa có cột điểm nào</h3>
          <p className="text-muted-foreground mb-4">
            Bắt đầu bằng cách tạo cột điểm đầu tiên cho khóa học này.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total weight for validation
  const totalWeight = columns.reduce(
    (sum, col) => sum + (Number(col.weight_percentage) || 0),
    0
  );
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Danh sách cột điểm
              <Badge
                variant={isWeightValid ? "default" : "destructive"}
                className="ml-2"
              >
                {columns.length} cột
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Tên cột</th>
                    <th className="text-left py-3 px-2 font-medium">
                      Trọng số
                    </th>
                    <th className="text-left py-3 px-2 font-medium">Mô tả</th>
                    <th className="text-left py-3 px-2 font-medium">
                      Quiz đã gán
                    </th>
                    <th className="text-right py-3 px-2 font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((column) => {
                    const quizCount = column.Quizzes?.length || 0;

                    return (
                      <tr
                        key={column.column_id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {column.column_name}
                            </span>
                            {!column.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                Không hoạt động
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <Badge variant="outline" className="font-mono">
                            {(Number(column.weight_percentage) || 0).toFixed(1)}
                            %
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-sm text-muted-foreground">
                            {column.description || "Không có mô tả"}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={quizCount > 0 ? "default" : "secondary"}
                              className="font-mono"
                            >
                              {quizCount} quiz
                            </Badge>
                            {quizCount === 0 && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAssignQuizzes(column)}
                              disabled={isLoadingQuizzes}
                              className="flex items-center gap-1"
                            >
                              <LinkIcon className="h-3 w-3" />
                              {isLoadingQuizzes ? "Đang tải..." : "Gán Quiz"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUnassignQuizzes(column)}
                              disabled={isLoadingQuizzes || quizCount === 0}
                              className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                            >
                              <Unlink className="h-3 w-3" />
                              Gỡ Quiz
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onEdit(column)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDelete(column.column_id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              Xóa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Danh sách cột điểm
          </h3>
          <Badge variant={isWeightValid ? "default" : "destructive"}>
            {columns.length} cột
          </Badge>
        </div>

        {columns.map((column) => {
          const quizCount = column.Quizzes?.length || 0;

          return (
            <Card key={column.column_id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {column.column_name}
                    {!column.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Không hoạt động
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge variant="outline" className="font-mono">
                    {(Number(column.weight_percentage) || 0).toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {column.description && (
                  <p className="text-sm text-muted-foreground">
                    {column.description}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Quiz đã gán:
                  </span>
                  <Badge
                    variant={quizCount > 0 ? "default" : "secondary"}
                    className="font-mono"
                  >
                    {quizCount} quiz
                  </Badge>
                  {quizCount === 0 && (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAssignQuizzes(column)}
                    disabled={isLoadingQuizzes}
                    className="flex items-center gap-1"
                  >
                    <LinkIcon className="h-3 w-3" />
                    {isLoadingQuizzes ? "Đang tải..." : "Gán Quiz"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUnassignQuizzes(column)}
                    disabled={isLoadingQuizzes || quizCount === 0}
                    className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                  >
                    <Unlink className="h-3 w-3" />
                    Gỡ Quiz
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(column)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(column.column_id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Quick Actions Card */}
        {courseId && columns.length > 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Xem kết quả học tập</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Xem điểm số chi tiết của sinh viên và xuất báo cáo
                  </p>
                </div>
                <Link
                  href={`/dashboard/teaching/courses/${courseId}/export-results`}
                >
                  <Button className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Xem điểm sinh viên
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
