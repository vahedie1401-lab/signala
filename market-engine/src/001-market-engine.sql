-- market-engine/migrations/001-market-engine.sql
-- Run via: psql $POSTGRES_URL -f market-engine/migrations/001-market-engine.sql
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS market_snapshots (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  bullish_score SMALLINT NOT NULL,
  bearish_score SMALLINT NOT NULL,
  volatility_regime VARCHAR(10) NOT NULL,
  trend_regime VARCHAR(20) NOT NULL,
  risk_level VARCHAR(10) NOT NULL,
  funding_rate DOUBLE PRECISION,
  open_interest DOUBLE PRECISION,
  long_short_ratio DOUBLE PRECISION,
  liquidity_imbalance DOUBLE PRECISION,
  fear_greed_value SMALLINT,
  data_quality SMALLINT NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_snapshots_symbol_time
  ON market_snapshots (symbol, created_at DESC);

CREATE TABLE IF NOT EXISTS market_alerts (
  id UUID PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  type VARCHAR(30) NOT NULL,
  severity VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  data JSONB NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_alerts_symbol_time
  ON market_alerts (symbol, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_market_alerts_severity
  ON market_alerts (severity, created_at DESC)
  WHERE acknowledged = false;

-- Retention: keep snapshots for 30 days, alerts for 90 days.
-- Run periodically (e.g. via Scheduler in this engine, or an external cron):
--   DELETE FROM market_snapshots WHERE created_at < now() - interval '30 days';
--   DELETE FROM market_alerts WHERE created_at < now() - interval '90 days';