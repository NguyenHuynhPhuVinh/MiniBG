"use client";

import React from "react";
import { RoleGuard } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import { Plus, GraduationCap } from "lucide-react";
import Link from "next/link";
import { CoursesDataTable } from "@/components/features/course/courses-data-table";

export default function CoursesListPage() {
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
              Khóa học của tôi
            </h1>
            <p className="text-muted-foreground">
              Quản lý các khóa học bạn đang giảng dạy
            </p>
          </div>
          <Link href="/dashboard/teaching/courses/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm khóa học mới
            </Button>
          </Link>
        </div>

        {/* Data Table */}
        <CoursesDataTable />
      </div>
    </RoleGuard>
  );
}
