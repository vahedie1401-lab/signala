export class EngineMetrics {
  private started = Date.now();

  private processed = 0;

  increment() {
    this.processed++;
  }

  snapshot() {
    return {
      uptime: Date.now() - this.started,

      processed: this.processed,
    };
  }
}
