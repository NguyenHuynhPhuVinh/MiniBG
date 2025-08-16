"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
import {
  Target,
  BookOpen,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
} from "lucide-react";

import type { POWithRelations } from "@/lib/types/program-management";

interface POCardProps {
  po: POWithRelations;
  onEdit?: (po: POWithRelations) => void;
  onDelete?: (po: POWithRelations) => void;
  className?: string;
}

export function POCard({ po, onEdit, onDelete, className }: POCardProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/dashboard/admin/pos/${po.po_id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(po);
    } else {
      router.push(`/dashboard/admin/pos/${po.po_id}/edit`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(po);
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{po.name}</CardTitle>
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
        {po.description && (
          <CardDescription className="line-clamp-2">
            {po.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Program Info */}
        {po.Program && (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {po.Program.name}
            </Badge>
          </div>
        )}

        {/* Statistics */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>PLOs:</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {po._count?.PLOs || 0}
          </Badge>
        </div>

        {/* Code if available */}
        {po.code && (
          <div className="text-xs text-muted-foreground">Mã: {po.code}</div>
        )}

        {/* Action Buttons */}
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
            variant="default"
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
