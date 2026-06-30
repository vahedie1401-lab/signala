import { DirtyQueue } from "../queue/DirtyQueue";
import { ContextBuilder } from "../ContextBuilder";
import { SignalRunner } from "../runner/SignalRunner";

export class SignalScheduler {
  constructor(
    private readonly queue: DirtyQueue,

    private readonly builder: ContextBuilder,

    private readonly runner: SignalRunner,
  ) {}

  async tick(): Promise<void> {
    while (true) {
      const symbol = this.queue.pop();

      if (!symbol) {
        return;
      }

      const ctx = this.builder.get(symbol);

      await this.runner.process(ctx);
    }
  }
}
