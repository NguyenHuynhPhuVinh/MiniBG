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
  CheckSquare,
  BookOpen,
  Target,
  Users,
  Calendar,
  Code,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { ploService } from "@/lib/services/api/plo.service";
import type { PLOWithRelations } from "@/lib/types/program-management";
import {
  PLOForm,
  PLOStats,
  PLOActions,
} from "@/components/features/admin/plos";

interface PLODetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PLODetailPage({ params }: PLODetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plo, setPLO] = useState<PLOWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Get params
  const [ploId, setPloId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setPloId(resolvedParams.id);
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

  // Load PLO data
  useEffect(() => {
    if (!ploId) return;

    const loadPLO = async () => {
      try {
        setLoading(true);
        const response = await ploService.getPLOById(parseInt(ploId));
        if (response.success) {
          setPLO(response.data);
        }
      } catch (error) {
        console.error("Error loading PLO:", error);
        toast.error("Không thể tải thông tin chuẩn đầu ra học phần");
      } finally {
        setLoading(false);
      }
    };

    loadPLO();
  }, [ploId]);

  const handleEditSuccess = (updatedPLO: PLOWithRelations) => {
    setPLO(updatedPLO);
    setIsEditing(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    router.replace(url.pathname + url.search);
    toast.success("Chuẩn đầu ra học phần đã được cập nhật");
  };

  const handleUpdate = () => {
    // Reload PLO data
    if (ploId) {
      const loadPLO = async () => {
        try {
          const response = await ploService.getPLOById(parseInt(ploId));
          if (response.success) {
            setPLO(response.data);
          }
        } catch (error) {
          console.error("Error reloading PLO:", error);
        }
      };
      loadPLO();
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

  if (!plo) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Không tìm thấy chuẩn đầu ra học phần
              </p>
              <Link href="/dashboard/admin/plos">
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
                Chỉnh sửa chuẩn đầu ra học phần
              </h1>
              <p className="text-muted-foreground">
                Cập nhật thông tin chuẩn đầu ra học phần
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

          <PLOForm
            plo={plo}
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
              <CheckSquare className="h-8 w-8" />
              {plo.name || `PLO ${plo.plo_id}`}
            </h1>
            <p className="text-muted-foreground">
              Chi tiết chuẩn đầu ra học phần
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
            <PLOActions plo={plo} onUpdate={handleUpdate} variant="dropdown" />
            <Link href="/dashboard/admin/plos">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <PLOStats plo={plo} />

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
                {plo.name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tên chuẩn đầu ra học phần
                    </label>
                    <p className="text-lg font-semibold">{plo.name}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mô tả chi tiết
                  </label>
                  <p className="mt-1 text-sm leading-relaxed">
                    {plo.description || "Không có mô tả"}
                  </p>
                </div>

                {plo.code && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Mã chuẩn đầu ra học phần
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{plo.code}</Badge>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Tạo:{" "}
                      {new Date(plo.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Cập nhật:{" "}
                      {new Date(plo.updated_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Associated PO */}
            {plo.PO && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    PO liên quan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">{plo.PO.name}</div>
                    {plo.PO.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {plo.PO.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Program Info */}
            {plo.Program && (
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
                      <p className="font-medium">{plo.Program.name}</p>
                      {plo.Program.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {plo.Program.description}
                        </p>
                      )}
                    </div>
                    {plo.Program.code && (
                      <Badge variant="secondary" className="w-fit">
                        {plo.Program.code}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* LOs Count */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  LOs liên quan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {plo._count?.LOs || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Learning Outcomes
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
