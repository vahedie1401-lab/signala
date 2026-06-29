import { BaseEngine, parsePayload } from "@signala/shared";

import type { TradeEvent } from "@signala/shared/contracts";

import { FeatureCalculator } from "./FeatureCalculator";

import { FeaturePublisher } from "./FeaturePublisher";

import { FeatureCache } from "./FeatureCache";

export class FeatureEngine extends BaseEngine {
  private readonly calculator = new FeatureCalculator();

  private readonly publisher = new FeaturePublisher();

  private readonly cache = new FeatureCache();

  name(): string {
    return "FeatureEngine";
  }

  protected async initialize(): Promise<void> {
    await this.ctx.bus.trades.group.create("feature");
  }

  protected async run(): Promise<void> {
    while (this.isRunning()) {
      const messages = await this.ctx.bus.trades.consumer.read("feature", "feature-1");

      for (const message of messages) {
        const trade = parsePayload<TradeEvent>(message);

        const feature = this.calculator.update(trade);

        this.cache.set(feature);

        await this.publisher.publish(feature);

        await this.ctx.bus.trades.consumer.ack("feature", message.id);
      }
    }
  }

  protected async shutdown(): Promise<void> {}
}
