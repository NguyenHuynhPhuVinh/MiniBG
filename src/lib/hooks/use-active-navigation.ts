"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NavSection, NavItem, NavSubItem } from "@/lib/types/nav";

/**
 * Hook theo dõi đường dẫn hiện tại và đánh dấu các mục active trong sidebar
 */
export function useActiveNavigation(navSections: NavSection[]) {
  const pathname = usePathname();
  const [processedSections, setProcessedSections] =
    useState<NavSection[]>(navSections);

  useEffect(() => {
    if (!navSections.length) return;

    // Hàm kiểm tra URL có phù hợp với route không
    // Nếu isSubItem = true: chỉ exact match để tránh active trùng mục con
    const isRouteMatch = (
      navPath: string,
      currentPath: string,
      options?: { isSubItem?: boolean }
    ): boolean => {
      const isSubItem = options?.isSubItem === true;
      // Xử lý đặc biệt cho trang Dashboard
      if (navPath === "/dashboard") {
        // Chỉ active khi URL chính xác là "/dashboard" hoặc "/dashboard/"
        return currentPath === "/dashboard" || currentPath === "/dashboard/";
      }

      // Xử lý đặc biệt cho trang tạo quiz mới (phải match với menu quiz)
      // Chỉ áp dụng cho item cha, không áp dụng cho sub item
      if (!isSubItem) {
        if (
          currentPath.includes("/quizzes/new") &&
          navPath.endsWith("/quizzes")
        ) {
          return true;
        }
      }

      // Xử lý url trực tiếp giống nhau
      if (navPath === currentPath) {
        return true;
      }

      // Với item cha: cho phép match theo tiền tố để active khi ở trang con
      // Với sub item: KHÔNG áp dụng, chỉ exact match ở trên
      if (!isSubItem) {
        // Xử lý url con (bắt đầu với path của navigation item)
        // Nhưng cần kiểm tra thêm để tránh match nhầm với các path khác
        // ví dụ như /dashboard/teaching và /dashboard/teacher
        if (navPath !== "/dashboard" && currentPath.startsWith(navPath + "/")) {
          return true;
        }
      }

      return false;
    };

    // Hàm đánh dấu active cho mục con
    const markSubItemActive = (subItems?: NavSubItem[]): NavSubItem[] => {
      if (!subItems) return [];

      return subItems.map((subItem) => ({
        ...subItem,
        // Sub item chỉ active khi đường dẫn trùng khớp chính xác
        isActive: isRouteMatch(subItem.href, pathname, { isSubItem: true }),
      }));
    };

    // Hàm đánh dấu active cho mục chính
    const markItemActive = (items: NavItem[]): NavItem[] => {
      return items.map((item) => {
        // Kiểm tra nếu đường dẫn hiện tại khớp với href của item
        const isPathMatch = isRouteMatch(item.href, pathname);

        // Xử lý subItems
        const subItems = item.subItems
          ? markSubItemActive(item.subItems)
          : undefined;
        const hasActiveSubItem = subItems?.some((subItem) => subItem.isActive);

        return {
          ...item,
          isActive: isPathMatch || hasActiveSubItem,
          subItems,
        };
      });
    };

    // Xử lý cho toàn bộ sections
    const updatedSections = navSections.map((section) => ({
      ...section,
      items: markItemActive(section.items),
    }));

    setProcessedSections(updatedSections);
  }, [pathname, navSections]);

  return { processedSections };
}
