"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { CreateCourseWithGradesForm } from "@/components/features/course/CreateCourseWithGradesForm";

export default function CreateCoursePage() {
  const router = useRouter();

  const handleSuccess = (courseData: any) => {
    // Redirect to course detail page or courses list
    router.push("/dashboard/teaching/courses");
  };

  const handleCancel = () => {
    router.push("/dashboard/teaching/courses");
  };

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
              <Plus className="h-8 w-8" />
              Thêm khóa học mới
            </h1>
            <p className="text-muted-foreground">
              Tạo khóa học mới với cấu hình cột điểm
            </p>
          </div>
          <Link href="/dashboard/teaching/courses">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </div>

        {/* Form Content */}
        <CreateCourseWithGradesForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </RoleGuard>
  );
}
