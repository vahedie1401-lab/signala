import { createEnvelope, PipelineStage } from "@signala/shared/observability";

import { bus } from "@signala/shared/bus";

import { FeatureVector } from "./FeatureVector";

export class FeaturePublisher {
  async publish(feature: FeatureVector): Promise<void> {
    await bus.features.producer.publish(createEnvelope(feature, PipelineStage.Feature));
  }
}
