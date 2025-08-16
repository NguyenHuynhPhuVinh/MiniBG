import React from "react";
import { LucideIcon, ClipboardList, FilePlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: "ClipboardList" | "FilePlus" | "Search" | string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  // Map tên biểu tượng đến component tương ứng
  const IconComponent: LucideIcon =
    icon === "ClipboardList"
      ? ClipboardList
      : icon === "FilePlus"
      ? FilePlus
      : icon === "Search"
      ? Search
      : ClipboardList;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 sm:py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 sm:p-6 mb-4 sm:mb-6">
        <IconComponent className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
      </div>
      <h3 className="text-base sm:text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1 sm:mt-2 mb-4 sm:mb-6 max-w-md text-sm sm:text-base px-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
