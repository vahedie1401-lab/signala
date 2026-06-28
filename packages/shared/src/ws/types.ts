export type WebSocketState = "idle" | "connecting" | "connected" | "disconnected";

export interface WebSocketOptions {
  url: string;

  reconnect?: boolean;

  reconnectDelay?: number;

  heartbeatInterval?: number;
}

export type MessageHandler<T = unknown> = (message: T) => void;
