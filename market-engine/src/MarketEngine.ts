import type {
  LiquidationEvent,
  MarketDerivatives,
  MarketLiquidity,
  MarketSnapshot,
  Trade,
} from "@signala/shared";
import { BaseEngine, config, parsePayload } from "@signala/shared";

import { AlertDetector } from "../analysis/AlertDetector";
import { CompositeScorer } from "../analysis/CompositeScorer";
import { RegimeClassifier } from "../analysis/RegimeClassifier";
import { MarketRepository } from "../repository/MarketRepository";
import { DerivativesSource } from "../sources/DerivativesSource";
import { LiquidityAnalyzer } from "../sources/LiquidityAnalyzer";
import { SentimentSource } from "../sources/SentimentSource";
import { WhaleSource } from "../sources/WhaleSource";
import { RollingWindow, SymbolWindowRegistry } from "../utils/RollingWindow";

const PRICE_WINDOW_SIZE = 300; // ~5 min at 1 sample/sec from trade stream

/**
 * Market Engine - the most important engine in the platform.
 *
 * Aggregates liquidity, derivatives, on-chain whale activity, sentiment,
 * and market regime into a single MarketSnapshot per symbol, published to
 * the `market` Redis stream for Signal Engine to consume, and persisted to
 * Postgres for historical analysis.
 *
 * Each data source runs on its own cadence (configured via env) because
 * they have very different natural update frequencies: liquidity changes
 * every second, funding rate every 8 hours, sentiment once a day.
 */
export class MarketEngine extends BaseEngine {
  private readonly liquidityAnalyzer = new LiquidityAnalyzer();

  private readonly derivativesSource = new DerivativesSource();

  private readonly sentimentSource = new SentimentSource();

  private readonly whaleSource = new WhaleSource();

  private readonly regimeClassifier = new RegimeClassifier();

  private readonly scorer = new CompositeScorer();

  private readonly alertDetector = new AlertDetector();

  private readonly repository = new MarketRepository();

  private readonly priceWindows = new SymbolWindowRegistry(PRICE_WINDOW_SIZE);

  private readonly latestLiquidity = new Map<string, MarketLiquidity>();

  private readonly latestDerivatives = new Map<string, MarketDerivatives>();

  private readonly timers: NodeJS.Timeout[] = [];

  private readonly symbols: string[];

  constructor() {
    super();

    this.symbols = config.get("MARKET_ENGINE_SYMBOLS");
  }

  name(): string {
    return "MarketEngine";
  }

  protected async initialize(): Promise<void> {
    await this.ctx.bus.trades.group.create("market-engine");

    await this.ctx.bus.liquidation.group.create("market-engine");

    this.ctx.logger.info({ symbols: this.symbols }, "MarketEngine initialized");
  }

  protected async run(): Promise<void> {
    // Independent cadences per source type, as configured.
    this.scheduleLoop("liquidity", config.get("MARKET_ENGINE_LIQUIDITY_INTERVAL_MS"), () =>
      this.runLiquidityCycle(),
    );

    this.scheduleLoop(
      "derivatives",

      config.get("MARKET_ENGINE_DERIVATIVES_INTERVAL_MS"),

      () => this.runDerivativesCycle(),
    );

    this.scheduleLoop("sentiment", config.get("MARKET_ENGINE_SENTIMENT_INTERVAL_MS"), () =>
      this.runSentimentCycle(),
    );

    this.scheduleLoop("snapshot", config.get("MARKET_ENGINE_REGIME_INTERVAL_MS"), () =>
      this.runSnapshotCycle(),
    );

    // Consume trade and liquidation streams concurrently while running.
    await Promise.all([this.consumeTrades(), this.consumeLiquidations()]);
  }

  protected async shutdown(): Promise<void> {
    for (const timer of this.timers) {
      clearInterval(timer);
    }

    this.timers.length = 0;
  }

  // ─────────────────────────────────────
  // Scheduling helper
  // ─────────────────────────────────────

  private scheduleLoop(label: string, intervalMs: number, fn: () => Promise<void>): void {
    const run = async () => {
      try {
        await fn();
      } catch (error) {
        this.ctx.logger.error({ label, error }, "MarketEngine: cycle failed");
      }
    };

    void run();

    const timer = setInterval(() => void run(), intervalMs);

    this.timers.push(timer);
  }

  // ─────────────────────────────────────
  // Stream consumers
  // ─────────────────────────────────────

  private async consumeTrades(): Promise<void> {
    while (this.isRunning()) {
      const messages = await this.ctx.bus.trades.consumer.read("market-engine", "market-1");

      for (const message of messages) {
        try {
          const trade = parsePayload<Trade>(message);

          if (this.symbols.includes(trade.symbol)) {
            this.priceWindows.get(trade.symbol).push(trade.price, trade.timestamp);
          }
        } catch (error) {
          this.ctx.logger.warn({ error, id: message.id }, "MarketEngine: bad trade message");
        }

        await this.ctx.bus.trades.consumer.ack("market-engine", message.id);
      }
    }
  }

