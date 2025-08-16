/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavItem as NavItemType,
  NavSubItem as NavSubItemType,
} from "@/lib/types/nav";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useState } from "react";

interface NavItemProps {
  item: NavItemType;
  className?: string;
  level?: number;
  collapsed?: boolean;
  showText?: boolean;
}

function SubNavItem({
  item,
  className,
  showText = true,
}: {
  item: NavSubItemType;
  className?: string;
  collapsed?: boolean;
  showText?: boolean;
}) {
  const { title, href, isActive } = item;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center pl-10 py-2 text-sm transition-all duration-200 border-l-2",
        isActive
          ? "text-primary font-medium bg-primary/5 border-primary"
          : "text-muted-foreground hover:text-primary hover:bg-secondary border-l-2 border-transparent hover:border-primary/30",
        className
      )}
    >
      <span
        className={cn(
          "transition-all duration-300",
          showText
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2 pointer-events-none"
        )}
      >
        {title}
      </span>
    </Link>
  );
}

export function NavItem({
  item,
  className,
  collapsed = false,
  showText = true,
}: NavItemProps) {
  const { title, href, icon, isActive, badge, subItems } = item;
  const [isOpen, setIsOpen] = useState(!!isActive);
  const hasSubItems = subItems && subItems.length > 0;

  // Lấy icon component từ tên icon
  const IconComponent = icon ? (LucideIcons as any)[icon] : null;

  return (
    <div className={cn("group", className)}>
      <div className="relative flex items-center">
        <Link
          href={hasSubItems ? "#" : href}
          onClick={(e) => {
            if (hasSubItems) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            "flex flex-1 items-center rounded-md px-3 py-2.5 transition-all duration-200",
            // Khi collapsed thì chỉ còn icon căn trái, text ẩn ngay, không dịch chuyển
            collapsed ? "justify-center" : "gap-3",
            isActive
              ? "bg-primary/10 text-primary font-medium border-l-[3px] border-primary"
              : "text-muted-foreground hover:text-primary hover:bg-secondary border-l-[3px] border-transparent",
            hasSubItems ? "justify-between" : "pr-3",
            className
          )}
        >
          <span
            className={cn(
              "flex items-center",
              collapsed ? "justify-center w-full" : "gap-3"
            )}
          >
            {IconComponent && (
              <IconComponent
                className={cn(
                  "h-[18px] w-[18px] min-w-[18px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary transition-colors"
                )}
              />
            )}
            {/* Text: Ẩn ngay khi collapsed, không bị dịch chuyển, dùng absolute và opacity transition */}
            {showText && (
              <span
                className={cn(
                  "truncate transition-all duration-300",
                  collapsed ? "w-0 opacity-0 absolute left-12" : "w-auto",
                  showText
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none"
                )}
              >
                {title}
              </span>
            )}
          </span>
          {badge && !collapsed && (
            <span
              className={cn(
                "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary transition-all duration-300",
                showText
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none"
              )}
            >
              {badge}
            </span>
          )}
          {hasSubItems && !collapsed && (
            <span
              className={cn(
                "ml-1 text-muted-foreground transition-all duration-300",
                showText
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none"
              )}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
        </Link>
      </div>

      {hasSubItems && isOpen && !collapsed && showText && (
        <div className="mt-1 space-y-0.5 ml-3 border-l border-border/50 pb-1">
          {subItems.map((subItem, index) => (
            <SubNavItem key={index} item={subItem} showText={showText} />
          ))}
        </div>
      )}
    </div>
  );
}
