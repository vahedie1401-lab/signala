/* eslint-disable @typescript-eslint/no-explicit-any */
import { bus, createEnvelope, PipelineStage } from "@signala/shared";

export class RiskPublisher {
  async publish(feature: any) {
    await bus.risk.producer.publish(
      createEnvelope(
        feature,

        PipelineStage.Risk,
      ),
    );
  }
}
