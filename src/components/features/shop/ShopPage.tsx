"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShopTabs } from "./ShopTabs";
import { ProductGrid } from "./ProductGrid";

export type TabType = "avatars" | "frames" | "emojis";

interface ShopPageProps {
  className?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ className }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get tab from URL query parameter, default to "avatars"
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get("tab") as TabType;
    return ["avatars", "frames", "emojis"].includes(tabParam)
      ? tabParam
      : "avatars";
  });

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const tabParam = new URLSearchParams(window.location.search).get(
        "tab"
      ) as TabType;
      const validTab = ["avatars", "frames", "emojis"].includes(tabParam)
        ? tabParam
        : "avatars";
      setActiveTab(validTab);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Shop Tabs */}
      <ShopTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Product Grid */}
      <ProductGrid activeTab={activeTab} />
    </div>
  );
};

export default ShopPage;
