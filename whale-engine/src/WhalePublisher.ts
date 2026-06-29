import { bus, createEnvelope, PipelineStage } from "@signala/shared";

export class WhalePublisher {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async publish(signal: any) {
    await bus.whales.producer.publish(
      createEnvelope(
        signal,

        PipelineStage.Whale,
      ),
    );
  }
}
