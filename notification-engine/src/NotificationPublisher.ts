import { NotificationFormatter } from "./NotificationFormatter";
import { TelegramNotifier } from "./TelegramNotifier";

export class NotificationPublisher {
  constructor(
    private readonly formatter = new NotificationFormatter(),

    private readonly telegram = new TelegramNotifier(),
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async publish(signal: any) {
    const text = this.formatter.format(signal);

    await this.telegram.send(text);
  }
}
