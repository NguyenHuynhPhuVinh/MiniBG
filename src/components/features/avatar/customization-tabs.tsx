"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import { Palette, Frame, Sparkles, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

// Tab types for avatar customization
export type CustomizationTab = "avatars" | "frames" | "emojis";

// Props interface for CustomizationTabs component
export interface CustomizationTabsProps {
  // Current active tab
  activeTab: CustomizationTab;

  // Tab change handler
  onTabChange: (tab: CustomizationTab) => void;

  // Content for each tab
  avatarsContent?: React.ReactNode;
  framesContent?: React.ReactNode;
  nameEffectsContent?: React.ReactNode;
  emojisContent?: React.ReactNode;

  // Styling
  className?: string;

  // URL synchronization
  enableUrlSync?: boolean;
}

/**
 * CustomizationTabs Component
 *
 * Provides tab navigation for avatar customization with:
 * - URL synchronization for deep linking
 * - Keyboard navigation support
 * - Responsive design
 * - Icon-based tab indicators
 */
export const CustomizationTabs: React.FC<CustomizationTabsProps> = ({
  activeTab,
  onTabChange,
  avatarsContent,
  framesContent,
  nameEffectsContent,
  emojisContent,
  className,
  enableUrlSync = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync URL with tab state
  useEffect(() => {
    if (!enableUrlSync) return;

    const currentTab = searchParams.get("tab") as CustomizationTab;
    const validTabs: CustomizationTab[] = ["avatars", "frames", "emojis"];

    // If URL has a valid tab that's different from current, update state
    if (
      currentTab &&
      validTabs.includes(currentTab) &&
      currentTab !== activeTab
    ) {
      onTabChange(currentTab);
    }
  }, [searchParams, activeTab, onTabChange, enableUrlSync]);

  // Handle tab change with URL update
  const handleTabChange = (newTab: string) => {
    const tab = newTab as CustomizationTab;
    onTabChange(tab);

    if (enableUrlSync) {
      // Update URL without page reload
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  // Tab configuration with icons and labels
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
      label: "Khung",
      shortLabel: "Khung",
      description: "Trang bị khung theo cấp",
    },
    {
      value: "emojis" as const,
      icon: Smile,
      label: "Biểu tượng cảm xúc",
      shortLabel: "Biểu tượng",
      description: "Bộ sưu tập biểu tượng cảm xúc",
    },
  ];

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

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent
            value="avatars"
            className="space-y-4 focus:outline-none"
            tabIndex={-1}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Bộ sưu tập Ảnh đại diện
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Chọn ảnh đại diện để thể hiện phong cách của bạn
                  </p>
                </div>
              </div>
              {avatarsContent || (
                <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center space-y-2">
                    <Palette className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Lưới Ảnh đại diện sẽ được triển khai trong Task 3
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="frames"
            className="space-y-4 focus:outline-none"
            tabIndex={-1}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Bộ sưu tập Khung</h3>
                  <p className="text-sm text-muted-foreground">
                    Khung ảnh đại diện theo cấp và thành tích
                  </p>
                </div>
              </div>
              {framesContent}
            </div>
          </TabsContent>

          <TabsContent
            value="emojis"
            className="space-y-4 focus:outline-none"
            tabIndex={-1}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Bộ sưu tập Biểu tượng cảm xúc
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Biểu tượng cảm xúc biểu đạt cảm xúc và phản ứng
                  </p>
                </div>
              </div>
              {emojisContent}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CustomizationTabs;
