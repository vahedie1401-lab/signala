import { logger } from "@signala/shared";

import { BacktestEngine } from "./BacktestEngine";
import { HistoricalDataLoader } from "./HistoricalDataLoader";

/**
 * Usage:
 *   pnpm --filter @signala/backtest-engine backtest -- \
 *     --file ./data/BTCUSDT-trades.json \
 *     --symbol BTCUSDT \
 *     [--balance 10000] [--risk 0.01] [--minScore 60] [--fee 0.0004]
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.file || !args.symbol) {
    logger.error("Usage: backtest --file <path.json|path.csv> --symbol <SYMBOL> [options]");
    process.exit(1);
  }

  const loader = new HistoricalDataLoader();

  const trades = args.file.endsWith(".csv")
    ? await loader.fromCsvFile(args.file)
    : await loader.fromJsonFile(args.file);

  const overrides: Partial<import("./BacktestConfig").BacktestConfig> = {};

  if (args.balance) overrides.initialBalance = Number(args.balance);
  if (args.risk) overrides.riskPerTrade = Number(args.risk);
  if (args.minScore) overrides.minScore = Number(args.minScore);
  if (args.fee) overrides.feeRate = Number(args.fee);

  const engine = new BacktestEngine({
    symbol: args.symbol,
    ...overrides,
  });

  const report = engine.run(trades);

  logger.info(
    {
      symbol: args.symbol,
      tradesConsidered: report.tradesConsidered,
      closedTrades: report.trades.length,
      ...report.performance,
      equityCurve: undefined,
    },
    "Backtest complete",
  );
}

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token?.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];

      if (next && !next.startsWith("--")) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = "true";
      }
    }
  }

  return args;
}

main().catch((error) => {
  logger.error({ error }, "Backtest run failed");
  process.exit(1);
});
