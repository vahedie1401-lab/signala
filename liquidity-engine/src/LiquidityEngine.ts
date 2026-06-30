import { BaseEngine, parsePayload } from "@signala/shared";

import { LiquidityAnalyzer } from "./LiquidityAnalyzer";

import { LiquidityPublisher } from "./LiquidityPublisher";

import { LiquidityCache } from "./LiquidityCache";

export class LiquidityEngine extends BaseEngine {
  private readonly analyzer = new LiquidityAnalyzer();

  private readonly publisher = new LiquidityPublisher();

  private readonly cache = new LiquidityCache();

  name(): string {
    return "LiquidityEngine";
  }

  protected async initialize(): Promise<void> {
    await this.ctx.bus.orderBook.group.create("liquidity");
  }

  protected async run(): Promise<void> {
    while (this.isRunning()) {
      const events = await this.ctx.bus.orderBook.consumer.read(
        "liquidity",

        "liquidity-1",
      );

      for (const event of events) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feature = parsePayload<any>(event);

        const liquidity = this.analyzer.analyze(
          feature.symbol,

          "binance",

          Date.now(),

          feature.totalBidLiquidity,

          feature.totalAskLiquidity,

          feature.imbalance,
        );

        this.cache.set(liquidity);

        await this.publisher.publish(liquidity);

        await this.ctx.bus.orderBook.consumer.ack(
          "liquidity",

          event.id,
        );
      }
    }
  }

  protected async shutdown(): Promise<void> {}
}
