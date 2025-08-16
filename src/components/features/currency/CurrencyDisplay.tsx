"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/feedback/tooltip";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import type {
  CurrencyBalance,
  CurrencyDisplayConfig,
} from "@/lib/types/currency";

interface CurrencyDisplayProps {
  balance?: CurrencyBalance | null;
  loading?: boolean;
  error?: string | null;
  config?: Partial<CurrencyDisplayConfig>;
  className?: string;
  onRetry?: () => void;
}

/**
 * CurrencyDisplay Component
 * Displays SynCoin balance with responsive design (GAME_SYSTEM single currency)
 * Optimized with React.memo for performance
 */
const CurrencyDisplayComponent = ({
  balance,
  loading = false,
  error,
  config = {},
  className,
  onRetry,
}: CurrencyDisplayProps) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const displayConfig: CurrencyDisplayConfig = {
    showTooltip: true,
    showIcons: true,
    compact: false,
    ...config,
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const handleImageError = (currency: string) => {
    setImageErrors((prev) => ({ ...prev, [currency]: true }));
  };

  const renderCurrencyItem = (
    type: "SYNC",
    data: {
      balance: number;
      total_earned: number;
      total_spent: number;
      daily_earned_today: number;
    },
    iconPath: string,
    colorTheme: string
  ) => {
    const tooltipContent = (
      <div className="space-y-1 text-sm">
        <div className="font-semibold">SynCoin</div>
        <div>Số dư: {formatNumber(data.balance)}</div>
        <div>Tổng kiếm được: {formatNumber(data.total_earned)}</div>
        <div>Tổng đã tiêu: {formatNumber(data.total_spent)}</div>
        <div>Hôm nay: {formatNumber(data.daily_earned_today)}</div>
      </div>
    );

    const currencyElement = (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md min-w-fit",
          "transition-colors duration-200 ease-in-out",
          "hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer",
          displayConfig.compact && "gap-1 px-2 py-1"
        )}
      >
        {displayConfig.showIcons && (
          <div
            className={cn(
              "relative flex-shrink-0",
              displayConfig.compact ? "w-4 h-4" : "w-5 h-5"
            )}
          >
            {!imageErrors[type] ? (
              <Image
                src={iconPath}
                alt={type === "SYNC" ? "SynCoin" : "Kristal"}
                width={displayConfig.compact ? 16 : 20}
                height={displayConfig.compact ? 16 : 20}
                className="object-contain"
                onError={() => handleImageError(type)}
                loading="lazy"
                priority={false}
              />
            ) : (
              <div
                className={cn(
                  "w-full h-full rounded-full flex items-center justify-center text-xs font-bold",
                  type === "SYNC"
                    ? "bg-yellow-500 text-yellow-900"
                    : "bg-purple-500 text-purple-100"
                )}
              >
                {type === "SYNC" ? "S" : "K"}
              </div>
            )}
          </div>
        )}

        <span
          className={cn(
            "font-semibold",
            "tabular-nums leading-none whitespace-nowrap", // Consistent number width
            "text-yellow-700 dark:text-yellow-400",
            displayConfig.compact ? "text-sm" : "text-sm"
          )}
        >
          {formatNumber(data.balance)}
        </span>
      </div>
    );

    if (displayConfig.showTooltip) {
      return (
        <TooltipTrigger key={type} asChild>
          {currencyElement}
        </TooltipTrigger>
      );
    }

    return <div key={type}>{currencyElement}</div>;
  };

  const renderLoadingSkeleton = () => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md min-w-fit animate-pulse">
      <Skeleton className="w-5 h-5 rounded-full bg-yellow-200 dark:bg-yellow-800" />
      <Skeleton className="w-12 h-4 bg-slate-200 dark:bg-slate-700" />
    </div>
  );

  const renderError = () => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md min-w-fit text-destructive">
      <span className="text-sm">Lỗi tải dữ liệu</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs underline hover:no-underline"
        >
          Thử lại
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={cn("flex items-center", className)}>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center", className)}>{renderError()}</div>
    );
  }

  if (!balance) {
    return null;
  }

  const content = (
    <div
      className={cn(
        "flex items-center gap-4",
        displayConfig.compact && "gap-3",
        className
      )}
    >
      {renderCurrencyItem(
        "SYNC",
        balance.SYNC,
        "/icons-gems-pack/coin.png",
        "text-yellow-600 dark:text-yellow-400"
      )}
    </div>
  );

  if (displayConfig.showTooltip) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          {content}
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <div>
                <div className="font-semibold text-yellow-600">SynCoin</div>
                <div className="text-xs space-y-1">
                  <div>Số dư: {formatNumber(balance.SYNC.balance)}</div>
                  <div>
                    Tổng kiếm: {formatNumber(balance.SYNC.total_earned)}
                  </div>
                  <div>
                    Hôm nay: {formatNumber(balance.SYNC.daily_earned_today)}
                  </div>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

// Memoized component for performance optimization
export const CurrencyDisplay = memo(
  CurrencyDisplayComponent,
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      JSON.stringify(prevProps.balance) === JSON.stringify(nextProps.balance) &&
      JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config)
    );
  }
);

CurrencyDisplay.displayName = "CurrencyDisplay";

export default CurrencyDisplay;
