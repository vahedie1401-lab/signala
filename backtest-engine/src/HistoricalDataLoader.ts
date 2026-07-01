import { readFile } from "node:fs/promises";

import { sql } from "@signala/shared";

import type { HistoricalTrade } from "./HistoricalTrade";

/**
 * Loads historical trades from various sources for use with BacktestEngine.
 * Trades do not need to be pre-sorted — BacktestEngine sorts by timestamp.
 */
export class HistoricalDataLoader {
  /** Trades already in memory. Returned as-is (useful for tests/tooling). */
  fromArray(trades: HistoricalTrade[]): HistoricalTrade[] {
    return trades;
  }

  /** Loads a JSON file containing an array of HistoricalTrade objects. */
  async fromJsonFile(path: string): Promise<HistoricalTrade[]> {
    const raw = await readFile(path, "utf-8");
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error(`HistoricalDataLoader: expected a JSON array in ${path}`);
    }

    return parsed.map((row) => this.normalize(row));
  }

  /**
   * Loads a CSV file with a header row containing at least:
   * symbol,exchange,timestamp,price,volume,side
   */
  async fromCsvFile(path: string): Promise<HistoricalTrade[]> {
    const raw = await readFile(path, "utf-8");
    const lines = raw.trim().split("\n").filter(Boolean);

    if (lines.length === 0) return [];

    const header = lines[0]!.split(",").map((column) => column.trim());
    const rows = lines.slice(1);

    return rows.map((line) => {
      const values = line.split(",");

      const record: Record<string, string> = {};

      header.forEach((column, index) => {
        record[column] = values[index] ?? "";
      });

      return this.normalize(record);
    });
  }

  /**
   * Loads trades from a Postgres `trades` table. Assumes a schema with
   * columns: symbol, exchange, ts (epoch ms), price, volume, side.
   * Adjust the query for your actual table/column names if they differ.
   */
  async fromPostgres(params: {
    symbol: string;
    from: number;
    to: number;
    table?: string;
  }): Promise<HistoricalTrade[]> {
    const table = params.table ?? "trades";

    const rows = await sql<
      {
        symbol: string;
        exchange: string;
        ts: string;
        price: string;
        volume: string;
        side: string;
      }[]
    >`
      SELECT symbol, exchange, ts, price, volume, side
      FROM ${sql(table)}
      WHERE symbol = ${params.symbol}
        AND ts BETWEEN ${params.from} AND ${params.to}
      ORDER BY ts ASC
    `;

    return rows.map((row) =>
      this.normalize({
        symbol: row.symbol,
        exchange: row.exchange,
        timestamp: row.ts,
        price: row.price,
        volume: row.volume,
        side: row.side,
      }),
    );
  }

  private normalize(row: unknown): HistoricalTrade {
    const value = row as Record<string, unknown>;

    const symbol = String(value.symbol ?? "");
    const exchange = String(value.exchange ?? "unknown");
    const timestamp = Number(value.timestamp);
    const price = Number(value.price);
    const volume = Number(value.volume);
    const side = String(value.side ?? "buy").toLowerCase() === "sell" ? "sell" : "buy";

    if (!symbol || Number.isNaN(timestamp) || Number.isNaN(price) || Number.isNaN(volume)) {
      throw new Error(`HistoricalDataLoader: malformed trade row: ${JSON.stringify(row)}`);
    }

    return { symbol, exchange, timestamp, price, volume, side };
  }
}
