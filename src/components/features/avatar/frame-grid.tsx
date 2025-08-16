"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Search, Filter, Check, Lock, Star, Crown, Gem } from "lucide-react";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/feedback";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { AvatarFrame, AvatarRarity } from "@/lib/types/avatar";
import { useAvatar } from "@/lib/hooks/use-avatar";

// Item state types for visual indicators
export type ItemState = "owned" | "locked";

// Tier types for frame organization
export type TierType =
  | "Wood"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Onyx"
  | "Ruby"
  | "Sapphire"
  | "Amethyst"
  | "Master";

// Props interface for FrameGrid component
export interface FrameGridProps {
  // Data
  ownedFrames: AvatarFrame[];
  lockedFrames: AvatarFrame[];

  // Current equipped frame
  equippedFrameId?: number;

  // Actions
  onEquipFrame: (frameId: number) => Promise<void>;

  // Loading states
  isLoading?: boolean;
  isEquipping?: boolean;

  // Styling
  className?: string;
}

// Individual frame item component
interface FrameItemProps {
  frame: AvatarFrame;
  state: ItemState;
  isEquipped: boolean;
  isEquipping: boolean;
  onEquip: (frameId: number) => Promise<void>;
}

const FrameItem: React.FC<FrameItemProps> = ({
  frame,
  state,
  isEquipped,
  isEquipping,
  onEquip,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Get utility functions from avatar hook
  const { getRarityColor, getRarityDisplayName } = useAvatar();

  // Get rarity color and display name
  const rarityColor = getRarityColor(frame.rarity);
  const rarityDisplayName = getRarityDisplayName(frame.rarity);

  // Get unlock requirement text
  const getUnlockText = () => {
    if (state === "locked") {
      return frame.unlock_description || "Chưa mở khóa";
    }
    return null;
  };

  // Handle equip/unequip action
  const handleEquip = useCallback(async () => {
    if (state === "owned" && !isEquipping) {
      // Cho phép cả equip và unequip frame
      await onEquip(frame.frame_id);
    }
  }, [state, isEquipping, onEquip, frame.frame_id]);

  // Get border style based on state
  const getBorderStyle = () => {
    if (isEquipped) return "border-2 border-primary ring-2 ring-primary/20";

    switch (state) {
      case "owned":
        return "border-2 border-border hover:border-primary";
      case "locked":
        return "border-2 border-gray-500/30 grayscale";
      default:
        return "border-2 border-border";
    }
  };

  // Get tier icon
  const getTierIcon = () => {
    const tierName = frame.tier_name?.toLowerCase();
    if (tierName?.includes("master") || tierName?.includes("amethyst")) {
      return <Crown className="w-3 h-3 text-purple-500" />;
    }
    if (tierName?.includes("ruby") || tierName?.includes("sapphire")) {
      return <Gem className="w-3 h-3 text-red-500" />;
    }
    if (tierName?.includes("gold") || tierName?.includes("platinum")) {
      return <Star className="w-3 h-3 text-yellow-500" />;
    }
    return null;
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]",
        getBorderStyle(),
        state === "locked" && "opacity-60",
        state === "owned" && "cursor-pointer hover:shadow-green-500/20",
        isEquipped && "shadow-primary/20",
        "motion-reduce:hover:scale-100 motion-reduce:transition-none"
      )}
      onClick={handleEquip}
    >
      <CardContent className="p-3">
        {/* Frame Preview */}
        <div className="relative aspect-square mb-3 bg-muted/30 rounded-lg overflow-hidden">
          {!imageError ? (
            <>
              {imageLoading && (
                <Skeleton className="absolute inset-0 rounded-lg" />
              )}
              <Image
                src={frame.image_path}
                alt={frame.frame_name}
                fill
                className={cn(
                  "object-contain transition-opacity duration-300",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <div className="w-8 h-8 mx-auto mb-1 bg-muted-foreground/20 rounded" />
                <p className="text-xs">Không tải được</p>
              </div>
            </div>
          )}

          {/* State Indicators */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isEquipped && (
              <Badge variant="default" className="text-xs px-1.5 py-0.5">
                <Check className="w-3 h-3 mr-1" />
                Đang dùng
              </Badge>
            )}

            {state === "locked" && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                <Lock className="w-3 h-3 mr-1" />
                Khóa
              </Badge>
            )}
          </div>

          {/* Hint for equipped frames */}
          {isEquipped && state === "owned" && (
            <div className="absolute bottom-2 right-2">
              <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                Bấm để bỏ
              </div>
            </div>
          )}

          {/* Tier Icon (ẩn nếu thiếu dữ liệu) */}
          {frame.tier_name && frame.tier_color ? (
            <div className="absolute top-2 right-2">{getTierIcon()}</div>
          ) : null}

          {/* Premium Badge */}
          {frame.is_premium && (
            <div className="absolute bottom-2 left-2">
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none"
              >
                Premium
              </Badge>
            </div>
          )}
        </div>

        {/* Frame Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm truncate">{frame.frame_name}</h4>

          {frame.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {frame.description}
            </p>
          )}

          {/* Rarity */}
          <div className="flex items-center justify-between">
            <div />

            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: rarityColor, color: rarityColor }}
            >
              {rarityDisplayName}
            </Badge>
          </div>

          {/* Kristal Cost - Ưu tiên shop_data, fallback về kristal_cost cũ */}
          {(frame.shop_data?.kristal_price || (frame as any).kristal_cost) >
            0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Giá:</span>
              <span className="font-medium text-blue-600">
                {frame.shop_data?.kristal_price || (frame as any).kristal_cost}{" "}
                Kristal
              </span>
            </div>
          )}

          {/* Unlock Requirements */}
          {getUnlockText() && (
            <p className="text-xs text-muted-foreground italic">
              {getUnlockText()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main FrameGrid component
export const FrameGrid: React.FC<FrameGridProps> = ({
  ownedFrames,
  lockedFrames,
  equippedFrameId,
  onEquipFrame,
  isLoading = false,
  isEquipping = false,
  className,
}) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<AvatarRarity | "all">("all");
  const [ownedOnly, setOwnedOnly] = useState(false);

  // Combine all frames with their states
  const allFrames = useMemo(() => {
    const framesWithState = [
      ...ownedFrames.map((frame) => ({
        frame,
        state: "owned" as ItemState,
      })),
      ...lockedFrames.map((frame) => ({ frame, state: "locked" as ItemState })),
    ];

    return framesWithState;
  }, [ownedFrames, lockedFrames]);

  // Filter frames based on search and filters
  const filteredFrames = useMemo(() => {
    let filtered = allFrames;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        ({ frame }) =>
          frame.frame_name.toLowerCase().includes(searchLower) ||
          (frame.description &&
            frame.description.toLowerCase().includes(searchLower))
      );
    }

    // Owned only
    if (ownedOnly) {
      filtered = filtered.filter(({ state }) => state === "owned");
    }

    // Rarity filter
    if (rarityFilter !== "all") {
      filtered = filtered.filter(({ frame }) => frame.rarity === rarityFilter);
    }

    // Sort by tier, then rarity, then name
    filtered.sort((a, b) => {
      // First by tier (higher tier first)
      const tierOrder = [
        "Master",
        "Amethyst",
        "Sapphire",
        "Ruby",
        "Onyx",
        "Platinum",
        "Gold",
        "Silver",
        "Bronze",
        "Wood",
      ];
      const aTierIndex = tierOrder.indexOf(a.frame.tier_name);
      const bTierIndex = tierOrder.indexOf(b.frame.tier_name);

      if (aTierIndex !== bTierIndex) {
        return aTierIndex - bTierIndex;
      }

      // Then by rarity
      const rarityOrder = ["LEGENDARY", "EPIC", "RARE", "UNCOMMON", "COMMON"];
      const aRarityIndex = rarityOrder.indexOf(a.frame.rarity);
      const bRarityIndex = rarityOrder.indexOf(b.frame.rarity);

      if (aRarityIndex !== bRarityIndex) {
        return aRarityIndex - bRarityIndex;
      }

      // Finally by name
      return a.frame.frame_name.localeCompare(b.frame.frame_name);
    });

    return filtered;
  }, [allFrames, searchQuery, rarityFilter, ownedOnly]);

  // Pagination
  const { currentPage, totalPages, paginateItems, goToPage } = usePagination(
    filteredFrames.length,
    12
  );

  const paginatedFrames = paginateItems(filteredFrames);

  // Get available rarities for filter (sorted from low to high)
  const availableRarities = useMemo(() => {
    const rarities = new Set(allFrames.map(({ frame }) => frame.rarity));
    const rarityOrder: AvatarRarity[] = [
      "COMMON",
      "UNCOMMON",
      "RARE",
      "EPIC",
      "LEGENDARY",
    ];
    return rarityOrder.filter((rarity) => rarities.has(rarity));
  }, [allFrames]);

  // Vietnamese rarity names mapping
  const rarityDisplayNames = {
    COMMON: "Thông thường",
    UNCOMMON: "Không phổ biến",
    RARE: "Hiếm",
    EPIC: "Sử thi",
    LEGENDARY: "Huyền thoại",
  } as const;

  // Get available tiers for filter (không sử dụng nữa)
  // const availableTiers = useMemo(() => {
  //   const tiers = new Set(allFrames.map(({ frame }) => frame.tier_name));
  //   return Array.from(tiers).sort();
  // }, [allFrames]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm frames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={rarityFilter}
            onChange={(e) =>
              setRarityFilter(e.target.value as AvatarRarity | "all")
            }
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="all">Tất cả độ hiếm</option>
            {availableRarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarityDisplayNames[rarity]}
              </option>
            ))}
          </select>

          {/* Owned-only toggle */}
          <label className="ml-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={ownedOnly}
              onChange={(e) => setOwnedOnly(e.target.checked)}
              className="rounded"
            />
            Chỉ đã sở hữu
          </label>
        </div>
      </div>

      {/* Results */}
      {filteredFrames.length === 0 ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Không tìm thấy frames</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedFrames.map(({ frame, state }) => (
              <FrameItem
                key={frame.frame_id}
                frame={frame}
                state={state}
                isEquipped={frame.frame_id === equippedFrameId}
                isEquipping={isEquipping}
                onEquip={onEquipFrame}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            className="mt-6"
          />
        </>
      )}
    </div>
  );
};

export default FrameGrid;
