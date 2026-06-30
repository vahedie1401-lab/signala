import { FeatureWeight } from "./FeatureWeight";

export class AdaptiveWeights {
  private weights: FeatureWeight = {
    indicator: 0.3,

    whale: 0.2,

    liquidity: 0.15,

    market: 0.15,

    correlation: 0.1,

    funding: 0.05,

    openInterest: 0.05,
  };

  get() {
    return this.weights;
  }

  update(newWeights: Partial<FeatureWeight>) {
    this.weights = {
      ...this.weights,

      ...newWeights,
    };
  }
}
