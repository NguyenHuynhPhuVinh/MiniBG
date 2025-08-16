"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Palette, Frame, Smile } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/navigation";
import type { TabType } from "./ShopPage";

interface ShopTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

// Tab configuration giống CustomizationTabs
const tabConfig = [
  {
    value: "avatars" as const,
    icon: Palette,
    label: "Ảnh đại diện",
    shortLabel: "Ảnh đại diện",
    description: "Chọn ảnh đại diện yêu thích",
  },
  {
    value: "frames" as const,
    icon: Frame,
    label: "Khung ảnh",
    shortLabel: "Khung",
    description: "Khung trang trí đẹp mắt",
  },
  {
    value: "emojis" as const,
    icon: Smile,
    label: "Biểu tượng cảm xúc",
    shortLabel: "Biểu tượng",
    description: "Bộ sưu tập biểu tượng cảm xúc",
  },
];

export const ShopTabs: React.FC<ShopTabsProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  const handleTabChange = (value: string) => {
    onTabChange(value as TabType);
  };

  return (
    <div className={cn("w-full", className)}>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-3">
          {tabConfig.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 transition-all duration-200"
                title={tab.description}
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                {/* Responsive label display */}
                <span className="hidden sm:inline font-medium">
                  {tab.label}
                </span>
                <span className="sm:hidden font-medium">{tab.shortLabel}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ShopTabs;
