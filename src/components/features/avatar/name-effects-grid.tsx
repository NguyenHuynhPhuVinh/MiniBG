"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Search, Filter, Check, Lock, Star, Crown, Gem, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { NameEffect } from "@/lib/types/avatar";
import { useAvatar } from "@/lib/hooks/use-avatar";

// Item state types for visual indicators
export type ItemState = "owned" | "unlockable" | "locked";

// Tier types for name effects organization
export type TierType = "Wood" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Onyx" | "Ruby" | "Sapphire" | "Amethyst" | "Master";

// Props interface for NameEffectsGrid component
export interface NameEffectsGridProps {
  // Data
  ownedEffects: NameEffect[];
  unlockableEffects: NameEffect[];
  lockedEffects: NameEffect[];
  
  // Current equipped effect
  equippedEffectId?: number;
  
  // Actions
  onEquipEffect: (effectId: number) => Promise<void>;
  
  // Loading states
  isLoading?: boolean;
  isEquipping?: boolean;
  
  // Styling
  className?: string;
}

// Individual name effect item component
interface NameEffectItemProps {
  effect: NameEffect;
  state: ItemState;
  isEquipped: boolean;
  isEquipping: boolean;
  onEquip: (effectId: number) => Promise<void>;
}

const NameEffectItem: React.FC<NameEffectItemProps> = ({
  effect,
  state,
  isEquipped,
  isEquipping,
  onEquip,
}) => {
  // Handle equip action
  const handleEquip = useCallback(async () => {
    if (state === "owned" && !isEquipped && !isEquipping) {
      await onEquip(effect.effect_id);
    }
  }, [state, isEquipped, isEquipping, onEquip, effect.effect_id]);

  // Get border style based on state
  const getBorderStyle = () => {
    if (isEquipped) return "border-2 border-primary ring-2 ring-primary/20";
    
    switch (state) {
      case "owned":
        return "border-2 border-green-500/50 hover:border-green-500";
      case "unlockable":
        return "border-2 border-yellow-500/50 hover:border-yellow-500";
      case "locked":
        return "border-2 border-gray-500/30";
      default:
        return "border-2 border-border";
    }
  };

  // Get tier icon
  const getTierIcon = () => {
    const tierName = effect.tier_name?.toLowerCase();
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

  // Get unlock requirement text
  const getUnlockText = () => {
    if (state === "unlockable") {
      return effect.unlock_description || "Có thể mở khóa";
    }
    if (state === "locked") {
      return effect.unlock_description || "Chưa mở khóa";
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
        state === "owned" && !isEquipped && "cursor-pointer hover:shadow-green-500/20",
        isEquipped && "shadow-primary/20",
        "motion-reduce:hover:scale-100 motion-reduce:transition-none"
      )}
      onClick={handleEquip}
    >
      <CardContent className="p-4">
        {/* Name Effect Preview */}
        <div className="relative mb-4 p-4 bg-muted/30 rounded-lg overflow-hidden min-h-[80px] flex items-center justify-center">
          {/* Live Preview */}
          <div 
            className={cn("text-lg font-medium transition-all duration-300", effect.css_class)}
            dangerouslySetInnerHTML={{ __html: effect.preview_html || `<span class="${effect.css_class}">Tên Người Chơi</span>` }}
          />

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

          {/* Tier Icon */}
          <div className="absolute top-2 right-2">
            {getTierIcon()}
          </div>

          {/* Animation Badge */}
          {effect.is_animated && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-purple-400 to-pink-500 text-white border-none">
                <Sparkles className="w-3 h-3 mr-1" />
                Animated
              </Badge>
            </div>
          )}

          {/* Premium Badge */}
          {effect.is_premium && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                Premium
              </Badge>
            </div>
          )}
        </div>

        {/* Effect Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm truncate">{effect.effect_name}</h4>
          
          {effect.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {effect.description}
            </p>
          )}

          {/* Tier Display */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ borderColor: effect.tier_color, color: effect.tier_color }}
            >
              {effect.tier_display}
            </Badge>
            
            {/* Level Requirement */}
            {effect.unlock_level > 0 && (
              <Badge variant="outline" className="text-xs">
                Level {effect.unlock_level}+
              </Badge>
            )}
          </div>

          {/* CSS Class Info */}
          <div className="text-xs text-muted-foreground">
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              {effect.css_class}
            </code>
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

