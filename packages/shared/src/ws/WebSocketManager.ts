import WebSocket from "ws";

import { Heartbeat } from "./Heartbeat";
import { MessageRouter } from "./MessageRouter";
import { ReconnectStrategy } from "./ReconnectStrategy";
import { SubscriptionManager } from "./SubscriptionManager";
import type { MessageHandler, WebSocketOptions, WebSocketState } from "./types";

export class WebSocketManager {
  private ws: WebSocket | null = null;

  private state: WebSocketState = "idle";

  private reconnectAttempt = 0;

  private reconnectTimer: NodeJS.Timeout | null = null;

  private heartbeat: Heartbeat | null = null;

  readonly router = new MessageRouter();

  readonly subscriptions = new SubscriptionManager();

  readonly reconnect = new ReconnectStrategy();

  constructor(private readonly options: WebSocketOptions) {}

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.state = "connecting";

    this.ws = new WebSocket(this.options.url);

    this.ws.on("open", () => {
      this.state = "connected";

      this.reconnectAttempt = 0;

      this.heartbeat = new Heartbeat(this.ws!, this.options.heartbeatInterval ?? 15000);

      this.heartbeat.start();
    });

    this.ws.on("message", (data) => {
      try {
        this.router.emit(JSON.parse(data.toString()));
      } catch {
        this.router.emit(data.toString());
      }
    });

    this.ws.on("close", () => {
      this.state = "disconnected";

      this.heartbeat?.stop();

      if (this.options.reconnect !== false) {
        this.scheduleReconnect();
      }
    });
  }

  private scheduleReconnect(): void {
    const delay = this.reconnect.getDelay(++this.reconnectAttempt);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    this.heartbeat?.stop();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.ws?.close();

    this.ws = null;
  }

  send(data: unknown): void {
    if (!this.ws) return;

    if (this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify(data));
  }

  on(handler: MessageHandler): void {
    this.router.on(handler);
  }

  off(handler: MessageHandler): void {
    this.router.off(handler);
  }

  subscribe(stream: string): void {
    if (this.subscriptions.has(stream)) {
      return;
    }

    this.subscriptions.add(stream);

    this.send({
      method: "SUBSCRIBE",
      params: [stream],
      id: Date.now(),
    });
  }

  unsubscribe(stream: string): void {
    this.subscriptions.remove(stream);

    this.send({
      method: "UNSUBSCRIBE",
      params: [stream],
      id: Date.now(),
    });
  }

  getState(): WebSocketState {
    return this.state;
  }

  getSubscriptions(): string[] {
    return this.subscriptions.values();
  }
}
