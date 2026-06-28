import { logger } from "../logger";
import { redis } from "../redis";
import { sql } from "../postgres";
import { bus } from "../bus";
import { config } from "../config";

export class EngineContext {
  readonly logger = logger;

  readonly redis = redis;

  readonly sql = sql;

  readonly bus = bus;

  readonly config = config;
}
