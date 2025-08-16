"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Search, Filter, Check, Lock, Star } from "lucide-react";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/feedback";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { AvatarData, AvatarRarity } from "@/lib/types/avatar";
import { useAvatar } from "@/lib/hooks/use-avatar";

// Item state types for visual indicators
export type ItemState = "owned" | "locked";

// Props interface for AvatarGrid component
export interface AvatarGridProps {
  // Data
  ownedAvatars: AvatarData[];
  lockedAvatars: AvatarData[];

  // Current equipped avatar
  equippedAvatarId?: number;

  // Actions
  onEquipAvatar: (avatarId: number) => Promise<void>;

  // Loading states
  isLoading?: boolean;
  isEquipping?: boolean;

  // Styling
  className?: string;
}

// Individual avatar item component
interface AvatarItemProps {
  avatar: AvatarData;
  state: ItemState;
  isEquipped: boolean;
  isEquipping: boolean;
  onEquip: (avatarId: number) => Promise<void>;
}

const AvatarItem: React.FC<AvatarItemProps> = ({
  avatar,
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
  const rarityColor = getRarityColor(avatar.rarity);
  const rarityDisplayName = getRarityDisplayName(avatar.rarity);

  // Get unlock requirement text
  const getUnlockText = () => {
    if (state === "locked") {
      return avatar.unlock_description || "Chưa mở khóa";
    }
    return null;
  };

  // Handle equip action
  const handleEquip = useCallback(async () => {
    if (state === "owned" && !isEquipped && !isEquipping) {
      await onEquip(avatar.avatar_id);
    }
  }, [state, isEquipped, isEquipping, onEquip, avatar.avatar_id]);

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

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]",
        getBorderStyle(),
        state === "locked" && "opacity-60",
        state === "owned" &&
          !isEquipped &&
          "cursor-pointer hover:shadow-green-500/20",
        isEquipped && "shadow-primary/20",
        "motion-reduce:hover:scale-100 motion-reduce:transition-none"
      )}
      onClick={handleEquip}
    >
      <CardContent className="p-3">
        {/* Avatar Preview */}
        <div className="relative aspect-square mb-3 bg-muted/30 rounded-lg overflow-hidden">
          {!imageError ? (
            <>
              {imageLoading && (
                <Skeleton className="absolute inset-0 rounded-lg" />
              )}
              <Image
                src={avatar.image_path}
                alt={avatar.avatar_name}
                fill
                className={cn(
                  "object-cover transition-opacity duration-300",
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
        </div>

        {/* Avatar Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm truncate">{avatar.avatar_name}</h4>

          {avatar.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {avatar.description}
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

/**
 * AvatarGrid Component
 *
 * Displays a grid of avatars with:
 * - Visual state indicators (owned/unlockable/locked)
 * - Search and filter functionality
 * - Lazy loading for performance
 * - Responsive grid layout
 */
export const AvatarGrid: React.FC<AvatarGridProps> = ({
  ownedAvatars,
  lockedAvatars,
  equippedAvatarId,
  onEquipAvatar,
  isLoading = false,
  isEquipping = false,
  className,
}) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<AvatarRarity | "all">("all");
  const [ownedOnly, setOwnedOnly] = useState(false);

  // Combine all avatars with their states
  const allAvatars = useMemo(() => {
    const avatarsWithState = [
      ...ownedAvatars.map((avatar) => ({
        avatar,
        state: "owned" as ItemState,
      })),
      ...lockedAvatars.map((avatar) => ({
        avatar,
        state: "locked" as ItemState,
      })),
    ];

    return avatarsWithState;
  }, [ownedAvatars, lockedAvatars]);

  // Filter avatars based on search and filters
  const filteredAvatars = useMemo(() => {
    let filtered = allAvatars;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        ({ avatar }) =>
          avatar.avatar_name.toLowerCase().includes(searchLower) ||
          (avatar.description &&
            avatar.description.toLowerCase().includes(searchLower))
      );
    }

    // Owned only
    if (ownedOnly) {
      filtered = filtered.filter(({ state }) => state === "owned");
    }

    // Rarity filter
    if (rarityFilter !== "all") {
      filtered = filtered.filter(
        ({ avatar }) => avatar.rarity === rarityFilter
      );
    }

    // Sort by rarity, then name
    filtered.sort((a, b) => {
      // First by rarity
      const rarityOrder = ["LEGENDARY", "EPIC", "RARE", "UNCOMMON", "COMMON"];
      const aRarityIndex = rarityOrder.indexOf(a.avatar.rarity);
      const bRarityIndex = rarityOrder.indexOf(b.avatar.rarity);

      if (aRarityIndex !== bRarityIndex) {
        return aRarityIndex - bRarityIndex;
      }

      // Then by name
      return a.avatar.avatar_name.localeCompare(b.avatar.avatar_name);
    });

    return filtered;
  }, [allAvatars, searchQuery, rarityFilter, ownedOnly]);

  // Pagination
  const { currentPage, totalPages, paginateItems, goToPage } = usePagination(
    filteredAvatars.length,
    12
  );

  const paginatedAvatars = paginateItems(filteredAvatars);

  // Get available rarities for filter (sorted from low to high)
  const availableRarities = useMemo(() => {
    const rarities = new Set(allAvatars.map(({ avatar }) => avatar.rarity));
    const rarityOrder: AvatarRarity[] = [
      "COMMON",
      "UNCOMMON",
      "RARE",
      "EPIC",
      "LEGENDARY",
    ];
    return rarityOrder.filter((rarity) => rarities.has(rarity));
  }, [allAvatars]);

  // Vietnamese rarity names mapping
  const rarityDisplayNames = {
    COMMON: "Thông thường",
    UNCOMMON: "Không phổ biến",
    RARE: "Hiếm",
    EPIC: "Sử thi",
    LEGENDARY: "Huyền thoại",
  } as const;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
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
            placeholder="Tìm kiếm avatars..."
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
              onChange={(e) => setOwnedOnly(e.target.checked)}
            />
            Chỉ đã sở hữu
          </label>
        </div>
      </div>

      {/* Results */}
      {filteredAvatars.length === 0 ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Không tìm thấy avatars</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedAvatars.map(({ avatar, state }) => (
              <AvatarItem
                key={avatar.avatar_id}
                avatar={avatar}
                state={state}
                isEquipped={avatar.avatar_id === equippedAvatarId}
                isEquipping={isEquipping}
                onEquip={onEquipAvatar}
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

export default AvatarGrid;
