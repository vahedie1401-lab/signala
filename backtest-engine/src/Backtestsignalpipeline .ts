import type { FeatureVector } from "@signala/feature-engine";
import {
  AIWeightEngine,
  ContextValidator,
  MultiTimeframeAnalyzer,
  ProbabilityEngine,
  SignalAggregator,
  SignalContext,
  SignalFeature,
  SignalFilter,
  SignalScorer,
  TimeframeStore,
} from "@signala/signal-engine";
import { SmartMoneyDetector } from "@signala/whale-engine";

/**
 * Mirrors signal-engine's SignalRunner.process() exactly, using the SAME
 * real classes (ContextValidator, AIWeightEngine, ProbabilityEngine,
 * SignalScorer, SignalFilter, MultiTimeframeAnalyzer, SignalAggregator) —
 * just without the Redis-bound SignalPublisher, since a backtest returns
 * the signal in-memory instead of publishing it to a live stream.
 *
 * KNOWN PRODUCTION BUG (found while wiring this up, not introduced here):
 *   - AIWeightEngine.score() reads `ctx.indicator.score`, but nothing in
 *     the live pipeline (feature-engine, indicator-engine) ever sets that
 *     field, so in production this term is `undefined * weight = NaN`,
 *     which poisons the whole AI score. This backtest works around it by
 *     giving ctx.indicator a `.score` (via whale-engine's SmartMoneyDetector,
 *     an existing indicator-confluence scorer) — the same fix should be
 *     applied in signal-engine's live ContextBuilder.
 *   - ProbabilityEngine.probability() = aiScore*0.6 + successRate*40, gated
 *     at >=70. successRate() is always 0 in production (PerformanceTracker
 *     .add() is never called anywhere), so the gate reduces to
 *     aiScore*0.6 >= 70 → aiScore >= 116.7. But AIWeightEngine's own
 *     AdaptiveWeights only sum to 0.8 for the 4 fields that are always
 *     populated (indicator/whale/liquidity/market), capping aiScore at 80.
 *     80*0.6 = 48 < 70 — the gate can MATHEMATICALLY NEVER pass. As written,
 *     production signal-engine would never emit a single signal.
 *     `useProbabilityGate` defaults to false here so the backtest is
 *     actually usable; set it to true to reproduce the (broken) literal
 *     production behavior.
 */
export class BacktestSignalPipeline {
  private readonly validator = new ContextValidator();

  private readonly ai = new AIWeightEngine();

  private readonly probability = new ProbabilityEngine();

  private readonly scorer = new SignalScorer();

  private readonly filter = new SignalFilter();

  private readonly aggregator = new SignalAggregator();

  private readonly timeframeStore = new TimeframeStore();

  private readonly multiTimeframe = new MultiTimeframeAnalyzer(this.timeframeStore);

  private readonly smartMoney = new SmartMoneyDetector();

  constructor(private readonly useProbabilityGate = false) {}

  process(
    symbol: string,
    feature: FeatureVector,
    whale: unknown,
    liquidity: unknown,
    market: unknown,
  ): SignalFeature | undefined {
    const ctx: SignalContext = {
      symbol,
      indicator: { ...feature, score: this.smartMoney.detect(feature) },
      whale,
      liquidity,
      market,
    };

    if (!this.validator.valid(ctx)) return undefined;

    if (this.useProbabilityGate) {
      const aiScore = this.ai.score(ctx);
      const probability = this.probability.probability(aiScore);

      if (probability < 70) return undefined;
    }

    const score = this.scorer.score(ctx);

    if (!this.filter.accept(score)) return undefined;

    ctx.multiTimeframe = this.multiTimeframe.confirmation(ctx.symbol);

    const signal = this.aggregator.aggregate(ctx, score);
    signal.confidence = score;

    return signal;
  }
}
