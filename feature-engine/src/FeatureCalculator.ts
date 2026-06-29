import type { TradeEvent } from "@signala/shared/contracts";
import { EMA, ATR, RSI, MACD, VWAP } from "@signala/shared/Indicators";

import { FeatureVector } from "./FeatureVector";

export class FeatureCalculator {
  private readonly ema20 = new EMA(20);

  private readonly ema50 = new EMA(50);

  private readonly atr = new ATR(14);

  private readonly rsi = new RSI(14);

  private readonly macd = new MACD();

  private readonly vwap = new VWAP();

  private previousPrice = 0;

  private previousVolume = 0;

  update(trade: TradeEvent): FeatureVector {
    this.ema20.update(trade.price);

    this.ema50.update(trade.price);

    this.rsi.update(trade.price);

    this.macd.update(trade.price);

    this.vwap.update(trade.price, trade.volume);

    const tr = this.previousPrice === 0 ? 0 : Math.abs(trade.price - this.previousPrice);

    this.atr.update(tr);

    const momentum = this.previousPrice === 0 ? 0 : trade.price - this.previousPrice;

    const acceleration = this.previousPrice === 0 ? 0 : momentum;

    const volumeDelta = trade.volume - this.previousVolume;

    const vector: FeatureVector = {
      symbol: trade.symbol,

      exchange: trade.exchange,

      timestamp: trade.timestamp,

      price: trade.price,

      volume: trade.volume,

      momentum,

      acceleration,

      deltaVolume: volumeDelta,

      volatility: this.atr.value(),

      ema20: this.ema20.value(),

      ema50: this.ema50.value(),

      rsi: this.rsi.value(),

      macd: this.macd.value().macd,

      macdSignal: this.macd.value().signal,

      macdHistogram: this.macd.value().histogram,

      atr: this.atr.value(),

      vwap: this.vwap.value(),
    };

    this.previousPrice = trade.price;

    this.previousVolume = trade.volume;

    return vector;
  }
}
