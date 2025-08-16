"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";

import { programService } from "@/lib/services/api";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import type { Program, ProgramWithRelations } from "@/lib/types/program-management";

interface ProgramDeleteDialogProps {
  program: Program | ProgramWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProgramDeleteDialog({
  program,
  open,
  onOpenChange,
  onSuccess,
}: ProgramDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setConfirmationText("");
      setIsDeleting(false);
    }
  }, [open]);

  if (!program) return null;

  const isConfirmed = confirmationText === program.name;
  const hasRelatedData = 'POs' in program || '_count' in program;
  const relatedCounts = '_count' in program ? program._count : undefined;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    try {
      setIsDeleting(true);
      await programService.deleteProgramById(program.program_id);
      
      showSuccessToast("Đã xóa chương trình thành công");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showErrorToast("Không thể xóa chương trình");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa chương trình
          </DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Chương trình và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Program Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{program.name}</span>
              <Badge variant="outline">ID: {program.program_id}</Badge>
            </div>
            
            {program.code && (
              <div className="text-sm text-muted-foreground">
                Mã: {program.code}
              </div>
            )}
            
            {program.description && (
              <div className="text-sm text-muted-foreground">
                {program.description}
              </div>
            )}
          </div>

          {/* Warning about related data */}
          {hasRelatedData && relatedCounts && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Cảnh báo: Dữ liệu liên quan sẽ bị xóa
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {relatedCounts.POs > 0 && (
                      <div>• {relatedCounts.POs} Program Outcomes (POs)</div>
                    )}
                    {relatedCounts.PLOs > 0 && (
                      <div>• {relatedCounts.PLOs} Program Learning Outcomes (PLOs)</div>
                    )}
                    {relatedCounts.Courses > 0 && (
                      <div>• {relatedCounts.Courses} Môn học</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Để xác nhận, hãy nhập tên chương trình: <span className="font-mono bg-muted px-1 rounded">{program.name}</span>
            </label>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Nhập tên chương trình để xác nhận"
              className={`${
                confirmationText && !isConfirmed 
                  ? "border-destructive focus:border-destructive" 
                  : ""
              }`}
            />
            {confirmationText && !isConfirmed && (
              <p className="text-sm text-destructive">
                Tên chương trình không khớp
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="min-w-[100px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa chương trình
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
