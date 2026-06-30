import { BaseEngine, parsePayload } from "@signala/shared";

import { MarketStateAnalyzer } from "./MarketStateAnalyzer";

import { MarketPublisher } from "./MarketPublisher";

export class MarketStateEngine extends BaseEngine {
  private readonly analyzer = new MarketStateAnalyzer();

  private readonly publisher = new MarketPublisher();

  name() {
    return "MarketStateEngine";
  }

  protected async initialize() {
    await this.ctx.bus.features.group.create("market-state");
  }

  protected async run() {
    while (this.isRunning()) {
      const events = await this.ctx.bus.features.consumer.read(
        "market-state",

        "market-state-1",
      );

      for (const event of events) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feature = parsePayload<any>(event);

        const market = this.analyzer.analyze(feature);

        await this.publisher.publish(market);

        await this.ctx.bus.features.consumer.ack(
          "market-state",

          event.id,
        );
      }
    }
  }

  protected async shutdown() {}
}
