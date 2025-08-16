"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AvatarData, AvatarFrame, AvatarRarity } from "@/lib/types/avatar";
import { getTierColor, getVietnameseTierName } from "@/lib/utils/tier-assets";
import { useAvatar } from "@/lib/hooks/use-avatar";

// Size variants for the avatar display
export type AvatarSize = "small" | "medium" | "large";

// Props interface for AvatarDisplay component
export interface AvatarDisplayProps {
  // Avatar data
  avatar?: AvatarData | null;
  frame?: AvatarFrame | null;
  userName?: string;
  userTier?: string;

  // Display options
  size?: AvatarSize;
  showName?: boolean;
  showRarity?: boolean;

  // Styling
  className?: string;

  // Interaction
  onClick?: () => void;
  disabled?: boolean;
}

// Size configuration mapping
const sizeConfig = {
  small: {
    container: "w-8 h-8",
    avatar: "w-8 h-8",
    frame: "w-8 h-8",
    name: "text-xs",
    rarity: "text-xs",
  },
  medium: {
    container: "w-16 h-16",
    avatar: "w-16 h-16",
    frame: "w-16 h-16",
    name: "text-sm",
    rarity: "text-xs",
  },
  large: {
    container: "w-32 h-32",
    avatar: "w-32 h-32",
    frame: "w-32 h-32",
    name: "text-lg",
    rarity: "text-sm",
  },
} as const;

// Rarity color mapping
const rarityColors = {
  COMMON: "text-gray-500",
  UNCOMMON: "text-green-500",
  RARE: "text-blue-500",
  EPIC: "text-purple-500",
  LEGENDARY: "text-yellow-500",
} as const;

// Enhanced tier effect classes with glow effects
const tierEffects = {
  // Basic tier colors with glow effects
  wood: "text-amber-700 drop-shadow-[0_0_6px_rgba(180,83,9,0.4)]",
  bronze: "text-orange-600 drop-shadow-[0_0_6px_rgba(234,88,12,0.4)]",
  silver: "text-gray-500 drop-shadow-[0_0_6px_rgba(107,114,128,0.4)]",
  gold: "text-yellow-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]",
  platinum: "text-slate-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]",
  onyx: "text-gray-800 drop-shadow-[0_0_6px_rgba(31,41,55,0.6)]",
  sapphire: "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]",
  ruby: "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  amethyst: "text-purple-500 drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]",
  master:
    "bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(147,51,234,0.8)]",

  // Legacy support for old tier names
  blue: "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]",
  red: "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  purple: "text-purple-500 drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]",
  rainbow:
    "bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]",
} as const;

