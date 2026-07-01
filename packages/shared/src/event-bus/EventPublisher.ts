import { EventType } from "./EventTypes";

export interface EventPublisher {
  publish<T>(
    type: EventType,

    payload: T,
  ): Promise<void>;
}
