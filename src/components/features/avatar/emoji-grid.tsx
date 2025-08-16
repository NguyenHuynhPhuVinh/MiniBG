"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Check,
  Lock,
  Star,
  Crown,
  Gem,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/feedback";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { EmojiData, AvatarRarity } from "@/lib/types/avatar";
import { useAvatar } from "@/lib/hooks/use-avatar";

// Item state types for visual indicators
export type ItemState = "owned" | "locked";

// Category types for emoji organization
export type EmojiCategory =
  | "GENERAL"
  | "HAPPY"
  | "SAD"
  | "ANGRY"
  | "SURPRISED"
  | "LOVE"
  | "CELEBRATION"
  | "ANIMALS"
  | "SPECIAL";

// Props interface for EmojiGrid component
export interface EmojiGridProps {
  // Data
  ownedEmojis: EmojiData[];
  lockedEmojis: EmojiData[];

  // Current equipped emoji (if any)
  equippedEmojiId?: number;

  // Actions
  onEquipEmoji: (emojiId: number) => Promise<void>;

  // Loading states
  isLoading?: boolean;
  isEquipping?: boolean;

  // Styling
  className?: string;
}

// Individual emoji item component
interface EmojiItemProps {
  emoji: EmojiData;
  state: ItemState;
  isEquipped: boolean;
  isEquipping: boolean;
  onEquip: (emojiId: number) => Promise<void>;
}

const EmojiItem: React.FC<EmojiItemProps> = ({
  emoji,
  state,
  isEquipped,
  isEquipping,
  onEquip,
}) => {
  const { getRarityColor, getRarityDisplayName } = useAvatar();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const rarityColor = getRarityColor(emoji.rarity);
  const rarityDisplayName = getRarityDisplayName(emoji.rarity);

  const handleEquip = useCallback(async () => {
    if (state === "owned" && !isEquipped && !isEquipping) {
      await onEquip(emoji.emoji_id);
    }
  }, [state, isEquipped, isEquipping, onEquip, emoji.emoji_id]);

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

  const getUnlockText = () => {
    if (state === "locked") return emoji.unlock_description;
    return null;
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
        "motion-reduce:hover:scale-100 motion-reduce:transition-none",
        // Đảm bảo chiều cao đồng nhất và rộng hơn
        "min-h-[240px] flex flex-col"
      )}
      onClick={handleEquip}
    >
      <CardContent className="p-4 flex flex-col h-full">
        {/* Emoji Display - Fixed height để tránh chèn nhau */}
        <div className="relative mb-4 bg-muted/30 rounded-lg overflow-hidden h-24 flex items-center justify-center flex-shrink-0">
          {emoji.emoji_image ? (
            <div className="relative w-12 h-12">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              )}
              <img
                src={emoji.emoji_image}
                alt={emoji.emoji_name}
                className={cn(
                  "w-full h-full object-contain transition-opacity duration-300",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              {imageError && (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {emoji.emoji_display || emoji.emoji_unicode}
                </div>
              )}
            </div>
          ) : (
            <div className="text-3xl">
              {emoji.emoji_display || emoji.emoji_unicode}
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

        {/* Emoji Info */}
        <div className="space-y-2 flex-grow flex flex-col">
          <h4 className="font-medium text-sm truncate">{emoji.emoji_name}</h4>

          {emoji.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {emoji.description}
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

// Loading skeleton component
const EmojiSkeleton: React.FC = () => (
  <Card className="min-h-[240px] flex flex-col">
    <CardContent className="p-3 flex flex-col h-full">
      <Skeleton className="h-20 w-full mb-3 rounded-lg flex-shrink-0" />
      <div className="space-y-2 flex-grow flex flex-col">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full flex-grow" />
        <div className="mt-auto space-y-2">
          <div className="flex justify-between gap-2">
            <div />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main EmojiGrid component
export const EmojiGrid: React.FC<EmojiGridProps> = ({
  ownedEmojis,
  lockedEmojis,
  equippedEmojiId,
  onEquipEmoji,
  isLoading = false,
  isEquipping = false,
  className,
}) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<AvatarRarity | "all">("all");
  const [ownedOnly, setOwnedOnly] = useState(false);

  // Combine all emojis with their states
  const allEmojis = useMemo(() => {
    const emojisWithState = [
      ...ownedEmojis.map((emoji) => ({
        emoji,
        state: "owned" as ItemState,
      })),
      ...lockedEmojis.map((emoji) => ({ emoji, state: "locked" as ItemState })),
    ];

    return emojisWithState;
  }, [ownedEmojis, lockedEmojis]);

  // Filter emojis based on search and filters
  const filteredEmojis = useMemo(() => {
    let filtered = allEmojis;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        ({ emoji }) =>
          emoji.emoji_name.toLowerCase().includes(searchLower) ||
          (emoji.description &&
            emoji.description.toLowerCase().includes(searchLower)) ||
          emoji.category_display.toLowerCase().includes(searchLower)
      );
    }

    // Owned only filter
    if (ownedOnly) {
      filtered = filtered.filter(({ state }) => state === "owned");
    }

    // Rarity filter
    if (rarityFilter !== "all") {
      filtered = filtered.filter(({ emoji }) => emoji.rarity === rarityFilter);
    }

    // Sort by category, then rarity, then name
    filtered.sort((a, b) => {
      // First by category
      if (a.emoji.category !== b.emoji.category) {
        return a.emoji.category.localeCompare(b.emoji.category);
      }

      // Then by rarity
      const rarityOrder = ["LEGENDARY", "EPIC", "RARE", "UNCOMMON", "COMMON"];
      const aRarityIndex = rarityOrder.indexOf(a.emoji.rarity);
      const bRarityIndex = rarityOrder.indexOf(b.emoji.rarity);

      if (aRarityIndex !== bRarityIndex) {
        return aRarityIndex - bRarityIndex;
      }

      // Finally by name
      return a.emoji.emoji_name.localeCompare(b.emoji.emoji_name);
    });

    return filtered;
  }, [allEmojis, searchQuery, ownedOnly, rarityFilter]);

  // Pagination
  const { currentPage, totalPages, paginateItems, goToPage } = usePagination(
    filteredEmojis.length,
    12
  );

  const paginatedEmojis = paginateItems(filteredEmojis);

  // Get available rarities for filter (sorted from low to high)
  const availableRarities = useMemo(() => {
    const rarities = new Set(allEmojis.map(({ emoji }) => emoji.rarity));
    const rarityOrder: AvatarRarity[] = [
      "COMMON",
      "UNCOMMON",
      "RARE",
      "EPIC",
      "LEGENDARY",
    ];
    return rarityOrder.filter((rarity) => rarities.has(rarity));
  }, [allEmojis]);

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
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <EmojiSkeleton key={i} />
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
            placeholder="Tìm kiếm emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={rarityFilter}
            onChange={(e) =>
              setRarityFilter(e.target.value as AvatarRarity | "all")
            }
            className="px-3 py-2 border border-border rounded-md bg-background text-sm min-w-[120px]"
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
      {filteredEmojis.length === 0 ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Không tìm thấy emojis</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedEmojis.map(({ emoji, state }) => (
              <EmojiItem
                key={emoji.emoji_id}
                emoji={emoji}
                state={state}
                isEquipped={equippedEmojiId === emoji.emoji_id}
                isEquipping={isEquipping}
                onEquip={onEquipEmoji}
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
