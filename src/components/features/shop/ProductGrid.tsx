"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useShopInventory } from "@/lib/hooks/shop";
import type { TabType } from "./ShopPage";
import type { ShopItem } from "@/lib/services/api/shop.service";

interface ProductGridProps {
  activeTab: TabType;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  activeTab,
  className,
}) => {
  console.log("ProductGrid: Rendering with activeTab:", activeTab);

  // Use shop inventory hook
  const { avatars, frames, emojis, loading, error, refresh } = useShopInventory(
    {
      autoRefresh: false,
    }
  );

  console.log("ProductGrid: Hook state:", {
    avatars: avatars.length,
    frames: frames.length,
    emojis: emojis.length,
    loading,
    error,
  });

  // Get current tab items
  const getCurrentTabItems = (): ShopItem[] => {
    switch (activeTab) {
      case "avatars":
        return avatars;
      case "frames":
        return frames;
      case "emojis":
        return emojis;
      default:
        return [];
    }
  };

  const currentItems = getCurrentTabItems();

  /**
   * Handle purchase success callback
   */
  const handlePurchaseSuccess = (itemId: string) => {
    console.log("Purchase successful for item:", itemId);
    // Optionally refresh inventory or handle success
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <EmptyState
          title="Lỗi tải dữ liệu"
          description={error}
          action={{
            label: "Thử lại",
            onClick: refresh,
          }}
        />
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <EmptyState
          title="Chưa có vật phẩm"
          description={`Hiện tại chưa có ${
            activeTab === "avatars"
              ? "ảnh đại diện"
              : activeTab === "frames"
              ? "khung ảnh"
              : activeTab === "emojis"
              ? "biểu tượng cảm xúc"
              : "vật phẩm"
          } nào trong cửa hàng.`}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {currentItems.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            itemType={activeTab}
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
