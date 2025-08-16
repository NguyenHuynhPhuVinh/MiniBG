"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleGuard } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/navigation/tabs";
import {
  ArrowLeft,
  Edit,
  GraduationCap,
  Trash2,
  BarChart3,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { courseService } from "@/lib/services/api/course.service";
import { CourseWithRelations } from "@/lib/types/course";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { CourseOverview } from "@/components/features/course/CourseOverview";
import { CourseGradeManagementTab } from "@/components/features/course/CourseGradeManagementTab";
import { GradeSetupWizard } from "@/components/features/course/GradeSetupWizard";
import { EditCourseForm } from "@/components/features/course/EditCourseForm";
import { CourseDeleteDialog } from "@/components/features/course/CourseDeleteDialog";

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courseId, setCourseId] = useState<number | null>(null);
  const [course, setCourse] = useState<CourseWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview"
  );
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize course ID
  useEffect(() => {
    const initializeCourseId = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      if (!isNaN(id)) {
        setCourseId(id);
      } else {
        showErrorToast("ID khóa học không hợp lệ");
        router.push("/dashboard/teaching/courses");
      }
    };
    initializeCourseId();
  }, [params, router]);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        const response = await courseService.getCourseById(courseId);
        setCourse(response.data);
      } catch (error) {
        console.error("Error fetching course:", error);
        showErrorToast("Không thể tải thông tin khóa học");
        router.push("/dashboard/teaching/courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, router]);

  // Check for edit mode from URL
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam === "true") {
      setIsEditing(true);
    }
  }, [searchParams]);

  // Handle tab change with URL sync
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    url.searchParams.delete("edit"); // Remove edit param when switching tabs
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
    const url = new URL(window.location.href);
    url.searchParams.set("edit", "true");
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  // Handle successful course update
  const handleCourseUpdateSuccess = () => {
    // Refresh course data
    if (courseId) {
      courseService.getCourseById(courseId).then((response) => {
        setCourse(response.data);
      });
    }
    // Exit edit mode and clean URL
    setIsEditing(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Handle successful course deletion
  const handleCourseDeleteSuccess = () => {
    router.push("/dashboard/teaching/courses");
  };

  // Handle setup wizard
  const handleSetupWizard = () => {
    setIsSetupWizardOpen(true);
  };

  const handleSetupWizardSuccess = () => {
    // Refresh the page or trigger a re-fetch of grade columns
    window.location.reload();
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
              <Skeleton className="h-10 w-24" />
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
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              {course.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {course.description || "Xem và quản lý thông tin khóa học"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-destructive hover:text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </Button>
            <Link href="/dashboard/teaching/courses">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs Interface */}
        {/* Content */}
        {isEditing ? (
          <EditCourseForm
            initialData={course}
            onSuccess={handleCourseUpdateSuccess}
            onCancel={() => {
              setIsEditing(false);
              const url = new URL(window.location.href);
              url.searchParams.delete("edit");
              router.replace(url.pathname + url.search, { scroll: false });
            }}
          />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Tổng quan</span>
                <span className="sm:hidden">TQ</span>
              </TabsTrigger>
              <TabsTrigger
                value="grade-management"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Quản lý điểm</span>
                <span className="sm:hidden">QLĐ</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="overview" className="mt-6">
              <CourseOverview course={course} />
            </TabsContent>

            <TabsContent value="grade-management" className="mt-6">
              <CourseGradeManagementTab courseId={courseId!} />
            </TabsContent>
          </Tabs>
        )}

        {/* Grade Setup Wizard */}
        {courseId && (
          <GradeSetupWizard
            isOpen={isSetupWizardOpen}
            onClose={() => setIsSetupWizardOpen(false)}
            courseId={courseId}
            onSuccess={handleSetupWizardSuccess}
          />
        )}

        {/* Course Delete Dialog */}
        <CourseDeleteDialog
          course={course}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={handleCourseDeleteSuccess}
        />
      </div>
    </RoleGuard>
  );
}
