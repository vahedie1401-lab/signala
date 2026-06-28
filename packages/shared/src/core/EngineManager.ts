import { BaseEngine } from "./BaseEngine";

export class EngineManager {
  private readonly engines: BaseEngine[] = [];

  register(engine: BaseEngine) {
    this.engines.push(engine);
  }

  async startAll() {
    for (const engine of this.engines) {
      await engine.start();
    }
  }

  async stopAll() {
    for (const engine of this.engines) {
      await engine.stop();
    }
  }
}
