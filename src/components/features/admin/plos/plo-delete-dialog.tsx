"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/overlay";
import { Button } from "@/components/ui/forms";
import {
  Loader2,
  AlertTriangle,
  CheckSquare,
  Target,
  BookOpen,
} from "lucide-react";

import type { PLOWithRelations } from "@/lib/types/program-management";

interface PLODeleteDialogProps {
  plo: PLOWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function PLODeleteDialog({
  plo,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: PLODeleteDialogProps) {
  const hasLOs = plo._count?.LOs && plo._count.LOs > 0;
  const hasPO = plo.PO;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Xác nhận xóa chuẩn đầu ra học phần
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Bạn có chắc chắn muốn xóa chuẩn đầu ra học phần này không? Hành
                động này không thể hoàn tác.
              </p>

              {/* PLO Info */}
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {plo.name || `PLO ${plo.plo_id}`}
                  </span>
                </div>
                {plo.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plo.description}
                  </p>
                )}
                {plo.Program && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Chương trình:</span>{" "}
                      {plo.Program.name}
                    </span>
                  </div>
                )}
                {hasPO && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">PO liên quan:</span>{" "}
                      {plo.PO?.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning about related data */}
              {(hasLOs || hasPO) && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">
                        Cảnh báo: Có dữ liệu liên quan
                      </p>
                      <div className="text-sm text-destructive/80 space-y-1">
                        {hasLOs && (
                          <p>• Có {plo._count?.LOs} LO(s) liên quan</p>
                        )}
                        {hasPO && <p>• Có PO liên quan: {plo.PO?.name}</p>}
                        <p>Việc xóa sẽ ảnh hưởng đến các dữ liệu này.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa chuẩn đầu ra học phần"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
