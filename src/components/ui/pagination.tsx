"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageNumbers = true,
  maxVisiblePages = 5,
}) => {
  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) return null;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 1;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Trước</span>
      </Button>

      {showPageNumbers && (
        <>
          {/* First page if not visible */}
          {showStartEllipsis && (
            <>
              <Button
                variant={1 === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(1)}
                className="min-w-[40px]"
              >
                1
              </Button>
              {visiblePages[0] > 2 && (
                <div className="flex items-center">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}

          {/* Last page if not visible */}
          {showEndEllipsis && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <div className="flex items-center">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <Button
                variant={totalPages === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="min-w-[40px]"
              >
                {totalPages}
              </Button>
            </>
          )}
        </>
      )}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Page info */}
      <div className="ml-4 text-sm text-muted-foreground hidden md:block">
        Trang {currentPage} / {totalPages}
      </div>
    </div>
  );
};

// Hook for pagination logic
export const usePagination = (totalItems: number, itemsPerPage: number = 12) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Reset to page 1 if current page is out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginateItems = React.useCallback(<T extends any>(items: T[]): T[] => {
    return items.slice(startIndex, endIndex);
  }, [startIndex, endIndex]);

  const goToPage = React.useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const goToNextPage = React.useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = React.useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    itemsPerPage,
    paginateItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage,
  };
};

export default Pagination;
