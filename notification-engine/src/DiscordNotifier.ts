import { config, logger } from "@signala/shared";

/** * Sends a message to a Discord channel via an incoming webhook.
 *  Configure DISCORD_WEBHOOK_URL in the environment to enable this notifier.
 */
export class DiscordNotifier {
  async send(message: string) {
    const webhookUrl = config.get("DISCORD_WEBHOOK_URL");

    if (!webhookUrl) {
      logger.warn("DiscordNotifier: DISCORD_WEBHOOK_URL is not configured, skipping send");
      return;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      logger.error(
        { status: response.status, statusText: response.statusText },
        "DiscordNotifier: failed to deliver message",
      );
    }
  }
}
