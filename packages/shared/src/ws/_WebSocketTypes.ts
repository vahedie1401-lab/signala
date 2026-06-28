export interface WebSocketManagerOptions {
  url: string;

  reconnect?: boolean;

  reconnectDelay?: number;

  heartbeatInterval?: number;

  maxReconnectAttempts?: number;
}

export interface WebSocketMessageHandler<T> {
  (message: T): void | Promise<void>;
}

export interface SubscribeOptions {
  streams: string[];
}
