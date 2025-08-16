import currencyMock from "@/mocks/data/currency.mock.json" assert { type: "json" };
import type { CurrencyApiResponse } from "@/lib/types/currency";

/**
 * Mock handler cho currency endpoints (GAME_SYSTEM: Single currency - SynCoin)
 */
export const currencyMockHandlers = {
  async getBalance(): Promise<CurrencyApiResponse> {
    const payload: CurrencyApiResponse = JSON.parse(
      JSON.stringify(currencyMock)
    );
    // Mô phỏng latency nhẹ
    await new Promise((r) => setTimeout(r, 150));
    return payload;
  },

  async getHistory(): Promise<any> {
    return { success: true, data: [], message: "Mocked history (empty)" };
  },

  async transfer(): Promise<any> {
    return { success: true, message: "Mocked transfer success" };
  },
};
