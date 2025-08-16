"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminOnly } from "@/components/features/auth/role-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge, Skeleton } from "@/components/ui/feedback";
import {
  ArrowLeft,
  Edit,
  Target,
  BookOpen,
  Users,
  Calendar,
  Code,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { poService } from "@/lib/services/api/po.service";
import type { POWithRelations } from "@/lib/types/program-management";
import { POForm, POStats, POActions } from "@/components/features/admin/pos";

interface PODetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PODetailPage({ params }: PODetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [po, setPO] = useState<POWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Get params
  const [poId, setPoId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setPoId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Check for edit mode from URL
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam === "true") {
      setIsEditing(true);
    }
  }, [searchParams]);

  // Load PO data
  useEffect(() => {
    if (!poId) return;

    const loadPO = async () => {
      try {
        setLoading(true);
        const response = await poService.getPOById(parseInt(poId));
        if (response.success) {
          setPO(response.data);
        }
      } catch (error) {
        console.error("Error loading PO:", error);
        toast.error("Không thể tải thông tin chuẩn đầu ra");
      } finally {
        setLoading(false);
      }
    };

    loadPO();
  }, [poId, toast]);

  const handleEditSuccess = (updatedPO: POWithRelations) => {
    setPO(updatedPO);
    setIsEditing(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    router.replace(url.pathname + url.search);
    toast.success("Chuẩn đầu ra đã được cập nhật");
  };

  const handleUpdate = () => {
    // Reload PO data
    if (poId) {
      const loadPO = async () => {
        try {
          const response = await poService.getPOById(parseInt(poId));
          if (response.success) {
            setPO(response.data);
          }
        } catch (error) {
          console.error("Error reloading PO:", error);
        }
      };
      loadPO();
    }
  };

  if (loading) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminOnly>
    );
  }

  if (!po) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Không tìm thấy chuẩn đầu ra
              </p>
              <Link href="/dashboard/admin/pos">
                <Button className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminOnly>
    );
  }

  if (isEditing) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Edit className="h-8 w-8" />
                Chỉnh sửa chuẩn đầu ra
              </h1>
              <p className="text-muted-foreground">
                Cập nhật thông tin chuẩn đầu ra chương trình
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                const url = new URL(window.location.href);
                url.searchParams.delete("edit");
                router.replace(url.pathname + url.search);
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Hủy chỉnh sửa
            </Button>
          </div>

          <POForm
            po={po}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8" />
              {po.name}
            </h1>
            <p className="text-muted-foreground">
              Chi tiết chuẩn đầu ra chương trình
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setIsEditing(true);
                const url = new URL(window.location.href);
                url.searchParams.set("edit", "true");
                router.replace(url.pathname + url.search);
              }}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Button>
            <POActions po={po} onUpdate={handleUpdate} variant="dropdown" />
            <Link href="/dashboard/admin/pos">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <POStats po={po} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tên chuẩn đầu ra
                  </label>
                  <p className="text-lg font-semibold">{po.name}</p>
                </div>

                {po.code && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Mã chuẩn đầu ra
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{po.code}</Badge>
                    </div>
                  </div>
                )}

                {po.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Mô tả chi tiết
                    </label>
                    <p className="mt-1 text-sm leading-relaxed">
                      {po.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Tạo: {new Date(po.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Cập nhật:{" "}
                      {new Date(po.updated_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Program Info */}
            {po.Program && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Chương trình đào tạo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{po.Program.name}</p>
                      {po.Program.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {po.Program.description}
                        </p>
                      )}
                    </div>
                    {po.Program.code && (
                      <Badge variant="secondary" className="w-fit">
                        {po.Program.code}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PLOs Count */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  PLOs liên quan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {po._count?.PLOs || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Program Learning Outcomes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
