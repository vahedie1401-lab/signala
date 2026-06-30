import type { LiquidityWall, MarketLiquidity, OrderBookSnapshot } from "@signala/shared";
import { config, logger } from "@signala/shared";

import { HttpClient } from "../http/HttpClient";

interface BinanceDepthResponse {
  lastUpdateId: number;

  bids: [string, string][];

  asks: [string, string][];
}

const WALL_MIN_NOTIONAL_USD = 250_000;

const WALL_MAX_DISTANCE_PERCENT = 2;

/**
 * Analyzes order book depth to surface liquidity imbalance, buy/sell walls,
 * and spread health. Source priority:
 *   1. OrderBookSnapshot pushed onto the orderbook stream (collector)
 *   2. REST fallback to Binance depth endpoint (works without collector support)
 */
export class LiquidityAnalyzer {
  private readonly http = new HttpClient({
    baseUrl: config.get("BINANCE_SPOT_REST"),
  });

  /**
   * Analyze a raw order book snapshot regardless of source.
   */
  analyze(symbol: string, snapshot: OrderBookSnapshot): MarketLiquidity {
    const bidDepth = snapshot.bids.reduce((acc, level) => acc + level.volume, 0);

    const askDepth = snapshot.asks.reduce((acc, level) => acc + level.volume, 0);

    const totalDepth = bidDepth + askDepth;

    const imbalance = totalDepth === 0 ? 0 : (bidDepth - askDepth) / totalDepth;

    const bestBid = snapshot.bids[0]?.price ?? 0;

    const bestAsk = snapshot.asks[0]?.price ?? 0;

    const midPrice = bestBid > 0 && bestAsk > 0 ? (bestBid + bestAsk) / 2 : 0;

    const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;

    const spreadPercent = midPrice > 0 ? (spread / midPrice) * 100 : 0;

    const buyWall = this.findWall(snapshot.bids, midPrice, "buy");

    const sellWall = this.findWall(snapshot.asks, midPrice, "sell");

    return {
      symbol,

      bidDepth,

      askDepth,

      imbalance,

      spread,

      spreadPercent,

      buyWall,

      sellWall,

      health: this.classifyHealth(spreadPercent, totalDepth),

      timestamp: snapshot.timestamp,
    };
  }

  /**
   * Fetch and analyze directly from Binance REST (used when no recent
   * order book snapshot is available on the stream for this symbol).
   */
  async fetchAndAnalyze(
    symbol: string,
    limit: 20 | 50 | 100 = 50,
  ): Promise<MarketLiquidity | null> {
    try {
      const data = await this.http.get<BinanceDepthResponse>("/api/v3/depth", {
        symbol,

        limit,
      });

      const snapshot: OrderBookSnapshot = {
        symbol,

        bids: data.bids.map(([price, qty]) => ({
          price: Number(price),

          volume: Number(qty),
        })),

        asks: data.asks.map(([price, qty]) => ({
          price: Number(price),

          volume: Number(qty),
        })),

        timestamp: Date.now(),
      };

      return this.analyze(symbol, snapshot);
    } catch (error) {
      logger.error({ symbol, error }, "LiquidityAnalyzer: failed to fetch order book");

      return null;
    }
  }

  private findWall(
    levels: { price: number; volume: number }[],

    midPrice: number,

    side: "buy" | "sell",
  ): LiquidityWall | null {
    if (midPrice === 0) return null;

    let best: LiquidityWall | null = null;

    for (const level of levels) {
      const notional = level.price * level.volume;

      if (notional < WALL_MIN_NOTIONAL_USD) continue;

      const distancePercent =
        side === "buy"
          ? ((midPrice - level.price) / midPrice) * 100
          : ((level.price - midPrice) / midPrice) * 100;

      if (distancePercent > WALL_MAX_DISTANCE_PERCENT) continue;

      if (!best || notional > best.quantity * level.price) {
        best = {
          price: level.price,

          quantity: level.volume,

          distancePercent,
        };
      }
    }

    return best;
  }

  private classifyHealth(
    spreadPercent: number,

    totalDepth: number,
  ): MarketLiquidity["health"] {
    if (spreadPercent < 0.02 && totalDepth > 0) return "excellent";

    if (spreadPercent < 0.05) return "good";

    if (spreadPercent < 0.15) return "fair";

    return "poor";
  }
}
