"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Target, 
  Users, 
  GraduationCap, 
  Download, 
  Copy,
  Archive,
  MoreHorizontal 
} from "lucide-react";

import { Button } from "@/components/ui/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/overlay";

import { programService } from "@/lib/services/api";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import type { Program } from "@/lib/types/program-management";

interface ProgramActionsProps {
  program: Program;
  onUpdate?: () => void;
  variant?: "default" | "compact" | "dropdown";
  className?: string;
}

export function ProgramActions({ 
  program, 
  onUpdate, 
  variant = "default",
  className 
}: ProgramActionsProps) {
  const router = useRouter();

  // Action handlers
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

  const handleManageCourses = () => {
    router.push(`/dashboard/admin/programs/${program.program_id}?tab=courses`);
  };

  const handleDuplicate = async () => {
    try {
      const duplicateData = {
        name: `${program.name} (Bản sao)`,
        description: program.description,
        code: program.code ? `${program.code}_COPY` : undefined,
        duration_years: program.duration_years,
      };

      const response = await programService.createProgram(duplicateData);
      
      if (response.success) {
        showSuccessToast("Đã tạo bản sao chương trình thành công");
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      showErrorToast("Không thể tạo bản sao chương trình");
    }
  };

  const handleExport = () => {
    // Simple export implementation
    const exportData = {
      program_id: program.program_id,
      name: program.name,
      description: program.description,
      code: program.code,
      duration_years: program.duration_years,
      created_at: program.created_at,
      updated_at: program.updated_at,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `program-${program.program_id}-${program.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccessToast("Đã xuất dữ liệu chương trình");
  };

  // Compact variant - just essential actions
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleView}
          title="Xem chi tiết"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          title="Chỉnh sửa"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          title="Xóa"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Dropdown variant - all actions in dropdown
  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
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
          <DropdownMenuItem onClick={handleManageCourses}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Quản lý môn học
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Tạo bản sao
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa chương trình
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant - button group
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Primary Actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleView}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Xem
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        className="flex items-center gap-2"
      >
        <Edit className="h-4 w-4" />
        Sửa
      </Button>

      {/* Secondary Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleManagePOs}>
            <Target className="h-4 w-4 mr-2" />
            Quản lý POs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleManagePLOs}>
            <Users className="h-4 w-4 mr-2" />
            Quản lý PLOs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleManageCourses}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Quản lý môn học
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Tạo bản sao
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu
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
  );
}
