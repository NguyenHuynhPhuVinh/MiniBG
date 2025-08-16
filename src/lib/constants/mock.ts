// Mock feature flags with code-based configuration (no env required)
// GAME_SYSTEM: Chỉ sử dụng 1 loại tiền tệ duy nhất - SynCoin

// Internal mutable state (default: true)
let __USE_MOCKS__ = true;

export const MockConfig = {
  // Read current setting
  get useMocks(): boolean {
    return __USE_MOCKS__;
  },
  // Configure in code at runtime (client-side)
  setUseMocks(value: boolean) {
    __USE_MOCKS__ = Boolean(value);
  },
} as const;

export const MOCK_FLAGS = {
  get USE_MOCKS(): boolean {
    return MockConfig.useMocks;
  },
  // GAME_SYSTEM: Loại bỏ Kristal, chỉ dùng SynCoin
  SINGLE_CURRENCY_MODE: true as const, // Luôn true theo GAME_SYSTEM
} as const;

export type MockFlags = typeof MOCK_FLAGS;
