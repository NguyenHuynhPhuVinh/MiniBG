"use client";

import React from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import { Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import { ProgramsDataTable } from "@/components/features/admin/programs";

export default function ProgramsListPage() {
  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Chương trình đào tạo
            </h1>
            <p className="text-muted-foreground">
              Quản lý các chương trình đào tạo trong hệ thống
            </p>
          </div>
          <Link href="/dashboard/admin/programs/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm chương trình mới
            </Button>
          </Link>
        </div>

        {/* Data Table */}
        <ProgramsDataTable />
      </div>
    </AdminOnly>
  );
}
