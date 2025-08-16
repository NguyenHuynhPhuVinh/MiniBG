"use client";

import React from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import { Plus, CheckSquare } from "lucide-react";
import Link from "next/link";
import { PLOsDataTable } from "@/components/features/admin/plos";

export default function PLOsListPage() {
  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CheckSquare className="h-8 w-8" />
              Chuẩn đầu ra học phần
            </h1>
            <p className="text-muted-foreground">
              Quản lý các chuẩn đầu ra học phần trong hệ thống
            </p>
          </div>
          <Link href="/dashboard/admin/plos/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm chuẩn đầu ra học phần mới
            </Button>
          </Link>
        </div>

        {/* Data Table */}
        <PLOsDataTable />
      </div>
    </AdminOnly>
  );
}
