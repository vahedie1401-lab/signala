import { BaseEngine, parsePayload } from "@signala/shared";

import { Notification } from "./NotificationFeature";
import { NotificationFilter } from "./NotificationFilter";
import { NotificationHistory } from "./NotificationHistory";
import { NotificationPublisher } from "./NotificationPublisher";
import { DiscordNotifier } from "./DiscordNotifier";
import { NotificationFormatter } from "./NotificationFormatter";

interface IncomingSignal {
  symbol: string;
  direction: string;
  score: number;
  confidence: number;
  stopLoss: number;
  takeProfit: number;
  price?: number;
}

export class NotificationEngine extends BaseEngine {
  private readonly filter = new NotificationFilter();

  private readonly history = new NotificationHistory();

  private readonly publisher = new NotificationPublisher();

  private readonly discord = new DiscordNotifier();

  private readonly formatter = new NotificationFormatter();

  name() {
    return "Notification";
  }

  protected async initialize() {
    await this.ctx.bus.signals.group.create("notification");
  }

  protected async run() {
    while (this.isRunning()) {
      const events = await this.ctx.bus.signals.consumer.read("notification", "notification-1");

      for (const event of events) {
        const signal = parsePayload<IncomingSignal>(event);

        const dedupeKey = `${signal.symbol}:${signal.direction}:${signal.score}:${signal.confidence}`;

        const notification: Notification = {
          symbol: signal.symbol,
          direction: signal.direction,
          score: signal.score,
          confidence: signal.confidence,
          entry: signal.price ?? 0,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
        };

        if (this.filter.accept(notification) && !this.history.has(dedupeKey)) {
          this.history.add(dedupeKey);

          await this.publisher.publish(notification);

          await this.discord.send(this.formatter.format(notification));
        }

        await this.ctx.bus.signals.consumer.ack("notification", event.id);
      }
    }
  }

  protected async shutdown() {}
}
