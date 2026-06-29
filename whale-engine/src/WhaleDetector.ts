import { LargeTradeDetector } from "./LargeTradeDetector";

import { VolumeSpikeDetector } from "./VolumeSpikeDetector";

import { WhaleScorer } from "./WhaleScorer";

export class WhaleDetector {
  readonly large = new LargeTradeDetector();

  readonly spike = new VolumeSpikeDetector();

  readonly scorer = new WhaleScorer();
}
