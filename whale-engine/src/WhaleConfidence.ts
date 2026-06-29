import { WhaleSignal } from "./WhaleSignal";

export class WhaleConfidence {
  calculate(signal: WhaleSignal) {
    let confidence = signal.score;

    confidence += Math.min(signal.volumeRatio, 5) * 4;

    confidence += signal.usdSize / 100000;

    return Math.min(confidence, 100);
  }
}
