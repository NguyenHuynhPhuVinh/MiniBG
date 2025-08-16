"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/forms/button";
import { ShoppingBag, Package, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "shopping" | "package" | "error";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const iconConfig = {
  shopping: {
    icon: ShoppingBag,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/20"
  },
  package: {
    icon: Package,
    color: "text-blue-500", 
    bgColor: "bg-blue-100 dark:bg-blue-900/20"
  },
  error: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/20"
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = "shopping",
  action,
  className
}) => {
  const config = iconConfig[icon];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center",
      "min-h-[400px]",
      className
    )}>
      {/* Icon */}
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-6",
        config.bgColor
      )}>
        <Icon className={cn("w-8 h-8", config.color)} />
      </div>

      {/* Content */}
      <div className="max-w-md space-y-3">
        <h3 className="text-xl font-semibold text-foreground">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Button */}
      {action && (
        <div className="mt-8">
          <Button
            onClick={action.onClick}
            variant="default"
            size="lg"
            className="px-8"
          >
            {action.label}
          </Button>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="mt-8 flex items-center gap-2 opacity-30">
        <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
        <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
        <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
      </div>
    </div>
  );
};

export default EmptyState;
