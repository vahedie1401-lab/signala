import { EngineContext } from "./EngineContext";

export abstract class BaseEngine {
  readonly ctx = new EngineContext();

  private running = false;

  async start() {
    if (this.running) return;

    this.running = true;

    await this.initialize();

    this.ctx.logger.info(`${this.name()} started`);

    await this.run();
  }

  async stop() {
    this.running = false;

    await this.shutdown();

    this.ctx.logger.info(`${this.name()} stopped`);
  }

  protected isRunning() {
    return this.running;
  }

  abstract name(): string;

  protected abstract initialize(): Promise<void>;

  protected abstract run(): Promise<void>;

  protected abstract shutdown(): Promise<void>;
}
