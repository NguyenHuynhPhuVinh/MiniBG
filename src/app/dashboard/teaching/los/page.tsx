"use client";

import React from "react";
import { RoleGuard } from "@/components/features/auth/role-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

export default function LOsListPage() {
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
              <FileText className="h-8 w-8" />
              Chuẩn đầu ra học phần
            </h1>
            <p className="text-muted-foreground">
              Quản lý các chuẩn đầu ra học phần cho giảng dạy
            </p>
          </div>
          <Link href="/dashboard/teaching/los/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm chuẩn đầu ra mới
            </Button>
          </Link>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách chuẩn đầu ra học phần</CardTitle>
            <CardDescription>
              Hiển thị tất cả các chuẩn đầu ra học phần bạn có thể quản lý
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                Chức năng danh sách Learning Outcomes sẽ được triển khai trong
                story tiếp theo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
