/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEngine, parsePayload } from "@signala/shared";

import { SignalScorer } from "./SignalScorer";

import { SignalAggregator } from "./SignalAggregator";

import { SignalPublisher } from "./SignalPublisher";

import { SignalFilter } from "./SignalFilter";

import { SignalCache } from "./SignalCache";
import { ContextBuilder } from "./ContextBuilder";
import { SignalRunner } from "./runner/SignalRunner";
import { DirtyQueue } from "./queue/DirtyQueue";
import { EventDispatcher } from "./dispatcher/EventDispatcher";
import { SignalScheduler } from "./scheduler/SignalScheduler";

export class SignalEngine extends BaseEngine {
  private readonly scorer = new SignalScorer();

  private readonly filter = new SignalFilter();

  private readonly aggregator = new SignalAggregator();

  private readonly publisher = new SignalPublisher();

  private readonly cache = new SignalCache();

  private readonly indicators = new Map<string, any>();

  private readonly whales = new Map<string, any>();

  private readonly liquidity = new Map<string, any>();

  private readonly markets = new Map<string, any>();

  private readonly builder = new ContextBuilder();

  private readonly queue = new DirtyQueue();

  private readonly dispatcher = new EventDispatcher(
    this.builder,

    this.queue,
  );

  private readonly runner = new SignalRunner();

  private readonly scheduler = new SignalScheduler(
    this.queue,

    this.builder,

    this.runner,
  );

  name() {
    return "SignalEngine";
  }

  private async consumeFeatures(): Promise<void> {
    const events = await this.ctx.bus.features.consumer.read("signal", "signal-feature");

    for (const event of events) {
      const feature = parsePayload<any>(event);

      //const ctx = this.builder.updateIndicator(feature.symbol, feature);

      // await this.runner.process(ctx);

      this.dispatcher.indicator(feature);

      await this.ctx.bus.features.consumer.ack("signal", event.id);
    }
  }

  private async consumeWhales(): Promise<void> {
    const events = await this.ctx.bus.whales.consumer.read("signal", "signal-whale");

    for (const event of events) {
      const whale = parsePayload<any>(event);

      //const ctx = this.builder.updateWhale(whale.symbol, whale);

      //await this.runner.process(ctx);

      this.dispatcher.whale(whale);

      await this.ctx.bus.whales.consumer.ack("signal", event.id);
    }
  }

  private async consumeLiquidity(): Promise<void> {
    const events = await this.ctx.bus.liquidity.consumer.read("signal", "signal-liquidity");

    for (const event of events) {
      const liquidity = parsePayload<any>(event);

      //const ctx = this.builder.updateLiquidity(liquidity.symbol, liquidity);

      //await this.runner.process(ctx);

      this.dispatcher.liquidity(liquidity);

      await this.ctx.bus.liquidity.consumer.ack("signal", event.id);
    }
  }

  private async consumeMarket(): Promise<void> {
    const events = await this.ctx.bus.market.consumer.read("signal", "signal-market");

    for (const event of events) {
      const market = parsePayload<any>(event);

      //const ctx = this.builder.updateMarket(market.symbol, market);

      //await this.runner.process(ctx);

      this.dispatcher.market(market);

      await this.ctx.bus.market.consumer.ack("signal", event.id);
    }
  }

  protected async initialize(): Promise<void> {
    await this.ctx.bus.features.group.create("signal");

    await this.ctx.bus.whales.group.create("signal");

    await this.ctx.bus.liquidity.group.create("signal");

    await this.ctx.bus.market.group.create("signal");
  }

  protected async run(): Promise<void> {
    while (this.isRunning()) {
      await Promise.all([
        this.consumeFeatures(),

        this.consumeWhales(),

        this.consumeLiquidity(),

        this.consumeMarket(),
      ]);

      await this.scheduler.tick();
    }
  }

  protected async shutdown() {}
}
