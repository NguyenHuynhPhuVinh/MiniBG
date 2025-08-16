import React from "react";
import { cn } from "@/lib/utils";
import { getTierIconFromLevel, getVietnameseTierName } from "@/lib/utils/tier-assets";

export interface TierIconProps {
  level: number;
  size?: "sm" | "md" | "lg";
  tierName?: string;
  levelInTier?: number;
  className?: string;
}

/**
 * Custom hook for tier icon component with consistent sizing and error handling
 * @param level - Current level
 * @param size - Icon size variant
 * @param tierName - Tier name for alt text
 * @param levelInTier - Level within tier for alt text
 * @param className - Additional CSS classes
 * @returns JSX element for tier icon
 */
export const useTierIcon = ({
  level,
  size = "sm",
  tierName,
  levelInTier,
  className,
}: TierIconProps) => {
  const iconPath = getTierIconFromLevel(level);
  const vietnameseTierName = tierName ? getVietnameseTierName(tierName) : "";
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-20 h-20",
  };

  const TierIcon = React.useMemo(() => (
    <img
      src={iconPath}
      alt={tierName && levelInTier 
        ? `Hạng ${vietnameseTierName} cấp ${levelInTier}`
        : `Cấp ${level}`
      }
      className={cn(sizeClasses[size], "object-contain", className)}
      onError={(e) => {
        // Fallback to default tier icon if image fails to load
        const target = e.target as HTMLImageElement;
        target.src = "/vector-ranks-pack/wood/diamond-wood-1.png";
      }}
    />
  ), [iconPath, vietnameseTierName, levelInTier, level, size, className]);

  return TierIcon;
};

/**
 * Simplified tier icon component for direct usage
 */
export const TierIcon: React.FC<TierIconProps> = (props) => {
  return useTierIcon(props);
};
