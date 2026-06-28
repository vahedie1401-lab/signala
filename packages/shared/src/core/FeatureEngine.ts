import { BaseEngine } from "@signala/shared";

export class FeatureEngine extends BaseEngine {
  name() {
    return "FeatureEngine";
  }

  protected async initialize() {
    await this.ctx.bus.trades.group.create("feature");
  }

  protected async run() {
    while (this.isRunning()) {
      const messages = await this.ctx.bus.trades.consumer.read("feature", "feature-1");

      for (const message of messages) {
        // calculate feature

        await this.ctx.bus.trades.consumer.ack("feature", message.id);
      }
    }
  }

  protected async shutdown() {}
}
