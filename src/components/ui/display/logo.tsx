/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  textClassName?: string;
  imageClassName?: string;
  variant?: "default" | "compact" | "full";
}

const sizeConfig = {
  sm: {
    container: "h-6 w-6 p-0.5",
    image: { width: 20, height: 20 },
    text: "text-sm",
  },
  md: {
    container: "h-8 w-8 p-1",
    image: { width: 24, height: 24 },
    text: "text-lg",
  },
  lg: {
    container: "h-12 w-12 p-1.5",
    image: { width: 36, height: 36 },
    text: "text-2xl",
  },
  xl: {
    container: "h-16 w-16 p-2",
    image: { width: 48, height: 48 },
    text: "text-3xl",
  },
};

export function Logo({
  size = "md",
  showText = true,
  className,
  textClassName,
  imageClassName,
  variant = "default",
}: LogoProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "logo-container rounded-lg",
          // Cải thiện background để phù hợp với theme
          "bg-white dark:bg-white/95 shadow-sm border border-border/20",
          // Thêm padding để logo không bị sát viền
          config.container,
          imageClassName
        )}
      >
        <Image
          src="/logo.png"
          alt="Synlearnia Logo"
          width={config.image.width}
          height={config.image.height}
          className={cn(
            "logo-image logo-loading",
            // Đảm bảo logo hiển thị đầy đủ
            "w-full h-full"
          )}
          priority
          // Thêm error handling
          onError={(e) => {
            console.error("Logo failed to load:", e);
          }}
        />
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold text-foreground transition-colors duration-200",
            config.text,
            textClassName
          )}
        >
          Synlearnia
        </span>
      )}
    </div>
  );
}

// Variant cho logo chỉ có hình ảnh, không có container
export function LogoIcon({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const config = sizeConfig[size];

  return (
    <Image
      src="/logo.png"
      alt="Synlearnia Logo"
      width={config.image.width}
      height={config.image.height}
      className={cn("object-contain transition-all duration-200", className)}
      priority
      onError={(e) => {
        console.error("Logo failed to load:", e);
      }}
    />
  );
}

// Variant cho logo với background trong suốt
export function LogoTransparent({
  size = "md",
  showText = true,
  className,
  textClassName,
  imageClassName,
}: Omit<LogoProps, "variant">) {
  const config = sizeConfig[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center",
          config.container.replace("p-", ""), // Loại bỏ padding mặc định
          imageClassName
        )}
      >
        <Image
          src="/logo.png"
          alt="Synlearnia Logo"
          width={config.image.width}
          height={config.image.height}
          className="object-contain transition-all duration-200 w-full h-full"
          priority
          onError={(e) => {
            console.error("Logo failed to load:", e);
          }}
        />
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold text-foreground transition-colors duration-200",
            config.text,
            textClassName
          )}
        >
          Synlearnia
        </span>
      )}
    </div>
  );
}

export default Logo;
