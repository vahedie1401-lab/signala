import { BaseEngine, parsePayload } from "@signala/shared";

import { FeatureVector } from "@signala/feature-engine";

import { WhaleDetector } from "./WhaleDetector";

import { WhalePublisher } from "./WhalePublisher";

import { WhaleCache } from "./WhaleCache";
import { WhaleSignal } from "./WhaleSignal";
import { SmartMoneyDetector } from "./SmartMoneyDetector";
import { AbsorptionDetector } from "./AbsorptionDetector";
import { IcebergDetector } from "./IcebergDetector";
import { AggressiveFlowDetector } from "./AggressiveFlowDetector";
import { WhaleHistory } from "./WhaleHistory";
import { WhaleConfidence } from "./WhaleConfidence";
import { WalletTracker } from "./WalletTracker";

export class WhaleEngine extends BaseEngine {
  private readonly detector = new WhaleDetector();

  private readonly publisher = new WhalePublisher();

  private readonly cache = new WhaleCache();

  private readonly smart = new SmartMoneyDetector();

  private readonly absorption = new AbsorptionDetector();

  private readonly iceberg = new IcebergDetector();

  private readonly aggressive = new AggressiveFlowDetector();

  private readonly history = new WhaleHistory();

  private readonly confidence = new WhaleConfidence();

  private readonly wallets = new WalletTracker();

  name() {
    return "WhaleEngine";
  }

  protected async initialize() {
    await this.ctx.bus.features.group.create("whale");
  }

  protected async run() {
    while (this.isRunning()) {
      const events = await this.ctx.bus.features.consumer.read(
        "whale",

        "whale-1",
      );

      for (const event of events) {
        const feature = parsePayload<FeatureVector>(event);

        const smartScore = this.smart.detect(feature);

        this.detector.spike.update(feature.volume);

        const large = this.detector.large.detect(
          feature.price,

          feature.volume,
        );

        if (!large.detected) {
          await this.ctx.bus.features.consumer.ack(
            "whale",

            event.id,
          );

          continue;
        }

        const ratio = this.detector.spike.score(feature.volume);

        const score = this.detector.scorer.score(
          feature,

          large.usd,

          ratio,
        );

        const signal: WhaleSignal = {
          symbol: feature.symbol,

          exchange: feature.exchange,

          timestamp: feature.timestamp,

          side: feature.deltaVolume > 0 ? "BUY" : "SELL",

          usdSize: large.usd,

          volumeRatio: ratio,

          score,

          confidence: score,
        };

        const confidence = this.confidence.calculate(signal);

        signal.score = (signal.score + smartScore) / 2;

        signal.confidence = confidence;

        this.history.push(signal);

        this.cache.set(signal);

        await this.publisher.publish(signal);

        await this.ctx.bus.features.consumer.ack(
          "whale",

          event.id,
        );
      }
    }
  }

  protected async shutdown() {}
}
