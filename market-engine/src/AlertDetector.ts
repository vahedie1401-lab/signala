import type {
  MarketAlert,
  MarketDerivatives,
  MarketLiquidity,
  MarketRegime,
  WhaleEvent,
} from "@signala/shared";
import { uuid } from "@signala/shared";

const LIQUIDATION_CASCADE_USD_THRESHOLD = 3_000_000;

const WHALE_ALERT_USD_THRESHOLD = 1_000_000;

/**
 * Inspects current-cycle data per symbol and produces zero or more
 * MarketAlert events for conditions worth surfacing immediately
 * (dashboard push, telegram broadcast, etc.) rather than waiting for
 * Signal Engine's full decision cycle.
 */
export class AlertDetector {
  detect(
    symbol: string,

    derivatives: MarketDerivatives | null,

    liquidity: MarketLiquidity | null,

    regime: MarketRegime,

    whaleEvents: WhaleEvent[],
  ): MarketAlert[] {
    const alerts: MarketAlert[] = [];

    if (derivatives) {
      if (Math.abs(derivatives.fundingRate) >= 0.0015) {
        alerts.push(
          this.build(symbol, "funding_extreme", "high", {
            fundingRate: derivatives.fundingRate,

            direction: derivatives.fundingRate > 0 ? "longs paying shorts" : "shorts paying longs",
          }),
        );
      }

      if (derivatives.liquidationVolume1h >= LIQUIDATION_CASCADE_USD_THRESHOLD) {
        alerts.push(
          this.build(symbol, "liquidation_cascade", "critical", {
            volume1h: derivatives.liquidationVolume1h,

            biasSide: derivatives.liquidationBiasSide,
          }),
        );
      }
    }

    if (liquidity && liquidity.health === "poor") {
      alerts.push(
        this.build(symbol, "liquidity_collapse", "medium", {
          spreadPercent: liquidity.spreadPercent,

          bidDepth: liquidity.bidDepth,

          askDepth: liquidity.askDepth,
        }),
      );
    }

    if (regime.volatilityRegime === "extreme") {
      alerts.push(
        this.build(symbol, "volatility_spike", "high", {
          regimeChangeProbability: regime.regimeChangeProbability,
        }),
      );
    }

    for (const whale of whaleEvents) {
      if (whale.usdValue >= WHALE_ALERT_USD_THRESHOLD) {
        alerts.push(
          this.build(
            symbol,

            "whale_activity",

            whale.usdValue >= 5_000_000 ? "high" : "medium",

            {
              side: whale.side,

              usdValue: whale.usdValue,

              score: whale.score,
            },
          ),
        );
      }
    }

    return alerts;
  }

  private build(
    symbol: string,

    type: MarketAlert["type"],

    severity: MarketAlert["severity"],

    data: Record<string, unknown>,
  ): MarketAlert {
    return {
      id: uuid(),

      symbol,

      type,

      severity,

      message: this.formatMessage(symbol, type, data),

      data,

      timestamp: Date.now(),
    };
  }

  private formatMessage(
    symbol: string,

    type: MarketAlert["type"],

    data: Record<string, unknown>,
  ): string {
    switch (type) {
      case "funding_extreme":
        return `${symbol}: extreme funding rate (${data.direction})`;

      case "liquidation_cascade":
        return `${symbol}: liquidation cascade, $${Number(data.volume1h).toLocaleString()} (${data.biasSide} bias)`;

      case "liquidity_collapse":
        return `${symbol}: liquidity deteriorating, spread ${Number(data.spreadPercent).toFixed(3)}%`;

      case "volatility_spike":
        return `${symbol}: extreme volatility regime detected`;

      case "whale_activity":
        return `${symbol}: whale ${data.side} of $${Number(data.usdValue).toLocaleString()}`;

      case "sentiment_shift":
        return `${symbol}: significant sentiment shift detected`;

      default:
        return `${symbol}: market alert`;
    }
  }
}
