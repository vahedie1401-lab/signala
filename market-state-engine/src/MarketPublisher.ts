import { bus, createEnvelope, PipelineStage } from "@signala/shared";

export class MarketPublisher {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async publish(feature: any) {
    await bus.market.producer.publish(
      createEnvelope(
        feature,

        PipelineStage.Market,
      ),
    );
  }
}
