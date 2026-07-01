import type { FeatureVector } from "@signala/feature-engine";
import type { MarketFeature } from "@signala/market-state-engine";
import { MarketStateAnalyzer } from "@signala/market-state-engine";
import { ADX } from "@signala/shared/Indicators";

/**
 * Wires the REAL market-state-engine analyzer (MarketStateAnalyzer — trend,
 * range, expansion, and compression detectors) into the backtest.
 *
 * MarketStateAnalyzer needs an `adx` value, which itself needs OHLC candles
 * to compute properly (documented limitation in the ADX indicator class
 * itself). Since the backtest only has trade prints, this uses the exact
 * same directional-move/ATR proxy that @signala/indicator-engine uses in
 * production for the same reason — so this isn't a backtest-only shortcut,
 * it mirrors how the live pipeline approximates ADX today.
 */
export class BacktestMarketTracker {
  private readonly analyzer = new MarketStateAnalyzer();

  private readonly adx = new ADX(14);

  private previousPrice = 0;

  update(
    symbol: string,
    exchange: string,
    timestamp: number,
    feature: FeatureVector,
    liquidityPressure: number,
  ): MarketFeature {
    const directionalMove = this.previousPrice === 0 ? 0 : feature.price - this.previousPrice;
    const atrValue = feature.atr;

    const dxProxy =
      atrValue === 0 ? 0 : Math.min(100, (Math.abs(directionalMove) / atrValue) * 100);

    this.adx.update(dxProxy);
    this.previousPrice = feature.price;

    return this.analyzer.analyze({
      symbol,
      exchange,
      timestamp,
      ema20: feature.ema20,
      ema50: feature.ema50,
      macd: feature.macd,
      atr: feature.atr,
      price: feature.price,
      adx: this.adx.value(),
      liquidity: liquidityPressure,
    });
  }
}
