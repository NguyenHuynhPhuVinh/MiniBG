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
import { ArrowLeft, Edit, FileText } from "lucide-react";
import Link from "next/link";

interface LODetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LODetailPage({ params }: LODetailPageProps) {
  const { id } = await params;

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
              Chi tiết Learning Outcome #{id}
            </h1>
            <p className="text-muted-foreground">
              Xem và chỉnh sửa thông tin Learning Outcome
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Button>
            <Link href="/dashboard/teaching/los">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin Learning Outcome</CardTitle>
            <CardDescription>
              Chi tiết về Learning Outcome #{id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                Chi tiết Learning Outcome sẽ được triển khai trong story tiếp
                theo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
