// Currency-related TypeScript types and interfaces

/**
 * Individual currency balance data
 */
export interface CurrencyData {
  balance: number;
  total_earned: number;
  total_spent: number;
  daily_earned_today: number;
}

/**
 * Complete currency balance response from API
 */
export interface CurrencyBalance {
  SYNC: CurrencyData;
  // GAME_SYSTEM: Loại bỏ Kristal
}

/**
 * User currencies with additional metadata
 */
export interface UserCurrencies extends CurrencyBalance {
  last_updated: string;
  daily_limit_sync: number;
  daily_limit_kris: number;
}

/**
 * Currency display configuration
 */
export interface CurrencyDisplayConfig {
  showTooltip: boolean;
  showIcons: boolean;
  compact: boolean;
}

/**
 * Currency update event data
 */
export interface CurrencyUpdateEvent {
  type: "SYNC";
  amount: number;
  operation: "earned" | "spent";
  reason: string;
  timestamp: string;
}

/**
 * Currency cache data
 */
export interface CurrencyCacheData {
  data: CurrencyBalance;
  timestamp: number;
  expiresAt: number;
}

/**
 * Currency API response wrapper
 */
export interface CurrencyApiResponse {
  success: boolean;
  message: string;
  data: CurrencyBalance;
}

/**
 * Currency service error types
 */
export interface CurrencyError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  showDecimals: boolean;
  useThousandsSeparator: boolean;
  prefix?: string;
  suffix?: string;
}
