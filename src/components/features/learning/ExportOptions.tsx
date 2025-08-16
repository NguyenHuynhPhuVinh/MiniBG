"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Calendar,
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { GradeColumnWithRelations } from "@/lib/types/course-grade";
import type { StudentGradeData } from "@/lib/types/student-grade";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import { courseGradeService } from "@/lib/services/api/course-grade.service";
import { format as formatDate } from "date-fns";
import { vi } from "date-fns/locale";

interface ExportOptionsProps {
  courseId: number;
  courseName: string;
  totalStudents: number;
  gradeColumns: GradeColumnWithRelations[];
  studentGrades: StudentGradeData[];
}

type ExportFormat = "json" | "excel";

interface ExportProgress {
  isExporting: boolean;
  format: ExportFormat | null;
  progress: number;
  message: string;
}

export function ExportOptions({
  courseId,
  courseName,
  totalStudents,
  gradeColumns,
  studentGrades,
}: ExportOptionsProps) {
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    format: null,
    progress: 0,
    message: "",
  });

  // Generate file name
  const generateFileName = (format: ExportFormat) => {
    const timestamp = formatDate(new Date(), "yyyyMMdd_HHmmss");
    return `ket_qua_hoc_tap_${courseId}_${timestamp}.${
      format === "json" ? "json" : "xlsx"
    }`;
  };

  // Handle JSON export (client-side)
  const handleJsonExport = async () => {
    try {
      setExportProgress({
        isExporting: true,
        format: "json",
        progress: 0,
        message: "Đang chuẩn bị dữ liệu...",
      });

      // Simulate progress
      setExportProgress((prev) => ({
        ...prev,
        progress: 25,
        message: "Đang xử lý dữ liệu sinh viên...",
      }));

      // Prepare export data
      const exportData = {
        metadata: {
          course_id: courseId,
          course_name: courseName,
          export_date: new Date().toISOString(),
          total_students: totalStudents,
          total_grade_columns: gradeColumns.length,
          exported_by: "Current User", // TODO: Get from auth context
        },
        grade_columns: gradeColumns.map((col) => ({
          column_id: col.column_id,
          column_name: col.column_name,
          weight_percentage: col.weight_percentage,
          column_order: col.column_order,
          description: col.description,
        })),
        student_results: studentGrades.map((student) => ({
          student_id: student.student_id,
          student_name: student.student_name,
          student_email: student.student_email,
          grade_scores: student.grade_scores,
          process_average: student.process_average,
          final_exam_score: student.final_exam_score,
          total_score: student.total_score,
          grade: student.grade,
        })),
      };

      setExportProgress((prev) => ({
        ...prev,
        progress: 75,
        message: "Đang tạo file JSON...",
      }));

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = generateFileName("json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportProgress((prev) => ({
        ...prev,
        progress: 100,
        message: "Hoàn thành!",
      }));

      setTimeout(() => {
        setExportProgress({
          isExporting: false,
          format: null,
          progress: 0,
          message: "",
        });
        showSuccessToast("Xuất file JSON thành công");
      }, 1000);
    } catch (error) {
      console.error("Error exporting JSON:", error);
      showErrorToast("Không thể xuất file JSON");
      setExportProgress({
        isExporting: false,
        format: null,
        progress: 0,
        message: "",
      });
    }
  };

  // Handle Excel export (server-side)
  const handleExcelExport = async () => {
    try {
      setExportProgress({
        isExporting: true,
        format: "excel",
        progress: 0,
        message: "Đang gửi yêu cầu đến server...",
      });

      setExportProgress((prev) => ({
        ...prev,
        progress: 25,
        message: "Server đang xử lý dữ liệu...",
      }));

      // Call actual API
      const response = await courseGradeService.exportResults(
        courseId,
        "excel"
      );

      if (!response.success) {
        throw new Error(response.message || "Không thể xuất file Excel");
      }

      setExportProgress((prev) => ({
        ...prev,
        progress: 75,
        message: "Đang tạo file Excel...",
      }));

      // Download the file from server
      const fileUrl = response.data.file_url;
      const fileName = response.data.file_name;

      // Create download link
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportProgress((prev) => ({
        ...prev,
        progress: 100,
        message: "Hoàn thành!",
      }));

      setTimeout(() => {
        setExportProgress({
          isExporting: false,
          format: null,
          progress: 0,
          message: "",
        });
        showSuccessToast("Xuất file Excel thành công");
      }, 1000);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      showErrorToast(
        error instanceof Error ? error.message : "Không thể xuất file Excel"
      );
      setExportProgress({
        isExporting: false,
        format: null,
        progress: 0,
        message: "",
      });
    }
  };

  // Handle export based on format
  const handleExport = (format: ExportFormat) => {
    if (exportProgress.isExporting) return;

    if (format === "json") {
      handleJsonExport();
    } else {
      handleExcelExport();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Tùy chọn xuất file
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Ngày xuất</p>
              <p className="text-xs text-blue-700">
                {formatDate(new Date(), "dd/MM/yyyy HH:mm", { locale: vi })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Tổng sinh viên
              </p>
              <p className="text-xs text-green-700">{totalStudents} người</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">Cột điểm</p>
              <p className="text-xs text-purple-700">
                {gradeColumns.length} cột
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-900">Trạng thái</p>
              <p className="text-xs text-orange-700">Sẵn sàng</p>
            </div>
          </div>
        </div>

        {/* Export Progress */}
        {exportProgress.isExporting && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900">
                  Đang xuất file {exportProgress.format?.toUpperCase()}
                </p>
                <p className="text-sm text-blue-700">
                  {exportProgress.message}
                </p>
              </div>
            </div>
            <Progress value={exportProgress.progress} className="h-2" />
            <p className="text-xs text-blue-600 mt-2">
              {exportProgress.progress}% hoàn thành
            </p>
          </div>
        )}

        {/* Export Format Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* JSON Export */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <FileJson className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Xuất JSON</h3>
                <p className="text-sm text-muted-foreground">
                  Định dạng dữ liệu có cấu trúc, phù hợp cho xử lý tự động
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Bao gồm metadata đầy đủ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Xử lý nhanh (client-side)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Phù hợp cho API integration</span>
              </div>
            </div>
            <Button
              onClick={() => handleExport("json")}
              disabled={exportProgress.isExporting}
              className="w-full"
            >
              <FileJson className="h-4 w-4 mr-2" />
              Xuất JSON
            </Button>
          </div>

          {/* Excel Export */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Xuất Excel</h3>
                <p className="text-sm text-muted-foreground">
                  Định dạng bảng tính, dễ đọc và chỉnh sửa
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Định dạng bảng tính chuẩn</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Dễ đọc và in ấn</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Xử lý server-side (chậm hơn)</span>
              </div>
            </div>
            <Button
              onClick={() => handleExport("excel")}
              disabled={exportProgress.isExporting}
              variant="outline"
              className="w-full"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* File Naming Convention Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Quy tắc đặt tên file:</h4>
          <p className="text-xs text-muted-foreground">
            <code>{`ket_qua_hoc_tap_{courseId}_{timestamp}.{extension}`}</code>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ví dụ: <code>{generateFileName("json")}</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
