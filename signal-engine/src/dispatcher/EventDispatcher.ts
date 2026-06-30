/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextBuilder } from "../ContextBuilder";
import { DirtyQueue } from "../queue/DirtyQueue";

export class EventDispatcher {
  constructor(
    private readonly builder: ContextBuilder,

    private readonly queue: DirtyQueue,
  ) {}

  indicator(event: any): void {
    this.builder.updateIndicator(
      event.symbol,

      event,
    );

    this.queue.add(event.symbol);
  }

  whale(event: any): void {
    this.builder.updateWhale(
      event.symbol,

      event,
    );

    this.queue.add(event.symbol);
  }

  liquidity(event: any): void {
    this.builder.updateLiquidity(
      event.symbol,

      event,
    );

    this.queue.add(event.symbol);
  }

  market(event: any): void {
    this.builder.updateMarket(
      event.symbol,

      event,
    );

    this.queue.add(event.symbol);
  }
}
