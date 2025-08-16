"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { courseService } from "@/lib/services/api/course.service";
import { courseGradeService } from "@/lib/services/api/course-grade.service";
import { CourseWithRelations } from "@/lib/types/course";
import { GradeColumnWithRelations } from "@/lib/types/course-grade";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { StudentGradeTable } from "@/components/features/learning/StudentGradeTable";
import { ExportOptions } from "@/components/features/learning/ExportOptions";

interface ExportResultsPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Move to shared types to avoid duplication
import type { StudentGradeData } from "@/lib/types/student-grade";

// Helper function to transform student data consistently
const transformStudentData = (students: any[]): StudentGradeData[] => {
  return students.map((student) => ({
    student_id: student.user_id,
    student_name: student.fullName,
    student_email: student.email,
    grade_scores: student.grade_scores || {}, // Use actual data if available
    process_average: student.process_average || 0,
    final_exam_score: student.final_exam_score,
    total_score: student.total_score || 0,
    grade: student.grade || "N/A",
  }));
};

export default function ExportResultsPage({ params }: ExportResultsPageProps) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<number | null>(null);
  const [course, setCourse] = useState<CourseWithRelations | null>(null);
  const [gradeColumns, setGradeColumns] = useState<GradeColumnWithRelations[]>(
    []
  );
  const [studentGrades, setStudentGrades] = useState<StudentGradeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract course ID from params
  useEffect(() => {
    const extractCourseId = async () => {
      try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        if (isNaN(id)) {
          showErrorToast("ID khóa học không hợp lệ");
          router.push("/dashboard/teaching/courses");
          return;
        }
        setCourseId(id);
      } catch (error) {
        console.error("Error extracting course ID:", error);
        showErrorToast("Lỗi khi xử lý tham số");
        router.push("/dashboard/teaching/courses");
      }
    };

    extractCourseId();
  }, [params, router]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);

        // Fetch course info
        const courseResponse = await courseService.getCourseById(courseId);
        if (!courseResponse.success) {
          throw new Error(
            courseResponse.message || "Không thể tải thông tin khóa học"
          );
        }
        setCourse(courseResponse.data);

        // Fetch grade columns
        const gradeColumnsResponse = await courseGradeService.getGradeColumns(
          courseId
        );
        if (!gradeColumnsResponse.success) {
          throw new Error("Không thể tải cột điểm");
        }
        setGradeColumns(gradeColumnsResponse.data.grade_columns);

        // Fetch student results
        const studentsResponse = await courseService.getCourseStudents(
          courseId
        );
        if (!studentsResponse.success) {
          throw new Error("Không thể tải danh sách sinh viên");
        }

        // Transform student data for table display
        const transformedData = transformStudentData(studentsResponse.data);
        setStudentGrades(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        showErrorToast(
          error instanceof Error ? error.message : "Không thể tải dữ liệu"
        );
        router.push("/dashboard/teaching/courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, router]);

  // Handle refresh data
  const handleRefreshData = async () => {
    if (!courseId) return;

    try {
      setIsRefreshing(true);

      // Re-fetch grade columns and student results
      const [gradeColumnsResponse, studentsResponse] = await Promise.all([
        courseGradeService.getGradeColumns(courseId),
        courseService.getCourseStudents(courseId),
      ]);

      if (gradeColumnsResponse.success) {
        setGradeColumns(gradeColumnsResponse.data.grade_columns);
      }

      if (studentsResponse.success) {
        const transformedData = transformStudentData(studentsResponse.data);
        setStudentGrades(transformedData);
      }

      showSuccessToast("Dữ liệu đã được làm mới");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showErrorToast("Không thể làm mới dữ liệu");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle final exam score update
  const handleUpdateFinalScore = async (studentId: number, score: number) => {
    // Input validation
    if (score < 0 || score > 10) {
      showErrorToast("Điểm phải nằm trong khoảng từ 0 đến 10");
      return;
    }

    try {
      const response = await courseGradeService.updateFinalExamScore(
        courseId!,
        {
          student_id: studentId,
          final_exam_score: score,
        }
      );

      if (response.success) {
        // Update local state optimistically
        setStudentGrades((prev) =>
          prev.map((student) =>
            student.student_id === studentId
              ? {
                  ...student,
                  final_exam_score: score,
                  // Recalculate total score if needed
                  total_score: student.process_average * 0.7 + score * 0.3,
                }
              : student
          )
        );
        showSuccessToast("Cập nhật điểm thi cuối kỳ thành công");
      } else {
        throw new Error(response.message || "Không thể cập nhật điểm");
      }
    } catch (error) {
      console.error("Error updating final score:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật điểm thi cuối kỳ";
      showErrorToast(errorMessage);
    }
  };

  // Handle individual grade recalculation
  const handleRecalculateGrade = async (studentId: number) => {
    try {
      const response = await courseGradeService.recalculateAllGrades(
        courseId!,
        {
          student_ids: [studentId],
          recalculate_all: false,
        }
      );

      if (response.success) {
        // Refresh student data
        const studentsResponse = await courseService.getCourseStudents(
          courseId!
        );
        if (studentsResponse.success) {
          const transformedData = transformStudentData(studentsResponse.data);
          setStudentGrades(transformedData);
        }
        showSuccessToast("Tính lại điểm thành công");
      } else {
        throw new Error(response.message || "Không thể tính lại điểm");
      }
    } catch (error) {
      console.error("Error recalculating grade:", error);
      showErrorToast("Không thể tính lại điểm");
    }
  };

  if (isLoading) {
    return (
      <RoleGuard
        roles={["teacher", "admin"]}
        fallback={<div>Bạn không có quyền truy cập trang này.</div>}
      >
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleGuard>
    );
  }

  if (!course) {
    return (
      <RoleGuard
        roles={["teacher", "admin"]}
        fallback={<div>Bạn không có quyền truy cập trang này.</div>}
      >
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy khóa học
            </h2>
            <p className="text-muted-foreground mb-4">
              Khóa học này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Link href="/dashboard/teaching/courses">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách khóa học
              </Button>
            </Link>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard
      roles={["teacher", "admin"]}
      fallback={<div>Bạn không có quyền truy cập trang này.</div>}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard/teaching/courses"
            className="hover:text-foreground"
          >
            Khóa học
          </Link>
          <span>→</span>
          <Link
            href={`/dashboard/teaching/courses/${courseId}`}
            className="hover:text-foreground"
          >
            {course.name}
          </Link>
          <span>→</span>
          <span className="text-foreground font-medium">
            Xuất kết quả học tập
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Download className="h-6 w-6 text-blue-600" />
              Xuất kết quả học tập
            </h1>
            <p className="text-muted-foreground">
              Xem và xuất báo cáo điểm số của sinh viên trong khóa học{" "}
              <strong>{course.name}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Làm mới dữ liệu
            </Button>
            <Link href={`/dashboard/teaching/courses/${courseId}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
          </div>
        </div>

        {/* Course Info Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tổng sinh viên
                  </p>
                  <p className="text-2xl font-bold">{studentGrades.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Cột điểm</p>
                  <p className="text-2xl font-bold">{gradeColumns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <p className="text-lg font-semibold text-green-600">
                    Sẵn sàng xuất
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <ExportOptions
          courseId={courseId!}
          courseName={course.name}
          totalStudents={studentGrades.length}
          gradeColumns={gradeColumns}
          studentGrades={studentGrades}
        />

        {/* Student Grade Table */}
        <StudentGradeTable
          gradeColumns={gradeColumns}
          studentGrades={studentGrades}
          onUpdateFinalScore={handleUpdateFinalScore}
          onRecalculateGrade={handleRecalculateGrade}
        />
      </div>
    </RoleGuard>
  );
}
