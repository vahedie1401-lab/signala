import WebSocket from "ws";
import { SubscriptionManager } from "./SubscriptionManager";

import { logger } from "../logger";
import { ReconnectPolicy } from "./ReconnectPolicy";
import {
  WebSocketManagerOptions,
  WebSocketMessageHandler,
} from "./WebSocketTypes";

export enum ConnectionState {
  IDLE = "IDLE",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
  CLOSED = "CLOSED",
}

export class WebSocketManager {
  private ws: WebSocket | null = null;

  private state = ConnectionState.IDLE;

  private readonly handlers = new Set<WebSocketMessageHandler<unknown>>();

  private readonly reconnectPolicy = new ReconnectPolicy();

  //   private heartbeat: NodeJS.Timeout | null = null;

  //   private reconnectTimer: NodeJS.Timeout | null = null;

  private heartbeat: ReturnType<typeof setInterval> | null = null;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly url: string;

  private readonly subscriptions = new SubscriptionManager();

  private readonly listeners = {
    connect: new Set<() => void>(),
    disconnect: new Set<() => void>(),
    reconnect: new Set<() => void>(),
  };

  constructor(private readonly options: WebSocketManagerOptions) {
    this.url = options.url;
  }

  get connectionState(): ConnectionState {
    return this.state;
  }

  get connected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  async connect(): Promise<void> {
    if (
      this.state === ConnectionState.CONNECTING ||
      this.state === ConnectionState.CONNECTED
    ) {
      return;
    }

    this.state = ConnectionState.CONNECTING;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.once("open", async () => {
        logger.info(`WebSocket Connected -> ${this.url}`);

        this.state = ConnectionState.CONNECTED;

        this.reconnectPolicy.reset();

        this.startHeartbeat();

        await this.restoreSubscriptions();

        this.emitConnect();

        resolve();
      });

      this.ws.once("error", (err: any) => {
        logger.error(err);

        reject(err);
      });

      this.ws.on("close", () => {
        logger.warn(`WebSocket Closed -> ${this.url}`);

        this.stopHeartbeat();

        this.emitDisconnect();

        this.tryReconnect();
      });

      this.ws.on("message", async (buffer: any) => {
        await this.handleMessage(buffer);
      });

      this.ws.on("pong", () => {
        // heartbeat ok
      });
    });
  }

  private async handleMessage(buffer: WebSocket.RawData): Promise<void> {
    try {
      const data = JSON.parse(buffer.toString());

      for (const handler of this.handlers) {
        await handler(data);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  onMessage<T>(handler: WebSocketMessageHandler<T>): void {
    this.handlers.add(handler as WebSocketMessageHandler<unknown>);
  }

  offMessage<T>(handler: WebSocketMessageHandler<T>): void {
    this.handlers.delete(handler as WebSocketMessageHandler<unknown>);
  }

  private tryReconnect(): void {
    if (!this.options.reconnect) {
      this.state = ConnectionState.CLOSED;
      return;
    }

    this.state = ConnectionState.RECONNECTING;

    const delay = this.reconnectPolicy.nextDelay();

    logger.warn(`Reconnect in ${delay} ms`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
        this.emitReconnect();
      } catch {
        this.tryReconnect();
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    const interval = this.options.heartbeatInterval ?? 15000;

    this.heartbeat = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.ping();
        } catch (err) {
          logger.error(err);
        }
      }
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeat !== null) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
  }

  send(data: unknown): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (err) {
      logger.error(err);
      return false;
    }
  }

  async waitUntilConnected(timeout = 10000): Promise<void> {
    if (this.connected) {
      return;
    }

    const started = Date.now();

    while (!this.connected) {
      if (Date.now() - started > timeout) {
        throw new Error("WebSocket connection timeout");
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  isAlive(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    this.stopHeartbeat();

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this.state = ConnectionState.CLOSED;
  }

  destroy(): void {
    this.disconnect();

    this.handlers.clear();

    this.ws = null;
  }

  subscribe(stream: string): boolean {
    this.subscriptions.add(stream);

    return this.send({
      method: "SUBSCRIBE",

      params: [stream],

      id: Date.now(),
    });
  }

  unsubscribe(stream: string): boolean {
    this.subscriptions.remove(stream);

    return this.send({
      method: "UNSUBSCRIBE",

      params: [stream],

      id: Date.now(),
    });
  }

  getMetrics() {
    return {
      state: this.state,
      connected: this.connected,
      handlers: this.handlers.size,
      reconnecting: this.state === ConnectionState.RECONNECTING,
      url: this.url,
    };
  }
  onConnect(handler: () => void): void {
    this.listeners.connect.add(handler);
  }

  onDisconnect(handler: () => void): void {
    this.listeners.disconnect.add(handler);
  }

  onReconnect(handler: () => void): void {
    this.listeners.reconnect.add(handler);
  }

  removeConnectListener(handler: () => void): void {
    this.listeners.connect.delete(handler);
  }

  removeDisconnectListener(handler: () => void): void {
    this.listeners.disconnect.delete(handler);
  }

  removeReconnectListener(handler: () => void): void {
    this.listeners.reconnect.delete(handler);
  }

  addSubscription(stream: string): void {
    this.subscriptions.add(stream);
  }

  removeSubscription(stream: string): void {
    this.subscriptions.remove(stream);
  }

  private async restoreSubscriptions(): Promise<void> {
    if (!this.connected) {
      return;
    }

    if (this.subscriptions.size() === 0) {
      return;
    }

    const payload = this.subscriptions.subscribeMessage();

    this.send(payload);
  }

  private emitConnect(): void {
    for (const listener of this.listeners.connect) {
      listener();
    }
  }

  private emitDisconnect(): void {
    for (const listener of this.listeners.disconnect) {
      listener();
    }
  }

  private emitReconnect(): void {
    for (const listener of this.listeners.reconnect) {
      listener();
    }
  }

  getSubscriptions(): string[] {
    return [...this.subscriptions.values()];
  }

  getState() {
    return {
      url: this.url,
      state: this.state,
      connected: this.connected,
      subscriptions: this.getSubscriptions(),
      reconnectDelay: this.connectionState === ConnectionState.RECONNECTING,
    };
  }
}
