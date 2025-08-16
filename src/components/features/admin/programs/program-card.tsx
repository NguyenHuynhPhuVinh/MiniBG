"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Users,
  Target,
  GraduationCap,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";

import { programService } from "@/lib/services/api";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import type { ProgramWithRelations } from "@/lib/types/program-management";

interface ProgramCardProps {
  program: ProgramWithRelations;
  onUpdate?: () => void;
  className?: string;
}

export function ProgramCard({
  program,
  onUpdate,
  className,
}: ProgramCardProps) {
  const router = useRouter();

  // Handle actions
  const handleView = () => {
    router.push(`/dashboard/admin/programs/${program.program_id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/admin/programs/${program.program_id}?tab=edit`);
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chương trình "${program.name}"?`)) {
      return;
    }

    try {
      await programService.deleteProgramById(program.program_id);
      showSuccessToast("Đã xóa chương trình thành công");
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      showErrorToast("Không thể xóa chương trình");
    }
  };

  const handleManagePOs = () => {
    router.push(`/dashboard/admin/programs/${program.program_id}?tab=pos`);
  };

  const handleManagePLOs = () => {
    router.push(`/dashboard/admin/programs/${program.program_id}?tab=plos`);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">
                {program.name}
              </CardTitle>
              {program.code && (
                <CardDescription className="mt-1">
                  Mã: {program.code}
                </CardDescription>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleManagePOs}>
                <Target className="h-4 w-4 mr-2" />
                Quản lý POs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManagePLOs}>
                <Users className="h-4 w-4 mr-2" />
                Quản lý PLOs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {program.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {program.description}
          </p>
        )}

        {/* Duration */}
        {program.duration_years && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{program.duration_years} năm</span>
          </div>
        )}

        {/* Statistics */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {program._count?.POs || 0}
            </span>
            <span className="text-xs text-muted-foreground">POs</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {program._count?.PLOs || 0}
            </span>
            <span className="text-xs text-muted-foreground">PLOs</span>
          </div>
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {program._count?.Courses || 0}
            </span>
            <span className="text-xs text-muted-foreground">Môn học</span>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Tạo:{" "}
            {program.created_at
              ? new Date(program.created_at).toLocaleDateString("vi-VN")
              : "Không xác định"}
          </span>
          <Badge variant="secondary" className="text-xs">
            ID: {program.program_id}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Sửa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
