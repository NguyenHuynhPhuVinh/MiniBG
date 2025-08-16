// Tier Assets Utility System for Image Mapping

// Define tier names as const for type safety
export const TIER_NAMES = [
  "wood",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "onyx",
  "sapphire",
  "ruby",
  "amethyst",
  "master",
] as const;

// Vietnamese tier name mapping - centralized for consistency
export const VIETNAMESE_TIER_NAMES: Record<string, string> = {
  wood: "Gỗ",
  bronze: "Đồng",
  silver: "Bạc",
  gold: "Vàng",
  platinum: "Bạch Kim",
  onyx: "Mã Não",
  sapphire: "Sapphire",
  ruby: "Ruby",
  amethyst: "Thạch Anh Tím",
  master: "Bậc Thầy",
} as const;

/**
 * Get Vietnamese tier name from English tier name
 * @param tierName - English tier name
 * @returns Vietnamese tier name
 */
export const getVietnameseTierName = (tierName: string): string => {
  return VIETNAMESE_TIER_NAMES[tierName.toLowerCase()] || tierName;
};

/**
 * Convert 1..12 to Roman numerals (I..XII)
 */
export const toRomanNumeral = (n: number): string => {
  const map = [
    "", // 0
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  const clamped = Math.max(1, Math.min(12, Math.floor(n)));
  return map[clamped];
};

// Tier color mapping for consistent styling across components
export const TIER_COLORS: Record<string, string> = {
  wood: "text-amber-700",
  bronze: "text-orange-600",
  silver: "text-gray-500",
  gold: "text-yellow-500",
  platinum: "text-slate-400",
  onyx: "text-gray-800",
  sapphire: "text-blue-500",
  ruby: "text-red-500",
  amethyst: "text-purple-500",
  master: "text-purple-600",
} as const;

/**
 * Get tier color class for consistent styling
 * @param tierName - English tier name
 * @returns Tailwind color class
 */
export const getTierColor = (tierName: string): string => {
  return TIER_COLORS[tierName.toLowerCase()] || "text-slate-600";
};

// Tier styling for title cards (includes background and border)
export const TIER_CARD_STYLES: Record<string, string> = {
  wood: "text-amber-700 bg-amber-50 border-amber-200",
  bronze: "text-orange-600 bg-orange-50 border-orange-200",
  silver: "text-gray-500 bg-gray-50 border-gray-200",
  gold: "text-yellow-500 bg-yellow-50 border-yellow-200",
  platinum: "text-slate-400 bg-slate-50 border-slate-200",
  onyx: "text-gray-800 bg-gray-100 border-gray-300",
  sapphire: "text-blue-500 bg-blue-50 border-blue-200",
  ruby: "text-red-500 bg-red-50 border-red-200",
  amethyst: "text-purple-500 bg-purple-50 border-purple-200",
  master:
    "text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200",
} as const;

/**
 * Get tier card styling classes for title cards
 * @param tierName - English tier name
 * @returns Tailwind classes for text, background, and border
 */
export const getTierCardStyle = (tierName: string): string => {
  return (
    TIER_CARD_STYLES[tierName.toLowerCase()] ||
    "text-slate-600 bg-slate-50 border-slate-200"
  );
};

export type TierName = (typeof TIER_NAMES)[number];

// Tier name mapping to folder structure (simplified since they're identical)
const TIER_FOLDER_MAP: Record<TierName, string> = {
  wood: "wood",
  bronze: "bronze",
  silver: "silver",
  gold: "gold",
  platinum: "platinum",
  onyx: "onyx",
  sapphire: "sapphire",
  ruby: "ruby",
  amethyst: "amethyst",
  master: "master",
};

// Base path for tier assets
const TIER_ASSETS_BASE_PATH = "/vector-ranks-pack";

// Tier level ranges for validation with type safety
const TIER_LEVEL_RANGES: Record<TierName, { min: number; max: number }> = {
  wood: { min: 1, max: 12 },
  bronze: { min: 13, max: 24 },
  silver: { min: 25, max: 36 },
  gold: { min: 37, max: 48 },
  platinum: { min: 49, max: 60 },
  onyx: { min: 61, max: 72 },
  sapphire: { min: 73, max: 84 },
  ruby: { min: 85, max: 96 },
  amethyst: { min: 97, max: 108 },
  master: { min: 109, max: 120 },
};

/**
 * Normalize tier name to lowercase and handle variations
 * @param tierName - Raw tier name input
 * @returns Normalized tier name or null if invalid
 */
function normalizeTierName(tierName: string): TierName | null {
  const normalized = tierName.toLowerCase().trim() as TierName;
  return TIER_NAMES.includes(normalized) ? normalized : null;
}

/**
 * Calculate level within tier from absolute level
 * @param absoluteLevel - The absolute level number
 * @param tierName - The tier name
 * @returns Level within tier (1-12)
 */
function calculateLevelInTier(
  absoluteLevel: number,
  tierName: TierName
): number {
  const tierRange = TIER_LEVEL_RANGES[tierName];

  // Calculate level within tier (1-12)
  const levelInTier = absoluteLevel - tierRange.min + 1;

  // Ensure level is within valid range (1-12)
  return Math.max(1, Math.min(12, levelInTier));
}

/**
 * Get tier icon path based on tier name and level within tier
 * @param tierName - Name of the tier (e.g., "wood", "bronze")
 * @param levelInTier - Level within the tier (1-12)
 * @returns Path to the tier icon image
 */
export function getTierIcon(tierName: string, levelInTier: number): string {
  const normalizedTier = normalizeTierName(tierName);

  if (!normalizedTier) {
    // Fallback to wood tier level 1 for unknown tiers
    return `${TIER_ASSETS_BASE_PATH}/wood/diamond-wood-1.png`;
  }

  // Ensure level is within valid range (1-12)
  const validLevel = Math.max(1, Math.min(12, levelInTier));

  // Construct the image path (folder name is same as tier name)
  const imagePath = `${TIER_ASSETS_BASE_PATH}/${normalizedTier}/diamond-${normalizedTier}-${validLevel}.png`;

  return imagePath;
}

/**
 * Get tier icon from absolute level (automatically calculates tier and level within tier)
 * @param absoluteLevel - The user's absolute level (1-120+)
 * @returns Path to the tier icon image
 */
export function getTierIconFromLevel(absoluteLevel: number): string {
  // Determine tier based on level - more efficient approach
  let tierName: TierName = "master"; // Default to master for high levels

  // Find the appropriate tier for the level
  for (const tier of TIER_NAMES) {
    const range = TIER_LEVEL_RANGES[tier];
    if (absoluteLevel >= range.min && absoluteLevel <= range.max) {
      tierName = tier;
      break;
    }
  }

  // Calculate level within tier
  const levelInTier = calculateLevelInTier(absoluteLevel, tierName);

  return getTierIcon(tierName, levelInTier);
}

/**
 * Get fallback tier icon (default to level 1 of the tier)
 * @param tierName - Name of the tier
 * @returns Path to the fallback tier icon
 */
export function getDefaultTierIcon(tierName: string): string {
  return getTierIcon(tierName, 1);
}

/**
 * Validate if tier icon exists (basic path validation)
 * @param tierName - Name of the tier
 * @param levelInTier - Level within the tier
 * @returns Boolean indicating if the tier icon path is valid
 */
export function validateTierIcon(
  tierName: string,
  levelInTier: number
): boolean {
  const normalizedTier = normalizeTierName(tierName);

  if (!normalizedTier) {
    return false;
  }

  // Check if level is within valid range
  if (levelInTier < 1 || levelInTier > 12) {
    return false;
  }

  return true;
}

/**
 * Get all available tier icons for a specific tier
 * @param tierName - Name of the tier
 * @returns Array of all icon paths for the tier (levels 1-12)
 */
export function getAllTierIcons(tierName: string): string[] {
  const normalizedTier = normalizeTierName(tierName);
  if (!normalizedTier) {
    return []; // Return empty array for invalid tier names
  }

  const icons: string[] = [];
  for (let level = 1; level <= 12; level++) {
    icons.push(getTierIcon(normalizedTier, level));
  }

  return icons;
}

/**
 * Get tier information from absolute level
 * @param absoluteLevel - The user's absolute level
 * @returns Object with tier name, level in tier, and icon path
 */
export function getTierInfo(absoluteLevel: number): {
  tierName: TierName;
  levelInTier: number;
  iconPath: string;
} {
  let tierName: TierName = "master";

  // Find the appropriate tier for the level
  for (const tier of TIER_NAMES) {
    const range = TIER_LEVEL_RANGES[tier];
    if (absoluteLevel >= range.min && absoluteLevel <= range.max) {
      tierName = tier;
      break;
    }
  }

  const levelInTier = calculateLevelInTier(absoluteLevel, tierName);
  const iconPath = getTierIcon(tierName, levelInTier);

  return {
    tierName,
    levelInTier,
    iconPath,
  };
}

// Image preloading utility for performance optimization
const preloadedImages = new Set<string>();

/**
 * Preload tier icon image for better performance
 * @param iconPath - Path to the icon image
 * @returns Promise that resolves when image is loaded
 */
export function preloadTierIcon(iconPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (preloadedImages.has(iconPath)) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => {
      preloadedImages.add(iconPath);
      resolve();
    };
    img.onerror = () => {
      reject(new Error(`Failed to preload image: ${iconPath}`));
    };
    img.src = iconPath;
  });
}

/**
 * Preload all tier icons for a specific tier
 * @param tierName - Name of the tier
 * @returns Promise that resolves when all images are loaded
 */
export async function preloadAllTierIcons(tierName: string): Promise<void> {
  const icons = getAllTierIcons(tierName);
  const preloadPromises = icons.map((icon) => preloadTierIcon(icon));

  try {
    await Promise.all(preloadPromises);
  } catch (error) {
    console.warn(`Failed to preload some tier icons for ${tierName}:`, error);
  }
}

/**
 * Preload tier icons for common levels (1-20) for better initial performance
 */
export async function preloadCommonTierIcons(): Promise<void> {
  const commonLevels = Array.from({ length: 20 }, (_, i) => i + 1);
  const preloadPromises = commonLevels.map((level) => {
    const iconPath = getTierIconFromLevel(level);
    return preloadTierIcon(iconPath);
  });

  try {
    await Promise.all(preloadPromises);
  } catch (error) {
    console.warn("Failed to preload some common tier icons:", error);
  }
}