  private async consumeLiquidations(): Promise<void> {
    while (this.isRunning()) {
      const messages = await this.ctx.bus.liquidation.consumer.read(
        "market-engine",

        "market-1",
      );

      for (const message of messages) {
        try {
          const liquidation = parsePayload<LiquidationEvent>(message);

          this.derivativesSource.recordLiquidation(
            liquidation.symbol,

            liquidation.side,

            liquidation.usdValue,

            liquidation.timestamp,
          );
        } catch (error) {
          this.ctx.logger.warn({ error, id: message.id }, "MarketEngine: bad liquidation message");
        }

        await this.ctx.bus.liquidation.consumer.ack("market-engine", message.id);
      }
    }
  }

  // ─────────────────────────────────────
  // Cycles
  // ─────────────────────────────────────

  private async runLiquidityCycle(): Promise<void> {
    await Promise.all(
      this.symbols.map(async (symbol) => {
        const liquidity = await this.liquidityAnalyzer.fetchAndAnalyze(symbol);

        if (liquidity) {
          this.latestLiquidity.set(symbol, liquidity);

          await this.ctx.bus.liquidity.producer.publish({
            payload: JSON.stringify(liquidity),
          });
        }
      }),
    );
  }

  private async runDerivativesCycle(): Promise<void> {
    await Promise.all(
      this.symbols.map(async (symbol) => {
        const derivatives = await this.derivativesSource.fetch(symbol);

        if (derivatives) {
          this.latestDerivatives.set(symbol, derivatives);

          await this.ctx.bus.funding.producer.publish({
            payload: JSON.stringify(derivatives),
          });

          if (this.derivativesSource.isFundingExtreme(derivatives.fundingRate)) {
            this.ctx.logger.warn(
              { symbol, fundingRate: derivatives.fundingRate },
              "MarketEngine: extreme funding rate detected",
            );
          }
        }
      }),
    );
  }

  private async runSentimentCycle(): Promise<void> {
    // Market-wide, not per-symbol - fetched once per cycle.
    await this.sentimentSource.fetch();
  }

  /**
   * Main aggregation cycle: combines all sources into MarketSnapshot,
   * publishes to the market stream, persists to Postgres, and raises
   * alerts. This is the cycle Signal Engine's input ultimately depends on.
   */
  private async runSnapshotCycle(): Promise<void> {
    const fearGreed = await this.sentimentSource.fetch();

    await Promise.all(
      this.symbols.map(async (symbol) => {
        const liquidity = this.latestLiquidity.get(symbol) ?? null;

        const derivatives = this.latestDerivatives.get(symbol) ?? null;

        const priceWindow = this.priceWindows.get(symbol);

        const regime = this.regimeClassifier.classify(symbol, priceWindow, derivatives, liquidity);

        const longShort = derivatives
          ? await this.derivativesSource.fetchLongShortRatioDetailed(symbol)
          : null;

        const { bullishScore, bearishScore } = this.scorer.score(
          derivatives,

          liquidity,

          regime,

          fearGreed,

          longShort,
        );

        const whaleEvents = await this.whaleSource.fetchRecentWhaleTransfers(symbol);

        const dataQuality = this.computeDataQuality(liquidity, derivatives, priceWindow);

        const snapshot: MarketSnapshot = {
          symbol,

          timestamp: Date.now(),

          liquidity: liquidity ?? this.emptyLiquidity(symbol),

          derivatives: derivatives ?? this.emptyDerivatives(symbol),

          longShort,

          fearGreed,

          regime,

          bullishScore,

          bearishScore,

          dataQuality,

          isComplete: Boolean(liquidity && derivatives),
        };

        await this.ctx.bus.market.producer.publish({
          payload: JSON.stringify(snapshot),
        });

        void this.repository.saveSnapshot(snapshot);

        const alerts = this.alertDetector.detect(
          symbol,
          derivatives,
          liquidity,
          regime,
          whaleEvents,
        );

        for (const alert of alerts) {
          this.ctx.logger.warn({ alert }, "MarketEngine: alert raised");

          void this.repository.saveAlert(alert);
        }
      }),
    );
  }

  // ─────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────

  private computeDataQuality(
    liquidity: MarketLiquidity | null,

    derivatives: MarketDerivatives | null,

    priceWindow: RollingWindow,
  ): number {
    let score = 0;

    if (liquidity) score += 35;

    if (derivatives) score += 35;

    if (!priceWindow.isEmpty()) score += 20;

    if (priceWindow.size() >= PRICE_WINDOW_SIZE * 0.5) score += 10;

    return Math.min(score, 100);
  }

  private emptyLiquidity(symbol: string): MarketLiquidity {
    return {
      symbol,

      bidDepth: 0,

      askDepth: 0,

      imbalance: 0,

      spread: 0,

      spreadPercent: 0,

      buyWall: null,

      sellWall: null,

      health: "poor",

      timestamp: Date.now(),
    };
  }

  private emptyDerivatives(symbol: string): MarketDerivatives {
    return {
      symbol,

      fundingRate: 0,

      fundingTrend: "stable",

      openInterest: 0,

      openInterestChangePercent: 0,

      openInterestTrend: "stable",

      longShortRatio: 1,

      liquidationVolume1h: 0,

      liquidationBiasSide: "balanced",

      timestamp: Date.now(),
    };
  }
}
