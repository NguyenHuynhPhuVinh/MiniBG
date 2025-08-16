"use client";
import React from "react";
import Link from "next/link";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useLogout } from "@/lib/hooks/use-auth";
import { User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/lib/hooks/use-sidebar";
import { getCurrentRole } from "@/lib/auth/role-manager";
import { useGamification } from "@/lib/hooks/use-gamification";
import { Badge } from "@/components/ui/feedback";
import {
  getTierIconFromLevel,
  getTierInfo,
  getVietnameseTierName,
} from "@/lib/utils/tier-assets";
import { TierIcon } from "@/lib/hooks/use-tier-icon";

export const UserButton: React.FC = () => {
  const { getUser } = useAuthStatus();
  const { isMobile } = useSidebarContext();
  const user = getUser();
  // Hiển thị tên thật của người dùng thay vì "Người dùng" mặc định
  const displayName = user?.fullName || user?.name || "Người dùng";
  const { logout } = useLogout();

  // Gamification data
  const { userGamification, userLevelProgress, levelColor, formattedPoints } =
    useGamification();

  // Hàm chuyển đổi vai trò từ tiếng Anh sang tiếng Việt
  const translateRole = (role?: string | null): string => {
    if (!role) return "Người dùng";

    switch (role.toLowerCase()) {
      case "admin":
        return "Quản trị viên";
      case "teacher":
        return "Giảng viên";
      case "student":
        return "Sinh viên";
      default:
        return "Người dùng";
    }
  };

  // Lấy vai trò của người dùng từ role-manager
  const currentRole = getCurrentRole();
  const translatedRole = translateRole(currentRole);

  // Get tier information for current level
  const currentLevel = userGamification?.current_level || 1;
  const currentTierInfo = getTierInfo(currentLevel);
  const tierIconPath = getTierIconFromLevel(currentLevel);

  // Get tier name from userLevelProgress or fallback to calculated tier
  const tierName =
    userLevelProgress?.tier_info?.tier_name || currentTierInfo.tierName;
  const levelInTier =
    userLevelProgress?.tier_info?.level_in_tier || currentTierInfo.levelInTier;

  // Vietnamese tier name (now using centralized utility)
  const vietnameseTierName = getVietnameseTierName(tierName);

  // Memoized tier icon component for top-nav
  const getTierIcon = React.useCallback(
    (level: number, size: "sm" | "md" = "sm") => {
      // Custom size mapping for top-nav
      const topNavSizeMap = {
        sm: "sm" as const,
        md: "md" as const,
      };

      return (
        <TierIcon
          level={level}
          size={topNavSizeMap[size]}
          tierName={tierName}
          levelInTier={levelInTier}
          className={size === "sm" ? "w-5 h-5" : "w-6 h-6"}
        />
      );
    },
    [tierName, levelInTier]
  );

  return (
    <div className="flex items-center gap-3">
      {/* Level Badge - chỉ hiển thị cho student */}
      {currentRole === "student" && userGamification && !isMobile && (
        <Badge
          variant="secondary"
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md min-w-fit"
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {getTierIcon(currentLevel, "sm")}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none whitespace-nowrap">
              Cấp {currentLevel}
            </span>
            <span className="text-[10px] text-slate-400 leading-none">•</span>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-none whitespace-nowrap [font-variant-numeric:tabular-nums]">
              {formattedPoints}
            </span>
          </div>
        </Badge>
      )}

      {/* User Button */}
      <Link
        href="#"
        onClick={logout}
        className={cn(
          "flex items-center gap-2 rounded-md font-semibold text-sm text-primary whitespace-nowrap",
          "hover:bg-accent focus:bg-accent transition-colors border border-transparent hover:border-primary focus:border-primary group",
          isMobile ? "px-2 py-1.5 min-w-0" : "px-4 py-2 min-w-fit"
        )}
      >
        {/* Avatar user */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-primary/10 text-primary",
            isMobile ? "h-7 w-7" : "h-8 w-8"
          )}
        >
          <User className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </div>

        {/* Thông tin user - nhỏ gọn trên mobile */}
        <div className="flex flex-col items-start flex-grow min-w-0">
          <span
            className={cn(
              "font-medium leading-tight truncate max-w-full",
              isMobile ? "text-xs" : "text-sm"
            )}
          >
            {displayName}
          </span>
          <div className="flex items-start flex-col gap-0.5 min-w-0 max-w-full">
            <span
              className={cn(
                "text-muted-foreground whitespace-nowrap",
                isMobile ? "text-[10px]" : "text-xs"
              )}
            >
              {translatedRole}
            </span>
            {/* Level info cho mobile student */}
            {currentRole === "student" && userGamification && isMobile && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-slate-400">•</span>
                <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                  <img
                    src={getTierIconFromLevel(currentLevel)}
                    alt={`Hạng ${vietnameseTierName}`}
                    className="w-3 h-3 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/vector-ranks-pack/wood/diamond-wood-1.png";
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  Cấp {currentLevel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Icon đăng xuất */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full text-destructive",
            isMobile ? "h-7 w-7" : "h-8 w-8"
          )}
        >
          <LogOut className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </div>
      </Link>
    </div>
  );
};
