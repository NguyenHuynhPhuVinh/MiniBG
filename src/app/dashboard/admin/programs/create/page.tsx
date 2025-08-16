"use client";

import React from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { ProgramForm } from "@/components/features/admin/programs";

export default function CreateProgramPage() {
  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Plus className="h-8 w-8" />
              Thêm chương trình đào tạo mới
            </h1>
            <p className="text-muted-foreground">
              Tạo chương trình đào tạo mới trong hệ thống
            </p>
          </div>
          <Link href="/dashboard/admin/programs">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </div>

        {/* Program Form */}
        <ProgramForm mode="create" />
      </div>
    </AdminOnly>
  );
}
