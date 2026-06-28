import WebSocket from "ws";

export class Heartbeat {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly ws: WebSocket,
    private readonly interval = 15000,
  ) {}

  start(): void {
    this.stop();

    this.timer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, this.interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
