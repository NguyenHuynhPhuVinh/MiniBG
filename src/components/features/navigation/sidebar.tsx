"use client";

import { cn } from "@/lib/utils";
import { NavSection } from "./nav-section";
import { ModeToggle } from "@/components/features/shared/mode-toggle";
import Link from "next/link";
import { Logo } from "@/components/ui/display";
import { useEffect, useState, useRef } from "react";
import { SidebarToggle } from "./sidebar-toggle";
import { useSidebarContext } from "@/lib/hooks/use-sidebar";
import { getRoleBasedNavSections } from "./navigation-config";
import { useActiveNavigation } from "@/lib/hooks/use-active-navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { usePathname } from "next/navigation";
import { getCurrentRole } from "@/lib/auth/role-manager";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);

  const {
    collapsed,
    showToggle,
    isTextVisible,
    isMobile,
    isSidebarVisible,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    handleMouseEnter,
    handleMouseLeave,
  } = useSidebarContext();

  const [rawNavSections, setRawNavSections] = useState(
    getRoleBasedNavSections(null)
  );
  const { processedSections: navSections } =
    useActiveNavigation(rawNavSections);

  // Lắng nghe thay đổi đường dẫn để đóng sidebar trên mobile
  // Chỉ đóng sidebar khi đường dẫn thay đổi, không đóng khi mới tải trang
  useEffect(() => {
    if (previousPathRef.current !== pathname && isMobile && isSidebarVisible) {
      closeMobileSidebar();
    }
    previousPathRef.current = pathname;
  }, [pathname, closeMobileSidebar, isMobile, isSidebarVisible]);

  useEffect(() => {
    // Lấy role trực tiếp từ token
    const userRole = getCurrentRole();
    if (userRole) {
      setRawNavSections(getRoleBasedNavSections(userRole));
    }
  }, []);

  const handleSidebarToggle = () => {
    console.log(
      "Toggle sidebar clicked in Sidebar component",
      isSidebarVisible
    );
    toggleMobileSidebar();
  };

  return (
    <>
      {/* Overlay khi mở menu trên mobile */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
            isSidebarVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={handleSidebarToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Luôn hiển thị trong DOM nhưng ẩn ngoài màn hình khi không visible */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group/sidebar flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out relative",
          // Xử lý trạng thái mobile
          isMobile
            ? "fixed inset-y-0 z-50 shadow-lg w-72 transform"
            : collapsed
            ? "w-20"
            : "w-64",
          // Animation trượt ngang cho mobile
          isMobile
            ? isSidebarVisible
              ? "translate-x-0"
              : "-translate-x-full"
            : "",
          className
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 relative">
          <Link href="/" className="font-semibold">
            <Logo
              size="md"
              showText={isTextVisible || isMobile}
              textClassName={cn(
                "transition-all duration-300",
                isTextVisible || isMobile
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none"
              )}
            />
          </Link>

          {/* Nút đóng trên mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSidebarToggle}
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </Button>
          )}

          {/* Nút thu gọn: Luôn hiện khi thu gọn, hoặc hover vào sidebar */}
          {showToggle && !isMobile && (
            <SidebarToggle
              collapsed={collapsed}
              onClick={toggleSidebar}
              className="sidebar-toggle-animate"
            />
          )}
        </div>
        <div
          className="
            flex-1 overflow-y-auto py-4 px-2
            scrollbar-thin
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/30
            transition-colors
            dark:[&::-webkit-scrollbar-track]:bg-transparent
            dark:[&::-webkit-scrollbar-thumb]:bg-muted
            dark:[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/30
          "
        >
          {navSections.map((section, index) => (
            <NavSection
              key={index}
              section={section}
              className="mb-2"
              collapsed={collapsed && !isMobile}
              showText={isTextVisible || isMobile}
            />
          ))}
        </div>
        <div className="mt-auto border-t p-4 flex items-center justify-between">
          <ModeToggle />
        </div>
      </aside>
    </>
  );
}
