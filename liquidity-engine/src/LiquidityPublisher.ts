import { bus, createEnvelope, PipelineStage } from "@signala/shared";

import { LiquidityFeature } from "./LiquidityFeature";

export class LiquidityPublisher {
  async publish(feature: LiquidityFeature): Promise<void> {
    await bus.liquidity.producer.publish(
      createEnvelope(
        feature,

        PipelineStage.Liquidity,
      ),
    );
  }
}
