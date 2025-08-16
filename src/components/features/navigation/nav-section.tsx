"use client";

import { cn } from "@/lib/utils";
import { NavSection as NavSectionType } from "@/lib/types/nav";
import { NavItem } from "./nav-item";

interface NavSectionProps {
  section: NavSectionType;
  className?: string;
  collapsed?: boolean;
  showText?: boolean;
}

export function NavSection({
  section,
  className,
  collapsed = false,
  showText = true,
}: NavSectionProps) {
  const { title, items } = section;

  return (
    <div className={cn("py-2", className)}>
      {title && !collapsed && (
        <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-primary/70 flex items-center">
          <span className="mr-2 h-px w-5 bg-primary/30"></span>
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
        </h3>
      )}
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <NavItem
            key={index}
            item={item}
            collapsed={collapsed}
            showText={showText}
          />
        ))}
      </div>
    </div>
  );
}
