/* eslint-disable @typescript-eslint/no-explicit-any */
import { ATRStopLoss } from "./ATRStopLoss";
import { DynamicTakeProfit } from "./DynamicTakeProfit";
import { PositionSize } from "./PositionSize";
import { LeverageCalculator } from "./LeverageCalculator";
import { TradeQuality } from "./TradeQuality";

export class RiskAnalyzer {
  private readonly stop = new ATRStopLoss();

  private readonly tp = new DynamicTakeProfit();

  private readonly position = new PositionSize();

  private readonly leverage = new LeverageCalculator();

  private readonly quality = new TradeQuality();

  analyze(signal: any) {
    const isLong = signal.direction === "LONG";

    const stop = isLong
      ? this.stop.long(signal.price, signal.atr)
      : this.stop.short(signal.price, signal.atr);

    const tps = isLong
      ? this.tp.long(signal.price, signal.atr)
      : this.tp.short(signal.price, signal.atr);

    const rr = Math.abs(tps.tp2 - signal.price) / Math.abs(signal.price - stop);

    return {
      symbol: signal.symbol,

      exchange: signal.exchange,

      timestamp: Date.now(),

      stopLoss: stop,

      takeProfit1: tps.tp1,

      takeProfit2: tps.tp2,

      takeProfit3: tps.tp3,

      leverage: this.leverage.calculate(signal.volatility),

      positionSize: this.position.calculate(
        1000,

        0.01,

        Math.abs(signal.price - stop),
      ),

      riskReward: rr,

      quality: this.quality.calculate(
        signal.confidence,

        rr,

        signal.trend,
      ),
    };
  }
}
