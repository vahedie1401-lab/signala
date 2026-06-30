/* eslint-disable @typescript-eslint/no-explicit-any */
export class WebhookNotifier {
  async send(
    url: string,

    payload: any,
  ) {
    await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    });
  }
}
