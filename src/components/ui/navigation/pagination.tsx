"use client";

import React from "react";
import { Button } from "@/components/ui/forms";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className,
}: PaginationProps) {
  // Tính toán các trang hiển thị
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // Nếu tổng số trang ít hơn hoặc bằng maxVisiblePages, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Tính toán trang bắt đầu và kết thúc
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);

      // Điều chỉnh nếu cần
      if (endPage - startPage + 1 < maxVisiblePages) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        } else {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
      }

      // Thêm trang đầu và dấu ... nếu cần
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      // Thêm các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Thêm dấu ... và trang cuối nếu cần
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={cn("flex items-center justify-center space-x-1", className)}
      aria-label="Pagination"
    >
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Trước</span>
      </Button>

      {/* Page numbers are fully controlled by visiblePages; no separate first-page button to avoid duplicates */}

      {/* Page numbers */}
      {visiblePages.map((page, index) => {
        if (page === "...") {
          return (
            <MoreHorizontal
              key={`ellipsis-${index}`}
              className="h-4 w-4 text-muted-foreground"
            />
          );
        }

        const pageNumber = page as number;
        return (
          <Button
            key={pageNumber}
            variant={pageNumber === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            className="min-w-[2.5rem]"
          >
            {pageNumber}
          </Button>
        );
      })}

      {/* No separate last-page button; handled inside visiblePages to avoid duplicates */}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="gap-1"
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

// Component hiển thị thông tin phân trang
export interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  total,
  limit,
  className,
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      Hiển thị {startItem} - {endItem} trong tổng số {total} kết quả
      {totalPages > 1 && (
        <span className="ml-2">
          (Trang {currentPage} / {totalPages})
        </span>
      )}
    </div>
  );
}

// Component kết hợp Pagination và PaginationInfo
export interface PaginationWithInfoProps extends PaginationProps {
  total: number;
  limit: number;
  showInfo?: boolean;
  infoClassName?: string;
}

export function PaginationWithInfo({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  className,
  infoClassName,
}: PaginationWithInfoProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {showInfo && (
        <PaginationInfo
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          limit={limit}
          className={infoClassName}
        />
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showFirstLast={showFirstLast}
        maxVisiblePages={maxVisiblePages}
        className={className}
      />
    </div>
  );
}
