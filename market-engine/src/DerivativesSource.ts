import type { LongShortRatio, MarketDerivatives } from "@signala/shared";
import { config, logger } from "@signala/shared";

import { HttpClient } from "../http/HttpClient";
import { SymbolWindowRegistry } from "../utils/RollingWindow";

interface BinanceFundingRateResponse {
  symbol: string;

  fundingRate: string;

  fundingTime: number;
}

interface BinanceOpenInterestResponse {
  symbol: string;

  openInterest: string;

  time: number;
}

interface BinanceLongShortRatioResponse {
  symbol: string;

  longShortRatio: string;

  longAccount: string;

  shortAccount: string;

  timestamp: number;
}

const FUNDING_HISTORY_SIZE = 24; // 8h * 24 = 8 days of funding history at most

const OI_HISTORY_SIZE = 96; // sampled at engine cadence, bounded window

const FUNDING_EXTREME_THRESHOLD = 0.0015; // 0.15% per 8h is considered extreme

/**
 * Pulls derivatives market data (funding, open interest, long/short ratio,
 * recent liquidations) from Binance Futures REST and tracks trend over time
 * using bounded rolling windows (no historical DB dependency required).
 */
export class DerivativesSource {
  private readonly http = new HttpClient({
    baseUrl: config.get("BINANCE_FUTURES_REST"),
  });

  private readonly fundingHistory = new SymbolWindowRegistry(FUNDING_HISTORY_SIZE);

  private readonly oiHistory = new SymbolWindowRegistry(OI_HISTORY_SIZE);

  private readonly recentLiquidations = new Map<
    string,
    { side: "long" | "short"; usdValue: number; timestamp: number }[]
  >();

  async fetch(symbol: string): Promise<MarketDerivatives | null> {
    try {
      const [funding, openInterest, longShort] = await Promise.all([
        this.fetchFundingRate(symbol),

        this.fetchOpenInterest(symbol),

        this.fetchLongShortRatio(symbol),
      ]);

      if (!funding || !openInterest) {
        return null;
      }

      this.fundingHistory.get(symbol).push(funding.fundingRate, funding.fundingTime);

      this.oiHistory.get(symbol).push(openInterest.value, Date.now());

      const oiWindow = this.oiHistory.get(symbol);

      const liquidations = this.summarizeLiquidations(symbol);

      return {
        symbol,

        fundingRate: funding.fundingRate,

        fundingTrend: this.fundingHistory.get(symbol).trend(0.02),

        openInterest: openInterest.value,

        openInterestChangePercent: oiWindow.percentChange(),

        openInterestTrend: oiWindow.trend(1),

        longShortRatio: longShort?.longShortRatio ?? 1,

        liquidationVolume1h: liquidations.totalUsd,

        liquidationBiasSide: liquidations.biasSide,

        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error({ symbol, error }, "DerivativesSource: failed to fetch");

      return null;
    }
  }

  async fetchLongShortRatioDetailed(symbol: string): Promise<LongShortRatio | null> {
    try {
      const rows = await this.http.get<BinanceLongShortRatioResponse[]>(
        "/futures/data/globalLongShortAccountRatio",

        { symbol, period: "5m", limit: 1 },
      );

      const latest = rows[0];

      if (!latest) return null;

      return {
        symbol,

        longAccountRatio: Number(latest.longAccount),

        shortAccountRatio: Number(latest.shortAccount),

        longShortRatio: Number(latest.longShortRatio),

        timestamp: latest.timestamp,
      };
    } catch (error) {
      logger.warn({ symbol, error }, "DerivativesSource: long/short ratio unavailable");

      return null;
    }
  }

  /**
   * Record a liquidation event observed from the liquidation stream
   * (collector's @forceOrder feed). Used to compute 1h liquidation bias.
   */
  recordLiquidation(
    symbol: string,

    side: "long" | "short",

    usdValue: number,

    timestamp: number,
  ): void {
    const list = this.recentLiquidations.get(symbol) ?? [];

    list.push({ side, usdValue, timestamp });

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    const pruned = list.filter((entry) => entry.timestamp >= oneHourAgo);

    this.recentLiquidations.set(symbol, pruned);
  }

  isFundingExtreme(fundingRate: number): boolean {
    return Math.abs(fundingRate) >= FUNDING_EXTREME_THRESHOLD;
  }

  private async fetchFundingRate(
    symbol: string,
  ): Promise<{ fundingRate: number; fundingTime: number } | null> {
    const rows = await this.http.get<BinanceFundingRateResponse[]>("/fapi/v1/fundingRate", {
      symbol,

      limit: 1,
    });

    const latest = rows[0];

    if (!latest) return null;

    return {
      fundingRate: Number(latest.fundingRate),

      fundingTime: latest.fundingTime,
    };
  }

  private async fetchOpenInterest(symbol: string): Promise<{ value: number } | null> {
    const data = await this.http.get<BinanceOpenInterestResponse>("/fapi/v1/openInterest", {
      symbol,
    });

    if (!data) return null;

    return { value: Number(data.openInterest) };
  }

  private async fetchLongShortRatio(symbol: string): Promise<{ longShortRatio: number } | null> {
    const detailed = await this.fetchLongShortRatioDetailed(symbol);

    if (!detailed) return null;

    return { longShortRatio: detailed.longShortRatio };
  }

  private summarizeLiquidations(symbol: string): {
    totalUsd: number;

    biasSide: "long" | "short" | "balanced";
  } {
    const list = this.recentLiquidations.get(symbol) ?? [];

    const longUsd = list.filter((e) => e.side === "long").reduce((a, e) => a + e.usdValue, 0);

    const shortUsd = list.filter((e) => e.side === "short").reduce((a, e) => a + e.usdValue, 0);

    const totalUsd = longUsd + shortUsd;

    if (totalUsd === 0) {
      return { totalUsd: 0, biasSide: "balanced" };
    }

    const diff = Math.abs(longUsd - shortUsd) / totalUsd;

    if (diff < 0.15) {
      return { totalUsd, biasSide: "balanced" };
    }

    return { totalUsd, biasSide: longUsd > shortUsd ? "long" : "short" };
  }
}

export { FUNDING_EXTREME_THRESHOLD };