// Main NameEffectsGrid component
export const NameEffectsGrid: React.FC<NameEffectsGridProps> = ({
  ownedEffects,
  unlockableEffects,
  lockedEffects,
  equippedEffectId,
  onEquipEffect,
  isLoading = false,
  isEquipping = false,
  className,
}) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<TierType | "all">("all");
  const [animatedFilter, setAnimatedFilter] = useState<"all" | "animated" | "static">("all");

  // Combine all effects with their states
  const allEffects = useMemo(() => {
    const effectsWithState = [
      ...ownedEffects.map((effect) => ({
        effect,
        state: "owned" as ItemState,
      })),
      ...unlockableEffects.map((effect) => ({
        effect,
        state: "unlockable" as ItemState,
      })),
      ...lockedEffects.map((effect) => ({
        effect,
        state: "locked" as ItemState,
      })),
    ];

    return effectsWithState;
  }, [ownedEffects, unlockableEffects, lockedEffects]);

  // Filter effects based on search and filters
  const filteredEffects = useMemo(() => {
    let filtered = allEffects;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        ({ effect }) =>
          effect.effect_name.toLowerCase().includes(searchLower) ||
          (effect.description &&
            effect.description.toLowerCase().includes(searchLower)) ||
          effect.css_class.toLowerCase().includes(searchLower)
      );
    }

    // Tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter(
        ({ effect }) => effect.tier_name === tierFilter
      );
    }

    // Animation filter
    if (animatedFilter !== "all") {
      filtered = filtered.filter(
        ({ effect }) => 
          animatedFilter === "animated" ? effect.is_animated : !effect.is_animated
      );
    }

    // Sort by tier, then unlock level, then name
    filtered.sort((a, b) => {
      // First by tier (higher tier first)
      const tierOrder = ["Master", "Amethyst", "Sapphire", "Ruby", "Onyx", "Platinum", "Gold", "Silver", "Bronze", "Wood"];
      const aTierIndex = tierOrder.indexOf(a.effect.tier_name);
      const bTierIndex = tierOrder.indexOf(b.effect.tier_name);
      
      if (aTierIndex !== bTierIndex) {
        return aTierIndex - bTierIndex;
      }

      // Then by unlock level (higher level first)
      if (a.effect.unlock_level !== b.effect.unlock_level) {
        return b.effect.unlock_level - a.effect.unlock_level;
      }

      // Finally by name
      return a.effect.effect_name.localeCompare(b.effect.effect_name);
    });

    return filtered;
  }, [allEffects, searchQuery, tierFilter, animatedFilter]);

  // Get available tiers for filter
  const availableTiers = useMemo(() => {
    const tiers = new Set(allEffects.map(({ effect }) => effect.tier_name));
    return Array.from(tiers).sort();
  }, [allEffects]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
            placeholder="Tìm kiếm name effects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as TierType | "all")}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="all">Tất cả tier</option>
            {availableTiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>

          <select
            value={animatedFilter}
            onChange={(e) => setAnimatedFilter(e.target.value as "all" | "animated" | "static")}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="all">Tất cả loại</option>
            <option value="animated">Có animation</option>
            <option value="static">Tĩnh</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {filteredEffects.length === 0 ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Không tìm thấy name effects</p>
            <p className="text-sm">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEffects.map(({ effect, state }) => (
            <NameEffectItem
              key={effect.effect_id}
              effect={effect}
              state={state}
              isEquipped={effect.effect_id === equippedEffectId}
              isEquipping={isEquipping}
              onEquip={onEquipEffect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NameEffectsGrid;
