export abstract class Worker {
  private running = false;

  async start() {
    this.running = true;

    while (this.running) {
      await this.execute();
    }
  }

  stop() {
    this.running = false;
  }

  protected abstract execute(): Promise<void>;
}
