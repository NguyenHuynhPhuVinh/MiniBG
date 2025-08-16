"use client";

import { Button } from "@/components/ui/forms";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  collapsed: boolean;
  onClick: () => void;
  className?: string;
}

export function SidebarToggle({
  collapsed,
  onClick,
  className,
}: SidebarToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-md border-2 bg-background z-10 flex items-center justify-center cursor-pointer",
        className
      )}
      onClick={onClick}
      aria-label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
    >
      {collapsed ? (
        <ChevronRight className="h-6 w-6" />
      ) : (
        <ChevronLeft className="h-6 w-6" />
      )}
    </Button>
  );
}
