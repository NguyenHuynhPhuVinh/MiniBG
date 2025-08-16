"use client";

import React from "react";
import { LogoTransparent } from "@/components/ui/display";
import { cn } from "@/lib/utils";

interface AuthLoadingProps {
  className?: string;
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex h-screen w-full items-center justify-center bg-background",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center p-8 rounded-lg">
        <div className="relative mb-8">
          {/* Vòng tròn xoay */}
          <div className="h-24 w-24 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>

          {/* Logo ở giữa */}
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoTransparent
              size="xl"
              showText={false}
              imageClassName="h-16 w-16"
            />
          </div>
        </div>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-center mb-3 text-foreground">
          Synlearnia
        </h2>
        <p className="text-muted-foreground text-center">
          Nền tảng học tập thông minh
        </p>
      </div>
    </div>
  );
};
