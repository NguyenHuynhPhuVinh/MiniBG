"use client";

import React from "react";
import { ShoppingBag, Sparkles } from "lucide-react";
import { ShopPage } from "@/components/features/shop";

export default function Shop() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-purple-500" />
            Cửa Hàng
          </h1>
          <p className="text-muted-foreground">
            Khám phá và mua sắm các vật phẩm tùy chỉnh cho avatar của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-muted-foreground">Mới cập nhật</span>
        </div>
      </div>

      {/* Shop Content */}
      <ShopPage />
    </div>
  );
}