// Skeleton loading component
const AvatarSkeleton: React.FC<{ size: AvatarSize }> = ({ size }) => {
  const config = sizeConfig[size];

  return (
    <div className={cn("relative", config.container)}>
      <div
        className={cn(
          "animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 rounded-full",
          config.avatar
        )}
      >
        <div className="w-full h-full rounded-full bg-gray-300 animate-pulse" />
      </div>
    </div>
  );
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  frame,
  userName,
  userTier,
  size = "medium",
  showName = true,
  showRarity = true,
  className,
  onClick,
  disabled = false,
}) => {
  const config = sizeConfig[size];
  const isPriority = size === "large";
  // Map Tailwind sizes to actual pixel values to avoid blurry upscaling
  const pixelSize = useMemo(() => {
    switch (size) {
      case "small":
        return 32; // w-8 => 2rem => 32px
      case "medium":
        return 64; // w-16 => 4rem => 64px
      case "large":
      default:
        return 128; // w-32 => 8rem => 128px
    }
  }, [size]);

  const frameScale = 1.12; // tăng nhẹ để bao trọn avatar
  const framePixelSize = Math.round(pixelSize * frameScale);

  // Loading states
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [frameLoading, setFrameLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [frameError, setFrameError] = useState(false);

  // Reset loading states when avatar or frame changes
  useEffect(() => {
    if (avatar?.image_path) {
      setAvatarLoading(true);
      setAvatarError(false);
    }
  }, [avatar?.image_path]);

  useEffect(() => {
    if (frame?.image_path) {
      setFrameLoading(true);
      setFrameError(false);
    }
  }, [frame?.image_path]);

  // Memoized tier effect calculation for performance
  const tierEffectClass = useMemo(() => {
    if (!userTier) return "";
    const lowerTier = userTier.toLowerCase();

    // First try to get from enhanced tier effects
    const tierEffect = tierEffects[lowerTier as keyof typeof tierEffects];
    if (tierEffect) return tierEffect;

    // Fallback to tier utility color with glow effect
    const tierColor = getTierColor(lowerTier);
    if (tierColor !== "text-slate-600") {
      return `${tierColor} drop-shadow-[0_0_6px_rgba(0,0,0,0.3)]`;
    }

    return "";
  }, [userTier]);

  // Memoized rarity color calculation
  const rarityColorClass = useMemo(() => {
    if (!avatar?.rarity) return "text-gray-500";
    return rarityColors[avatar.rarity] || "text-gray-500";
  }, [avatar?.rarity]);

  // Memoized Vietnamese rarity name
  const vietnameseRarityName = useMemo(() => {
    if (!avatar?.rarity) return "";
    const rarityMap = {
      COMMON: "Thường",
      UNCOMMON: "Không Thường",
      RARE: "Hiếm",
      EPIC: "Sử Thi",
      LEGENDARY: "Huyền Thoại",
    } as const;
    return rarityMap[avatar.rarity] || avatar.rarity.toLowerCase();
  }, [avatar?.rarity]);

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        onClick &&
        !disabled &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick, disabled]
  );

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1",
        "transition-all duration-300 ease-in-out",
        "motion-reduce:transition-none", // Respect user motion preferences
        onClick && !disabled && "group", // Enable group hover effects
        onClick &&
          !disabled && [
            "cursor-pointer",
            "hover:scale-105 hover:drop-shadow-lg",
            "active:scale-95",
            "motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
          ],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick && !disabled ? onClick : undefined}
      onKeyDown={onClick && !disabled ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-label={
        userName
          ? `Avatar của ${userName}${
              avatar?.rarity ? ` - ${vietnameseRarityName}` : ""
            }`
          : "Avatar người dùng"
      }
      aria-disabled={disabled}
    >
      {/* Avatar Container with Frame Overlay */}
      <div
        className={cn(
          "relative",
          config.container,
          "transition-all duration-300 ease-in-out",
          "motion-reduce:transition-none",
          onClick &&
            !disabled && [
              "group-hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]",
              "motion-reduce:group-hover:drop-shadow-none",
            ]
        )}
      >
        {/* Avatar Image */}
        <div className={cn("relative rounded-full", config.avatar)}>
          {avatar?.image_path && !avatarError ? (
            <>
              {/* Loading skeleton */}
              {avatarLoading && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 rounded-full" />
              )}

              {/* Avatar image - use fixed width/height to avoid blurry scaling */}
              <Image
                src={avatar.image_path}
                alt={avatar.avatar_name || "Avatar"}
                width={pixelSize}
                height={pixelSize}
                className={cn(
                  "rounded-full object-cover transition-opacity duration-300 [image-rendering:crisp-edges] [image-rendering:-webkit-optimize-contrast]",
                  avatarLoading ? "opacity-0" : "opacity-100"
                )}
                loading={isPriority ? undefined : "lazy"}
                priority={isPriority}
                onLoad={() => setAvatarLoading(false)}
                onError={() => {
                  setAvatarLoading(false);
                  setAvatarError(true);
                }}
              />
            </>
          ) : (
            // Placeholder when no avatar or error
            <div
              className={cn(
                "w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center",
                config.avatar
              )}
            >
              <span className="text-gray-500 text-lg">👤</span>
            </div>
          )}
        </div>

        {/* Frame Overlay - render after avatar so it appears on top */}
        {frame?.image_path && !frameError && (
          <div
            className={cn("absolute inset-0 pointer-events-none", config.frame)}
          >
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: `scale(${frameScale})` }}
            >
              <Image
                src={frame.image_path}
                alt={frame.frame_name || "Frame"}
                width={framePixelSize}
                height={framePixelSize}
                className={cn(
                  "rounded-full object-contain transition-opacity duration-300 [image-rendering:crisp-edges] [image-rendering:-webkit-optimize-contrast]",
                  frameLoading ? "opacity-0" : "opacity-100"
                )}
                loading={isPriority ? undefined : "lazy"}
                priority={isPriority}
                onLoad={() => setFrameLoading(false)}
                onError={() => {
                  setFrameLoading(false);
                  setFrameError(true);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Name Display */}
      {showName && userName && (
        <div
          className={cn(
            "font-medium text-center",
            "transition-all duration-300 ease-in-out",
            "motion-reduce:transition-none",
            config.name,
            tierEffectClass,
            onClick &&
              !disabled && [
                "group-hover:scale-110",
                "motion-reduce:group-hover:scale-100",
              ]
          )}
        >
          {userName}
        </div>
      )}

      {/* Rarity Indicator */}
      {showRarity && avatar?.rarity && (
        <div
          className={cn(
            "font-medium text-center",
            "transition-all duration-300 ease-in-out",
            "motion-reduce:transition-none",
            config.rarity,
            rarityColorClass,
            onClick &&
              !disabled && [
                "group-hover:scale-105 group-hover:brightness-110",
                "motion-reduce:group-hover:scale-100 motion-reduce:group-hover:brightness-100",
              ]
          )}
        >
          {vietnameseRarityName}
        </div>
      )}
    </div>
  );
};

// Connected Avatar Display Component that integrates with Avatar Service
export interface ConnectedAvatarDisplayProps {
  // Display options
  size?: AvatarSize;
  showName?: boolean;
  showRarity?: boolean;

  // User data (optional - will use current user if not provided)
  userId?: number;
  userName?: string;
  userTier?: string;

  // Styling
  className?: string;

  // Interaction
  onClick?: () => void;
  disabled?: boolean;

  // Loading states
  showLoadingState?: boolean;
}

export const ConnectedAvatarDisplay: React.FC<ConnectedAvatarDisplayProps> = ({
  size = "medium",
  showName = true,
  showRarity = true,
  userId,
  userName,
  userTier,
  className,
  onClick,
  disabled = false,
  showLoadingState = true,
}) => {
  const { equippedAvatar, equippedFrame, isLoading, error } = useAvatar();

  // Memoize the fallback display to prevent unnecessary re-renders
  const fallbackDisplay = useMemo(
    () => (
      <AvatarDisplay
        size={size}
        showName={showName}
        showRarity={false}
        userName={userName || "Người dùng"}
        userTier={userTier}
        className={className}
        onClick={onClick}
        disabled={disabled}
      />
    ),
    [size, showName, userName, userTier, className, onClick, disabled]
  );

  // Show loading state if requested and data is loading
  if (showLoadingState && isLoading) {
    return <AvatarSkeleton size={size} />;
  }

  // Show error state or fallback
  if (error && showLoadingState) {
    console.warn("Avatar service error:", error);
    return fallbackDisplay;
  }

  return (
    <AvatarDisplay
      avatar={equippedAvatar}
      frame={equippedFrame}
      userName={userName}
      userTier={userTier}
      size={size}
      showName={showName}
      showRarity={showRarity}
      className={className}
      onClick={onClick}
      disabled={disabled}
    />
  );
};

export default AvatarDisplay;
