import { LiquidityPressure } from "./LiquidityPressure";

import { LiquiditySweepDetector } from "./LiquiditySweepDetector";

import { LiquidityVoidDetector } from "./LiquidityVoidDetector";

import { LiquidityGrabDetector } from "./LiquidityGrabDetector";

import { LiquidityFeature } from "./LiquidityFeature";

export class LiquidityAnalyzer {
  readonly pressure = new LiquidityPressure();

  readonly sweep = new LiquiditySweepDetector();

  readonly voidDetector = new LiquidityVoidDetector();

  readonly grab = new LiquidityGrabDetector();

  private previousBid = 0;

  private previousAsk = 0;

  analyze(
    symbol: string,

    exchange: string,

    timestamp: number,

    bidLiquidity: number,

    askLiquidity: number,

    imbalance: number,
  ): LiquidityFeature {
    const pressure = this.pressure.calculate(
      bidLiquidity,

      askLiquidity,
    );

    const sweep = this.sweep.detect(
      this.previousBid,

      bidLiquidity,

      this.previousAsk,

      askLiquidity,
    );

    const isVoid = this.voidDetector.detect(
      bidLiquidity,

      askLiquidity,
    );

    const grab = this.grab.detect(
      imbalance,

      pressure,
    );

    this.previousBid = bidLiquidity;

    this.previousAsk = askLiquidity;

    return {
      symbol,

      exchange,

      timestamp,

      bidLiquidity,

      askLiquidity,

      imbalance,

      pressure,

      sweep,

      void: isVoid,

      grab,

      confidence: Math.min(
        100,

        Math.abs(pressure) * 100,
      ),
    };
  }
}
