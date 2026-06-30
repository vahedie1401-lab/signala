import { SignalScorer } from "../SignalScorer";

import { SignalAggregator } from "../SignalAggregator";

import { SignalFilter } from "../SignalFilter";

import { SignalPublisher } from "../SignalPublisher";

import { ContextValidator } from "../ContextValidator";
import { MultiTimeframeAnalyzer } from "../MultiTimeframeAnalyzer";
import { TimeframeStore } from "../TimeframeStore";

import { AIWeightEngine } from "../ai/AIWeightEngine";

import { ProbabilityEngine } from "../ai/ProbabilityEngine";

export class SignalRunner {
  readonly scorer = new SignalScorer();

  readonly aggregator = new SignalAggregator();

  readonly filter = new SignalFilter();

  readonly validator = new ContextValidator();

  readonly publisher = new SignalPublisher();

  private readonly timeframeStore = new TimeframeStore();

  private readonly multiTimeframe = new MultiTimeframeAnalyzer(this.timeframeStore);

  private readonly ai = new AIWeightEngine();

  private readonly probability = new ProbabilityEngine();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async process(ctx: any) {
    if (!this.validator.valid(ctx)) {
      return;
    }

    const aiScore = this.ai.score(ctx);

    const probability = this.probability.probability(aiScore);

    if (probability < 70) {
      return;
    }

    const score = this.scorer.score(ctx);

    if (!this.filter.accept(score)) {
      return;
    }

    ctx.multiTimeframe = this.multiTimeframe.confirmation(ctx.symbol);

    const signal = this.aggregator.aggregate(
      ctx,

      score,
    );

    signal.confidence = probability;

    await this.publisher.publish(signal);
  }
}
