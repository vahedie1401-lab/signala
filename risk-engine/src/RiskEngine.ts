/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEngine, parsePayload } from "@signala/shared";

import { RiskAnalyzer } from "./RiskAnalyzer";

import { RiskPublisher } from "./RiskPublisher";

export class RiskEngine extends BaseEngine {
  private readonly analyzer = new RiskAnalyzer();

  private readonly publisher = new RiskPublisher();

  name() {
    return "RiskEngine";
  }

  protected async initialize() {
    await this.ctx.bus.signals.group.create("risk");
  }

  protected async run() {
    while (this.isRunning()) {
      const events = await this.ctx.bus.signals.consumer.read(
        "risk",

        "risk-1",
      );

      for (const event of events) {
        const signal = parsePayload<any>(event);

        const risk = this.analyzer.analyze(signal);

        await this.publisher.publish(risk);

        await this.ctx.bus.signals.consumer.ack(
          "risk",

          event.id,
        );
      }
    }
  }

  protected async shutdown() {}
}
