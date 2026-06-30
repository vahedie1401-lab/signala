import { bus, createEnvelope, PipelineStage } from "@signala/shared";

import { SignalFeature } from "./SignalFeature";

export class SignalPublisher {
  async publish(signal: SignalFeature) {
    await bus.signals.producer.publish(
      createEnvelope(
        signal,

        PipelineStage.Signal,
      ),
    );
  }
}
