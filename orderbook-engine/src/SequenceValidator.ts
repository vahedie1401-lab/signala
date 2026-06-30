import { OrderBookDelta } from "./OrderBookDelta";

export class SequenceValidator {
  validate(previousUpdateId: number, delta: OrderBookDelta): boolean {
    return (
      delta.firstUpdateId <= previousUpdateId + 1 && delta.finalUpdateId >= previousUpdateId + 1
    );
  }
}
