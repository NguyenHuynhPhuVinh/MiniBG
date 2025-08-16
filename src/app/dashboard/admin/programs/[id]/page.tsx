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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import { Skeleton } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/feedback";
import {
  ArrowLeft,
  Edit,
  BookOpen,
  Users,
  Target,
  GraduationCap,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";

import { programService } from "@/lib/services/api";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { ProgramForm } from "@/components/features/admin/programs";
import type { ProgramWithRelations } from "@/lib/types/program-management";

interface ProgramDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [programId, setProgramId] = useState<number | null>(null);
  const [program, setProgram] = useState<ProgramWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  // Get tab from URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    const editParam = searchParams.get("edit");

    if (editParam === "true") {
      setIsEditing(true);
    } else if (tab && ["overview", "pos", "plos", "courses"].includes(tab)) {
      setActiveTab(tab);
      setIsEditing(false);
    }
  }, [searchParams]);

  // Extract program ID from params
  useEffect(() => {
    const extractId = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      if (!isNaN(id)) {
        setProgramId(id);
      }
    };
    extractId();
  }, [params]);

  // Fetch program data
  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [programId]);

  const fetchProgram = async () => {
    if (!programId) return;

    try {
      setLoading(true);
      const response = await programService.getProgramById(programId);

      if (response.success) {
        setProgram(response.data);
      }
    } catch (error) {
      showErrorToast("Không thể tải thông tin chương trình đào tạo");
      console.error("Error fetching program:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsEditing(false);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    url.searchParams.delete("edit");
    router.replace(url.pathname + url.search);
  };

  // Handle form success
  const handleFormSuccess = () => {
    fetchProgram(); // Refresh data
    setIsEditing(false); // Exit edit mode
    setActiveTab("overview"); // Switch back to overview
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    url.searchParams.set("tab", "overview");
    router.replace(url.pathname + url.search);
  };

  if (loading) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-80" />
              <Skeleton className="h-4 w-60" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminOnly>
    );
  }

  if (!program) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Không tìm thấy chương trình
            </h2>
            <p className="text-muted-foreground mb-4">
              Chương trình đào tạo với ID {programId} không tồn tại hoặc đã bị
              xóa.
            </p>
            <Link href="/dashboard/admin/programs">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>
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
              <BookOpen className="h-8 w-8" />
              {program.name}
            </h1>
            <p className="text-muted-foreground">
              Quản lý thông tin chương trình đào tạo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/programs">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <ProgramForm
            mode="edit"
            initialData={program}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsEditing(false);
              const url = new URL(window.location.href);
              url.searchParams.delete("edit");
              router.replace(url.pathname + url.search);
            }}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="pos" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                POs
              </TabsTrigger>
              <TabsTrigger value="plos" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                PLOs
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Môn học
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Program Info */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Thông tin chương trình</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
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
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Tên chương trình
                        </label>
                        <p className="text-lg font-semibold">{program.name}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          ID chương trình
                        </label>
                        <p className="font-medium">#{program.program_id}</p>
                      </div>

                      {program.description && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Mô tả
                          </label>
                          <p className="text-sm leading-relaxed">
                            {program.description}
                          </p>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <label className="text-sm font-medium text-muted-foreground">
                          Thống kê
                        </label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                              {program.POs?.length || 0}
                            </p>
                            <p className="text-sm text-blue-600">POs</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                              {program.PLOs?.length || 0}
                            </p>
                            <p className="text-sm text-green-600">PLOs</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">
                              {program.Courses?.length || 0}
                            </p>
                            <p className="text-sm text-purple-600">Courses</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Thao tác nhanh</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link
                        href={`/dashboard/admin/pos?program=${program.program_id}`}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Quản lý POs ({program.POs?.length || 0})
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/admin/plos?program=${program.program_id}`}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Quản lý PLOs ({program.PLOs?.length || 0})
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* POs Tab */}
            <TabsContent value="pos">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Program Outcomes (POs)</CardTitle>
                      <CardDescription>
                        Các chuẩn đầu ra chương trình (
                        {program.POs?.length || 0})
                      </CardDescription>
                    </div>
                    <Link
                      href={`/dashboard/admin/pos?program=${program.program_id}`}
                    >
                      <Button variant="outline" size="sm">
                        Quản lý POs
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {program.POs && program.POs.length > 0 ? (
                    <div className="space-y-3">
                      {program.POs.map((po) => (
                        <div
                          key={po.po_id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{po.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {po.po_id}
                            </p>
                          </div>
                          <Link href={`/dashboard/admin/pos/${po.po_id}`}>
                            <Button variant="ghost" size="sm">
                              Xem chi tiết
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có PO nào cho chương trình này</p>
                      <Link
                        href={`/dashboard/admin/pos/create?program=${program.program_id}`}
                      >
                        <Button variant="outline" size="sm" className="mt-2">
                          Tạo PO đầu tiên
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PLOs Tab */}
            <TabsContent value="plos">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Program Learning Outcomes (PLOs)</CardTitle>
                      <CardDescription>
                        Các chuẩn đầu ra học phần ({program.PLOs?.length || 0})
                      </CardDescription>
                    </div>
                    <Link
                      href={`/dashboard/admin/plos?program=${program.program_id}`}
                    >
                      <Button variant="outline" size="sm">
                        Quản lý PLOs
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {program.PLOs && program.PLOs.length > 0 ? (
                    <div className="space-y-3">
                      {program.PLOs.map((plo) => (
                        <div
                          key={plo.plo_id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{plo.description}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {plo.plo_id}
                            </p>
                          </div>
                          <Link href={`/dashboard/admin/plos/${plo.plo_id}`}>
                            <Button variant="ghost" size="sm">
                              Xem chi tiết
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có PLO nào cho chương trình này</p>
                      <Link
                        href={`/dashboard/admin/plos/create?program=${program.program_id}`}
                      >
                        <Button variant="outline" size="sm" className="mt-2">
                          Tạo PLO đầu tiên
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Môn học liên quan</CardTitle>
                  <CardDescription>
                    Các môn học thuộc chương trình (
                    {program.Courses?.length || 0}
                    )
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Môn học được quản lý bởi giáo viên
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {program.Courses && program.Courses.length > 0 ? (
                    <div className="space-y-3">
                      {program.Courses.map((course) => (
                        <div
                          key={course.course_id}
                          className="p-3 border rounded-lg"
                        >
                          <p className="font-medium">{course.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {course.course_id}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có môn học nào cho chương trình này</p>
                      <p className="text-xs mt-2">
                        Môn học sẽ được tạo bởi giáo viên
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminOnly>
  );
}
