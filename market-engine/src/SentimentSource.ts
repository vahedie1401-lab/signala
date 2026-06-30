import type { FearGreedClassification, FearGreedIndex } from "@signala/shared";
import { config, logger } from "@signala/shared";

import { HttpClient } from "../http/HttpClient";

interface AlternativeMeResponse {
  data: {
    value: string;

    value_classification: string;

    timestamp: string;
  }[];
}

const CLASSIFICATION_MAP: Record<string, FearGreedClassification> = {
  "Extreme Fear": "extreme_fear",

  Fear: "fear",

  Neutral: "neutral",

  Greed: "greed",

  "Extreme Greed": "extreme_greed",
};

/**
 * Fear & Greed Index is a market-wide sentiment signal (not per-symbol).
 * Cached internally for a short period since the upstream API updates
 * roughly once per day and has no meaningful per-second granularity.
 */
export class SentimentSource {
  private readonly http = new HttpClient({
    baseUrl: config.get("ALTERNATIVE_ME_REST"),
  });

  private cached: FearGreedIndex | null = null;

  private cachedAt = 0;

  private readonly cacheTtlMs = 5 * 60 * 1000;

  async fetch(): Promise<FearGreedIndex | null> {
    if (this.cached && Date.now() - this.cachedAt < this.cacheTtlMs) {
      return this.cached;
    }

    try {
      const response = await this.http.get<AlternativeMeResponse>("/fng/", {
        limit: 1,

        format: "json",
      });

      const latest = response.data[0];

      if (!latest) return null;

      const result: FearGreedIndex = {
        value: Number(latest.value),

        classification: CLASSIFICATION_MAP[latest.value_classification] ?? "neutral",

        timestamp: Number(latest.timestamp) * 1000,
      };

      this.cached = result;

      this.cachedAt = Date.now();

      return result;
    } catch (error) {
      logger.error({ error }, "SentimentSource: failed to fetch fear & greed index");

      return this.cached; // serve stale rather than null if available
    }
  }
}
