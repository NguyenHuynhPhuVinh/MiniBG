"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";
import { Button } from "@/components/ui/forms";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Share,
} from "lucide-react";
import { toast } from "sonner";

import { poService } from "@/lib/services/api/po.service";
import type { POWithRelations } from "@/lib/types/program-management";
import { PODeleteDialog } from "./po-delete-dialog";

interface POActionsProps {
  po: POWithRelations;
  onUpdate?: () => void;
  variant?: "dropdown" | "buttons";
  size?: "sm" | "default" | "lg";
}

export function POActions({
  po,
  onUpdate,
  variant = "dropdown",
  size = "default",
}: POActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = () => {
    router.push(`/dashboard/admin/pos/${po.po_id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/admin/pos/${po.po_id}/edit`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(po, null, 2));
      toast.success("Thông tin chuẩn đầu ra đã được sao chép vào clipboard");
    } catch (error) {
      toast.error("Không thể sao chép thông tin");
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(po, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `po-${po.po_id}-${po.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Thông tin chuẩn đầu ra đã được xuất thành file JSON");
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await poService.deletePO(po.po_id);

      if (response.success) {
        toast.success("Chuẩn đầu ra đã được xóa thành công");
        onUpdate?.();
      }
    } catch (error) {
      toast.error("Không thể xóa chuẩn đầu ra");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (variant === "buttons") {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size={size} onClick={handleView}>
          <Eye className="h-4 w-4 mr-2" />
          Xem
        </Button>
        <Button variant="default" size={size} onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Sửa
        </Button>
        <Button
          variant="destructive"
          size={size}
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa
        </Button>

        <PODeleteDialog
          po={po}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={size}>
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
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Sao chép thông tin
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất file
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PODeleteDialog
        po={po}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
