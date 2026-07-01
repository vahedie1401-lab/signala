import { config, logger } from "@signala/shared";

/**
 * Sends a message to a Telegram chat via the Bot API.
 * Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in the environment
 * to enable this notifier.
 */

export class TelegramNotifier {
  async send(message: string) {
    const token = config.get("TELEGRAM_BOT_TOKEN");
    const chatId = config.get("TELEGRAM_CHAT_ID");

    if (!token || !chatId) {
      logger.warn(
        "TelegramNotifier: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID are not configured, skipping send",
      );
      return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      logger.error(
        { status: response.status, statusText: response.statusText },
        "TelegramNotifier: failed to deliver message",
      );
    }
  }
}
