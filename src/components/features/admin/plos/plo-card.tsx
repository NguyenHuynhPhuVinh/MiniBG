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
  CheckSquare,
  BookOpen,
  Target,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
} from "lucide-react";

import type { PLOWithRelations } from "@/lib/types/program-management";

interface PLOCardProps {
  plo: PLOWithRelations;
  onEdit?: (plo: PLOWithRelations) => void;
  onDelete?: (plo: PLOWithRelations) => void;
  className?: string;
}

export function PLOCard({ plo, onEdit, onDelete, className }: PLOCardProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/dashboard/admin/plos/${plo.plo_id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(plo);
    } else {
      router.push(`/dashboard/admin/plos/${plo.plo_id}/edit`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(plo);
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {plo.name || `PLO ${plo.plo_id}`}
            </CardTitle>
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
        {plo.description && (
          <CardDescription className="line-clamp-3">
            {plo.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Program Info */}
        {plo.Program && (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {plo.Program.name}
            </Badge>
          </div>
        )}

        {/* Associated PO */}
        {plo.PO && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              PO liên quan:
            </div>
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              {plo.PO.name}
            </Badge>
          </div>
        )}

        {/* Statistics */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>LOs:</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {plo._count?.LOs || 0}
          </Badge>
        </div>

        {/* Code if available */}
        {plo.code && (
          <div className="text-xs text-muted-foreground">Mã: {plo.code}</div>
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
