"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/forms/button";
import { Badge } from "@/components/ui/feedback/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/layout/card";
import { Skeleton } from "@/components/ui/feedback";
import { ShoppingCart, Check, Star, Loader2, Lock, Coins } from "lucide-react";
import { PurchaseDialog } from "./PurchaseDialog";
import { usePurchaseMock } from "@/lib/hooks/shop";
import { useCurrency } from "@/lib/hooks/use-currency";
import type { ShopItem } from "@/lib/services/api/shop.service";

interface ProductCardProps {
  item: ShopItem | null;
  itemType: "avatars" | "frames" | "emojis";
  className?: string;
  onPurchaseSuccess?: (itemId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  itemType,
  className,
  onPurchaseSuccess,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Hooks
  const { purchase, loading: purchaseLoading, isOwned } = usePurchaseMock();
  const { balance } = useCurrency();

  // Early return if item is null/undefined
  if (!item) {
    return null;
  }

  // Check if item is owned
  const owned = isOwned(item.id);
  const currentBalance = balance?.SYNC?.balance || 0;

  /**
   * Handle purchase button click - open dialog
   */
  const handlePurchaseClick = () => {
    if (owned) return;
    setDialogOpen(true);
  };

  /**
   * Handle actual purchase from dialog
   */
  const handlePurchase = async (
    itemType: "avatars" | "frames" | "emojis",
    itemId: string
  ) => {
    try {
      const result = await purchase(itemType, itemId);
      if (result.success) {
        onPurchaseSuccess?.(itemId);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      throw error;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case "common":
        return {
          color: "bg-gray-500",
          borderColor: "border-gray-200 dark:border-gray-700",
          label: "Thông thường",
          hexColor: "#6b7280",
        };
      case "rare":
        return {
          color: "bg-blue-500",
          borderColor: "border-blue-200 dark:border-blue-700",
          label: "Hiếm",
          hexColor: "#3b82f6",
        };
      case "epic":
        return {
          color: "bg-purple-500",
          borderColor: "border-purple-200 dark:border-purple-700",
          label: "Sử thi",
          hexColor: "#8b5cf6",
        };
      case "legendary":
        return {
          color: "bg-yellow-500",
          borderColor: "border-yellow-200 dark:border-yellow-700",
          label: "Huyền thoại",
          hexColor: "#eab308",
        };
      default:
        return {
          color: "bg-gray-500",
          borderColor: "border-gray-200 dark:border-gray-700",
          label: "Thông thường",
          hexColor: "#6b7280",
        };
    }
  };

  const rarityConfig = getRarityConfig(item.rarity);
  const canAfford = currentBalance >= item.price;

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:scale-[1.02]",
          "border",
          rarityConfig.borderColor,
          owned && "ring-2 ring-green-400 dark:ring-green-500",
          !canAfford && !owned && "cursor-not-allowed opacity-75",
          "motion-reduce:hover:scale-100 motion-reduce:transition-none",
          className
        )}
      >
        <CardContent className="p-3">
          {/* Product Image */}
          <div className="relative aspect-square mb-3 bg-muted/30 rounded-lg overflow-hidden">
            {!imageError && item.asset ? (
              <>
                {imageLoading && (
                  <Skeleton className="absolute inset-0 rounded-lg" />
                )}
                <Image
                  src={`/${item.asset}`}
                  alt={item.name}
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

            {/* Status Indicators - Bỏ badge trùng lặp vì đã có trong button */}

            {/* Rarity Badge - Chuyển xuống dưới giống avatar-grid */}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm truncate" title={item.name}>
              {item.name}
            </h4>

            {item.description && (
              <p
                className="text-xs text-muted-foreground line-clamp-2"
                title={item.description}
              >
                {item.description}
              </p>
            )}

            {/* Price and Rarity - Layout giống avatar-grid */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Image
                  src="/icons-gems-pack/coin.png"
                  alt="SynCoin"
                  width={16}
                  height={16}
                  className="object-contain"
                />
                <span
                  className={cn(
                    "font-bold text-sm",
                    canAfford
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-500 dark:text-red-400"
                  )}
                >
                  {formatPrice(item.price)}
                </span>
              </div>

              {/* Rarity Badge - Bên phải giống avatar-grid */}
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: rarityConfig.hexColor,
                  color: rarityConfig.hexColor,
                }}
              >
                {rarityConfig.label}
              </Badge>
            </div>

            {/* Affordability Indicator */}
            {!canAfford && !owned && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                Không đủ xu
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0">
          <Button
            onClick={handlePurchaseClick}
            disabled={owned || purchaseLoading || !canAfford}
            className={cn(
              "w-full transition-all duration-200 text-xs",
              owned
                ? "bg-green-500 hover:bg-green-600"
                : !canAfford
                ? "bg-gray-400 hover:bg-gray-500"
                : "bg-primary hover:bg-primary/90"
            )}
            size="sm"
          >
            {purchaseLoading ? (
              <div className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Đang mua...
              </div>
            ) : owned ? (
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Đã sở hữu
              </div>
            ) : !canAfford ? (
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                Không đủ xu
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                Mua ngay
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Purchase Dialog */}
      <PurchaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={item}
        currentBalance={currentBalance}
        onPurchase={handlePurchase}
        loading={purchaseLoading}
        itemType={itemType}
      />
    </>
  );
};

export default ProductCard;
