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
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateLOPage() {
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
              Thêm Learning Outcome mới
            </h1>
            <p className="text-muted-foreground">
              Tạo Learning Outcome mới cho giảng dạy
            </p>
          </div>
          <Link href="/dashboard/teaching/los">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin Learning Outcome</CardTitle>
            <CardDescription>
              Nhập thông tin chi tiết cho Learning Outcome mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Form tạo Learning Outcome sẽ được triển khai trong story tiếp theo</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
