"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/feedback";
import {
  Loader2,
  ShoppingCart,
  Coins,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShopItem } from "@/lib/services/api/shop.service";

/**
 * Purchase dialog props
 */
interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ShopItem | null;
  currentBalance: number;
  onPurchase: (
    itemType: "avatars" | "frames" | "emojis",
    itemId: string
  ) => Promise<void>;
  loading: boolean;
  itemType: "avatars" | "frames" | "emojis";
}

/**
 * Purchase dialog states
 */
type PurchaseState = "confirm" | "processing" | "success" | "error";

/**
 * PurchaseDialog Component
 * Dialog xác nhận và hiển thị kết quả purchase với item details và balance info
 */
export function PurchaseDialog({
  open,
  onOpenChange,
  item,
  currentBalance,
  onPurchase,
  loading,
  itemType,
}: PurchaseDialogProps) {
  const [purchaseState, setPurchaseState] = useState<PurchaseState>("confirm");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reset state khi dialog đóng/mở
  React.useEffect(() => {
    if (open) {
      setPurchaseState("confirm");
      setErrorMessage("");
    }
  }, [open]);

  // Kiểm tra đủ tiền
  const canAfford = item ? currentBalance >= item.price : false;
  const balanceAfterPurchase = item
    ? currentBalance - item.price
    : currentBalance;

  /**
   * Handle purchase confirmation
   */
  const handlePurchase = async () => {
    if (!item || !canAfford) return;

    try {
      setPurchaseState("processing");
      await onPurchase(itemType, item.id);
      setPurchaseState("success");
    } catch (error) {
      setPurchaseState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Purchase failed"
      );
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    onOpenChange(false);
  };

  /**
   * Format number với locale
   */
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  /**
   * Get item type display name
   */
  const getItemTypeDisplayName = (type: string): string => {
    switch (type) {
      case "avatars":
        return "Ảnh đại diện";
      case "frames":
        return "Khung ảnh";
      case "emojis":
        return "Biểu tượng cảm xúc";
      default:
        return "Vật phẩm";
    }
  };

  /**
   * Get rarity config
   */
  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case "common":
        return { color: "bg-gray-500", label: "Thông thường" };
      case "rare":
        return { color: "bg-blue-500", label: "Hiếm" };
      case "epic":
        return { color: "bg-purple-500", label: "Sử thi" };
      case "legendary":
        return { color: "bg-yellow-500", label: "Huyền thoại" };
      default:
        return { color: "bg-gray-500", label: "Thông thường" };
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {purchaseState === "confirm" && (
              <>
                <ShoppingCart className="h-5 w-5" />
                Xác nhận mua hàng
              </>
            )}
            {purchaseState === "processing" && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            )}
            {purchaseState === "success" && (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Mua thành công!
              </>
            )}
            {purchaseState === "error" && (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Mua thất bại
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {purchaseState === "confirm" && "Xác nhận thông tin mua hàng"}
            {purchaseState === "processing" && "Đang xử lý giao dịch..."}
            {purchaseState === "success" && "Giao dịch đã được hoàn thành"}
            {purchaseState === "error" &&
              "Có lỗi xảy ra trong quá trình mua hàng"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Information */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {/* Item Image */}
            <div className="relative w-16 h-16 bg-muted/30 rounded-lg overflow-hidden">
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
                    sizes="64px"
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
                    <div className="w-6 h-6 mx-auto bg-muted-foreground/20 rounded" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{item.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {getItemTypeDisplayName(itemType)}
                </Badge>
              </div>

              {/* Rarity */}
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  className={cn(
                    getRarityConfig(item.rarity).color,
                    "text-white text-xs px-1.5 py-0.5"
                  )}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {getRarityConfig(item.rarity).label}
                </Badge>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Image
                  src="/icons-gems-pack/coin.png"
                  alt="SynCoin"
                  width={16}
                  height={16}
                  className="object-contain"
                />
                <span className="font-medium">
                  {formatNumber(item.price)} SynXu
                </span>
              </div>
            </div>
          </div>

          {/* Balance Information */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Số dư hiện tại:
              </span>
              <div className="flex items-center gap-1">
                <Image
                  src="/icons-gems-pack/coin.png"
                  alt="SynCoin"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span className="font-medium">
                  {formatNumber(currentBalance)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Giá vật phẩm:
              </span>
              <div className="flex items-center gap-1">
                <Image
                  src="/icons-gems-pack/coin.png"
                  alt="SynCoin"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span className="font-medium">-{formatNumber(item.price)}</span>
              </div>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Số dư sau khi mua:</span>
              <div className="flex items-center gap-1">
                <Image
                  src="/icons-gems-pack/coin.png"
                  alt="SynCoin"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span
                  className={cn(
                    "font-bold",
                    balanceAfterPurchase >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatNumber(balanceAfterPurchase)}
                </span>
              </div>
            </div>
          </div>

          {/* Insufficient funds warning */}
          {!canAfford && purchaseState === "confirm" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">
                Không đủ SynXu để mua vật phẩm này
              </span>
            </div>
          )}

          {/* Error message */}
          {purchaseState === "error" && errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {errorMessage}
              </span>
            </div>
          )}

          {/* Success message */}
          {purchaseState === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Bạn đã mua thành công{" "}
                {getItemTypeDisplayName(itemType).toLowerCase()} "{item.name}"!
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          {purchaseState === "confirm" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={!canAfford || loading}
                className="min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang mua...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Mua ngay
                  </>
                )}
              </Button>
            </>
          )}
          {purchaseState === "processing" && (
            <Button disabled className="min-w-[100px]">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </Button>
          )}
          {(purchaseState === "success" || purchaseState === "error") && (
            <Button onClick={handleClose} className="min-w-[100px]">
              Đóng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
