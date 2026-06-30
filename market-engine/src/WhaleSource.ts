import type { WhaleEvent } from "@signala/shared";
import { config, logger, WHALE_MIN_NOTIONAL } from "@signala/shared";

import { HttpClient } from "../http/HttpClient";

interface EtherscanTokenTxResponse {
  status: string;

  message: string;

  result: {
    hash: string;

    from: string;

    to: string;

    value: string;

    tokenDecimal: string;

    timeStamp: string;
  }[];
}

/**
 * Known exchange hot wallet addresses (lowercase). Used to classify whale
 * transfers as exchange inflow (often bearish - selling pressure incoming)
 * vs outflow (often bullish - accumulation/cold storage).
 *
 * This is a starting set; extend as needed. Kept here (not in shared)
 * since it is specific to on-chain whale classification logic.
 */
const KNOWN_EXCHANGE_WALLETS = new Set<string>([
  "0x28c6c06298d514db089934071355e5743bf21d60", // Binance 14
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549", // Binance 15
  "0xdfd5293d8e347dfe59e90efd55b2956a1343963d", // Binance 16
  "0x5041ed759dd4afc3a72b8192c143f72f4724081a", // OKX
  "0x46340b20830761efd32832a74d7169b29feb9758", // Crypto.com
]);

/**
 * Tracks large on-chain ERC-20 / ETH transfers using Etherscan.
 * Symbol scope is limited to assets with a known contract address mapping -
 * this source is best-effort and intentionally degrades to no-op when
 * ETHERSCAN_API_KEY is not configured, rather than failing the whole engine.
 */
export class WhaleSource {
  private readonly enabled: boolean;

  private readonly http: HttpClient | null = null;

  private readonly apiKey: string | undefined;

  /** symbol -> ERC-20 contract address, extend as needed */
  private readonly contracts: Record<string, string> = {
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec",

    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",

    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  };

  constructor() {
    this.apiKey = config.get("ETHERSCAN_API_KEY");

    this.enabled = Boolean(this.apiKey);

    if (this.enabled) {
      this.http = new HttpClient({
        baseUrl: config.get("ETHERSCAN_REST"),
      });
    } else {
      logger.warn("WhaleSource: ETHERSCAN_API_KEY not set, on-chain whale tracking disabled");
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Fetch recent large transfers for a symbol, if a contract mapping exists.
   * Returns [] (not null) when disabled or unsupported, so callers can treat
   * "no whale data" uniformly without special-casing the disabled state.
   */
  async fetchRecentWhaleTransfers(symbol: string): Promise<WhaleEvent[]> {
    if (!this.enabled || !this.http) return [];

    const baseSymbol = symbol.replace(/USDT$|USDC$|BUSD$/, "");

    const contract = this.contracts[baseSymbol] ?? this.contracts[symbol];

    if (!contract) return [];

    try {
      const response = await this.http.get<EtherscanTokenTxResponse>("", {
        module: "account",

        action: "tokentx",

        contractaddress: contract,

        page: 1,

        offset: 50,

        sort: "desc",

        apikey: this.apiKey,
      });

      if (response.status !== "1" || !Array.isArray(response.result)) {
        return [];
      }

      const events: WhaleEvent[] = [];

      for (const tx of response.result) {
        const decimals = Number(tx.tokenDecimal) || 18;

        const amount = Number(tx.value) / 10 ** decimals;

        // Approximate USD value - stable-pegged assets use 1:1; non-stable
        // assets need a price feed which Market Engine does not own. Callers
        // wanting accurate USD valuation for non-stables should multiply
        // `amount` by current price externally.
        const usdValue = amount;

        if (usdValue < WHALE_MIN_NOTIONAL) continue;

        const toExchange = KNOWN_EXCHANGE_WALLETS.has(tx.to.toLowerCase());

        const fromExchange = KNOWN_EXCHANGE_WALLETS.has(tx.from.toLowerCase());

        events.push({
          symbol,

          side: toExchange ? "sell" : fromExchange ? "buy" : "buy",

          price: 0, // unknown at this layer, populate downstream if needed

          volume: amount,

          usdValue,

          score: this.scoreWhaleEvent(usdValue),

          timestamp: Number(tx.timeStamp) * 1000,
        });
      }

      return events;
    } catch (error) {
      logger.error({ symbol, error }, "WhaleSource: failed to fetch on-chain transfers");

      return [];
    }
  }

  private scoreWhaleEvent(usdValue: number): number {
    if (usdValue >= 10_000_000) return 100;

    if (usdValue >= 5_000_000) return 85;

    if (usdValue >= 1_000_000) return 70;

    if (usdValue >= 500_000) return 50;

    return 30;
  }
}
