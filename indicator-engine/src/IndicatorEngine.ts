import { BaseEngine } from "@signala/shared/core";
import { parsePayload } from "@signala/shared/streams";
import { TradeEvent } from "@signala/shared/contracts";
import { EMA, ATR, VWAP } from "@signala/shared/Indicators";

export class IndicatorEngine extends BaseEngine {
  readonly ema20 = new EMA(20);

  readonly ema50 = new EMA(50);

  readonly vwap = new VWAP();

  readonly atr = new ATR(14);

  name() {
    return "Indicator";
  }

  protected async initialize() {
    await this.ctx.bus.features.group.create("indicator");
  }

  protected async run() {
    while (this.isRunning()) {
      const events = await this.ctx.bus.features.consumer.read(
        "indicator",

        "indicator-1",
      );

      for (const event of events) {
        //const feature = JSON.parse(event.values.payload as string);
        const feature = parsePayload<TradeEvent>(event);

        this.ema20.update(feature.price);

        this.ema50.update(feature.price);

        this.vwap.update(
          feature.price,

          feature.volume,
        );

        await this.ctx.bus.features.consumer.ack(
          "indicator",

          event.id,
        );
      }
    }
  }

  protected async shutdown() {}
}
