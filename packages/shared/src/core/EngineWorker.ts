export abstract class EngineWorker {
  private timer: NodeJS.Timeout | null = null;

  protected abstract execute(): Promise<void>;

  start(interval: number) {
    this.stop();

    this.timer = setInterval(() => {
      void this.execute();
    }, interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);

      this.timer = null;
    }
  }
}
