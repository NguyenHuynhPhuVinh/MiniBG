"use client";

import React, { useState, useEffect } from "react";
import { Eye, X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { AvatarData, AvatarFrame, NameEffect } from "@/lib/types/avatar";
import { AvatarDisplay } from "./avatar-display";

// Props interface for CustomizationPreview component
export interface CustomizationPreviewProps {
  // Preview data
  previewAvatar?: AvatarData | null;
  previewFrame?: AvatarFrame | null;
  previewNameEffect?: NameEffect | null;
  
  // Current equipped items for comparison
  currentAvatar?: AvatarData | null;
  currentFrame?: AvatarFrame | null;
  currentNameEffect?: NameEffect | null;
  
  // User info
  userName?: string;
  userTier?: string;
  
  // Actions
  onApplyChanges?: () => Promise<void>;
  onResetPreview?: () => void;
  
  // States
  isApplying?: boolean;
  hasChanges?: boolean;
  
  // Display options
  showModal?: boolean;
  modalSize?: "small" | "medium" | "large";
  
  // Styling
  className?: string;
}

// Individual preview item component
interface PreviewItemProps {
  title: string;
  current?: { name: string; description?: string } | null;
  preview?: { name: string; description?: string } | null;
  hasChange: boolean;
}

const PreviewItem: React.FC<PreviewItemProps> = ({
  title,
  current,
  preview,
  hasChange,
}) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      
      <div className="space-y-1">
        {/* Current Item */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Hiện tại
          </Badge>
          <span className="text-sm">
            {current?.name || "Không có"}
          </span>
        </div>
        
        {/* Preview Item */}
        {hasChange && (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              Xem trước
            </Badge>
            <span className="text-sm font-medium">
              {preview?.name || "Không có"}
            </span>
          </div>
        )}
      </div>
      
      {/* Description */}
      {hasChange && preview?.description && (
        <p className="text-xs text-muted-foreground italic">
          {preview.description}
        </p>
      )}
    </div>
  );
};

// Main CustomizationPreview component
export const CustomizationPreview: React.FC<CustomizationPreviewProps> = ({
  previewAvatar,
  previewFrame,
  previewNameEffect,
  currentAvatar,
  currentFrame,
  currentNameEffect,
  userName = "Người chơi",
  userTier,
  onApplyChanges,
  onResetPreview,
  isApplying = false,
  hasChanges = false,
  showModal = false,
  modalSize = "medium",
  className,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check for individual changes
  const avatarChanged = previewAvatar?.avatar_id !== currentAvatar?.avatar_id;
  const frameChanged = previewFrame?.frame_id !== currentFrame?.frame_id;
  const nameEffectChanged = previewNameEffect?.effect_id !== currentNameEffect?.effect_id;

  // Handle apply changes
  const handleApplyChanges = async () => {
    if (onApplyChanges && hasChanges) {
      await onApplyChanges();
      setIsModalOpen(false);
    }
  };

  // Handle reset preview
  const handleResetPreview = () => {
    if (onResetPreview) {
      onResetPreview();
    }
  };

  // Preview content
  const previewContent = (
    <div className="space-y-6">
      {/* Avatar Display */}
      <div className="flex justify-center">
        <AvatarDisplay
          avatar={previewAvatar || currentAvatar}
          frame={previewFrame || currentFrame}
          userName={userName}
          userTier={userTier}
          size="large"
          showName={true}
          showRarity={true}
          className="transition-all duration-300"
        />
      </div>

      {/* Name Effect Preview */}
      {(previewNameEffect || currentNameEffect) && (
        <div className="text-center">
          <div className="mb-2">
            <span className="text-sm text-muted-foreground">Hiệu ứng tên:</span>
          </div>
          <div 
            className={cn(
              "text-xl font-bold transition-all duration-300",
              (previewNameEffect || currentNameEffect)?.css_class
            )}
            dangerouslySetInnerHTML={{ 
              __html: (previewNameEffect || currentNameEffect)?.preview_html?.replace(
                "Tên Người Chơi", 
                userName
              ) || `<span class="${(previewNameEffect || currentNameEffect)?.css_class}">${userName}</span>`
            }}
          />
        </div>
      )}

      {/* Changes Summary */}
      {hasChanges && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-medium">Thay đổi sẽ áp dụng:</h3>
          
          <div className="space-y-3">
            {avatarChanged && (
              <PreviewItem
                title="Avatar"
                current={currentAvatar ? { name: currentAvatar.avatar_name, description: currentAvatar.description } : null}
                preview={previewAvatar ? { name: previewAvatar.avatar_name, description: previewAvatar.description } : null}
                hasChange={avatarChanged}
              />
            )}
            
            {frameChanged && (
              <PreviewItem
                title="Frame"
                current={currentFrame ? { name: currentFrame.frame_name, description: currentFrame.description } : null}
                preview={previewFrame ? { name: previewFrame.frame_name, description: previewFrame.description } : null}
                hasChange={frameChanged}
              />
            )}
            
            {nameEffectChanged && (
              <PreviewItem
                title="Name Effect"
                current={currentNameEffect ? { name: currentNameEffect.effect_name, description: currentNameEffect.description } : null}
                preview={previewNameEffect ? { name: previewNameEffect.effect_name, description: previewNameEffect.description } : null}
                hasChange={nameEffectChanged}
              />
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {hasChanges && (
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPreview}
            disabled={isApplying}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Đặt lại
          </Button>
          
          <Button
            size="sm"
            onClick={handleApplyChanges}
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang áp dụng...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Áp dụng thay đổi
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  // If modal is requested, wrap in dialog
  if (showModal) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Xem trước
          </Button>
        </DialogTrigger>
        <DialogContent 
          className={cn(
            "max-w-md",
            modalSize === "small" && "max-w-sm",
            modalSize === "large" && "max-w-2xl"
          )}
        >
          <DialogHeader>
            <DialogTitle>Xem trước tùy chỉnh</DialogTitle>
            <DialogDescription>
              Xem trước các thay đổi trước khi áp dụng
            </DialogDescription>
          </DialogHeader>
          
          {previewContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Regular inline preview
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Xem trước tùy chỉnh
        </CardTitle>
      </CardHeader>
      <CardContent>
        {previewContent}
      </CardContent>
    </Card>
  );
};

export default CustomizationPreview;
