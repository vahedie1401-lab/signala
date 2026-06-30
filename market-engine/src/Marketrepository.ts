import type { MarketAlert, MarketSnapshot } from "@signala/shared";
import { logger, sql } from "@signala/shared";

/**
 * Persists Market Engine output to Postgres for historical querying
 * (dashboard charts, backtesting input, alert audit log).
 *
 * Writes are fire-and-forget from the engine's perspective: a DB failure
 * here must never block the Redis publish path, since downstream engines
 * depend on Redis latency, not Postgres latency. Callers should not await
 * these in the hot path - use `void repository.saveSnapshot(...)` or queue.
 */
export class MarketRepository {
  async saveSnapshot(snapshot: MarketSnapshot): Promise<void> {
    try {
      await sql`
        INSERT INTO market_snapshots (
          symbol,
          bullish_score,
          bearish_score,
          volatility_regime,
          trend_regime,
          risk_level,
          funding_rate,
          open_interest,
          long_short_ratio,
          liquidity_imbalance,
          fear_greed_value,
          data_quality,
          is_complete,
          payload
        ) VALUES (
          ${snapshot.symbol},
          ${snapshot.bullishScore},
          ${snapshot.bearishScore},
          ${snapshot.regime.volatilityRegime},
          ${snapshot.regime.trendRegime},
          ${snapshot.regime.riskLevel},
          ${snapshot.derivatives.fundingRate},
          ${snapshot.derivatives.openInterest},
          ${snapshot.derivatives.longShortRatio},
          ${snapshot.liquidity.imbalance},
          ${snapshot.fearGreed?.value ?? null},
          ${snapshot.dataQuality},
          ${snapshot.isComplete},
          ${sql.json(snapshot)}
        )
      `;
    } catch (error) {
      logger.error({ symbol: snapshot.symbol, error }, "MarketRepository: failed to save snapshot");
    }
  }

  async saveAlert(alert: MarketAlert): Promise<void> {
    try {
      await sql`
        INSERT INTO market_alerts (id, symbol, type, severity, message, data)
        VALUES (
          ${alert.id},
          ${alert.symbol},
          ${alert.type},
          ${alert.severity},
          ${alert.message},
          ${sql.json(alert.data)}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    } catch (error) {
      logger.error({ symbol: alert.symbol, error }, "MarketRepository: failed to save alert");
    }
  }

  async getRecentSnapshots(symbol: string, limit = 100): Promise<MarketSnapshot[]> {
    const rows = await sql<{ payload: MarketSnapshot }[]>`
      SELECT payload FROM market_snapshots
      WHERE symbol = ${symbol}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return rows.map((r) => r.payload);
  }

  async getUnacknowledgedAlerts(severity?: MarketAlert["severity"]): Promise<MarketAlert[]> {
    const rows = severity
      ? await sql<MarketAlert[]>`
          SELECT id, symbol, type, severity, message, data, created_at as timestamp
          FROM market_alerts
          WHERE acknowledged = false AND severity = ${severity}
          ORDER BY created_at DESC
          LIMIT 200
        `
      : await sql<MarketAlert[]>`
          SELECT id, symbol, type, severity, message, data, created_at as timestamp
          FROM market_alerts
          WHERE acknowledged = false
          ORDER BY created_at DESC
          LIMIT 200
        `;

    return rows;
  }

  async pruneOldData(): Promise<void> {
    try {
      await sql`DELETE FROM market_snapshots WHERE created_at < now() - interval '30 days'`;

      await sql`DELETE FROM market_alerts WHERE created_at < now() - interval '90 days'`;
    } catch (error) {
      logger.error({ error }, "MarketRepository: failed to prune old data");
    }
  }
}
