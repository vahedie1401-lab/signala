import { bus, createEnvelope, PipelineStage } from "@signala/shared";

export class OrderBookPublisher {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async publish(snapshot: any) {
    await bus.orderBook.producer.publish(
      createEnvelope(
        snapshot,

        PipelineStage.OrderBook,
      ),
    );
  }
}
