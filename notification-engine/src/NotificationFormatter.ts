import { Notification } from "./NotificationFeature";

export class NotificationFormatter {
  format(signal: Notification) {
    return `

📈 ${signal.symbol}

Direction : ${signal.direction}

Score : ${signal.score}

Confidence : ${signal.confidence}%

Entry : ${signal.entry}

SL : ${signal.stopLoss}

TP : ${signal.takeProfit}

`;
  }
}
