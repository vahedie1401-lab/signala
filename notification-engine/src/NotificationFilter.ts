import { Notification } from "./NotificationFeature";

export class NotificationFilter {
  accept(signal: Notification) {
    return signal.confidence >= 80 && signal.score >= 75;
  }
}
