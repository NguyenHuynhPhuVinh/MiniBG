"use client";

import React from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import { Plus, Target } from "lucide-react";
import Link from "next/link";
import { POsDataTable } from "@/components/features/admin/pos";

export default function POsListPage() {
  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8" />
              Chuẩn đầu ra chương trình
            </h1>
            <p className="text-muted-foreground">
              Quản lý các chuẩn đầu ra chương trình trong hệ thống
            </p>
          </div>
          <Link href="/dashboard/admin/pos/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm chuẩn đầu ra mới
            </Button>
          </Link>
        </div>

        {/* Data Table */}
        <POsDataTable />
      </div>
    </AdminOnly>
  );
}
