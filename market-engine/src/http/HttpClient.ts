import { logger, retry } from "@signala/shared";

export interface HttpClientOptions {
  baseUrl: string;

  timeoutMs?: number;

  retries?: number;

  headers?: Record<string, string>;
}

export class HttpError extends Error {
  constructor(
    message: string,

    readonly status: number,

    readonly url: string,
  ) {
    super(message);

    this.name = "HttpError";
  }
}

/**
 * Thin REST client used by Market Engine's external data sources
 * (Binance REST, Alternative.me, Etherscan, Bybit, OKX).
 *
 * Handles: timeout, bounded retry, 429 backoff, structured logging.
 * Does NOT throw on 4xx that callers explicitly want to inspect (e.g. symbol
 * not listed on a venue) — callers should check `status` when using `getRaw`.
 */
export class HttpClient {
  private readonly baseUrl: string;

  private readonly timeoutMs: number;

  private readonly retries: number;

  private readonly headers: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");

    this.timeoutMs = options.timeoutMs ?? 8_000;

    this.retries = options.retries ?? 3;

    this.headers = options.headers ?? {};
  }

  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    return retry(() => this.fetchJson<T>(path, params), this.retries);
  }

  /**
   * Like get(), but never throws on non-2xx — returns null instead.
   * Useful for "this symbol may not exist on this venue" type calls
   * where a 400/404 is an expected outcome, not a failure to retry.
   */
  async getOrNull<T>(
    path: string,

    params?: Record<string, string | number | undefined>,
  ): Promise<T | null> {
    try {
      return await this.get<T>(path, params);
    } catch (error) {
      if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
        return null;
      }

      throw error;
    }
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(this.baseUrl + path);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async fetchJson<T>(
    path: string,

    params?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, params);

    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: this.headers,

        signal: controller.signal,
      });

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after") ?? "1");

        logger.warn({ url, retryAfter }, "HTTP 429 rate limited, backing off");

        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));

        throw new HttpError("Rate limited", 429, url);
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");

        throw new HttpError(`HTTP ${res.status}: ${body.slice(0, 200)}`, res.status, url);
      }

      return (await res.json()) as T;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new HttpError(`Timeout after ${this.timeoutMs}ms`, 408, url);
      }

      throw new HttpError(error instanceof Error ? error.message : "Unknown HTTP error", 0, url);
    } finally {
      clearTimeout(timer);
    }
  }
}
