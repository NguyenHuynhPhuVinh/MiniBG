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
import { Loader2, AlertTriangle, Target } from "lucide-react";

import type { POWithRelations } from "@/lib/types/program-management";

interface PODeleteDialogProps {
  po: POWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function PODeleteDialog({
  po,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: PODeleteDialogProps) {
  const hasPLOs = po._count?.PLOs && po._count.PLOs > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Xác nhận xóa chuẩn đầu ra
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Bạn có chắc chắn muốn xóa chuẩn đầu ra này không? Hành động này không thể hoàn tác.
              </p>
              
              {/* PO Info */}
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">{po.name}</span>
                </div>
                {po.description && (
                  <p className="text-sm text-muted-foreground">
                    {po.description}
                  </p>
                )}
                {po.Program && (
                  <p className="text-sm">
                    <span className="font-medium">Chương trình:</span> {po.Program.name}
                  </p>
                )}
              </div>

              {/* Warning about related data */}
              {hasPLOs && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">
                        Cảnh báo: Có dữ liệu liên quan
                      </p>
                      <p className="text-sm text-destructive/80">
                        Chuẩn đầu ra này có {po._count?.PLOs} PLO(s) liên quan. 
                        Việc xóa sẽ ảnh hưởng đến các dữ liệu này.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Hủy
          </AlertDialogCancel>
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
              "Xóa chuẩn đầu ra"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
