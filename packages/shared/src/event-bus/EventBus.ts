// import { RedisBus, createEnvelope, PipelineStage } from "../redis";

import { RedisBus } from "../bus";
import { createEnvelope, PipelineStage } from "../observability";
import { EventPublisher } from "./EventPublisher";

import { EventType } from "./EventTypes";

export class EventBus implements EventPublisher {
  constructor(private readonly redis: RedisBus) {}

  async publish<T>(
    type: EventType,

    payload: T,
  ): Promise<void> {
    const envelope = createEnvelope(
      payload,

      PipelineStage.Collector,
    );

    switch (type) {
      case EventType.Trade:
        await this.redis.trade.producer.publish(envelope);
        return;

      //   case EventType.Depth:
      //     return this.redis.depth.producer.publish(envelope);

      //   case EventType.BookTicker:
      //     return this.redis.bookTicker.producer.publish(envelope);

      //   case EventType.Funding:
      //     return this.redis.funding.producer.publish(envelope);

      //   case EventType.OpenInterest:
      //     return this.redis.openInterest.producer.publish(envelope);

      //   case EventType.Liquidation:
      //     return this.redis.liquidation.producer.publish(envelope);

      //   case EventType.MarkPrice:
      //     return this.redis.markPrice.producer.publish(envelope);

      //   case EventType.Kline:
      //     return this.redis.kline.producer.publish(envelope);
    }
  }
}
