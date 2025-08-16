"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/layout/card";

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Image Skeleton */}
        <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-3">
          {/* Title */}
          <Skeleton className="h-5 w-3/4" />
          
          {/* Price and Rarity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
};

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 8,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>

      {/* Additional Loading Indicators */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải sản phẩm...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
