import { AppError } from "./AppError";

export class RedisError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: "REDIS_ERROR",
      statusCode: 500,
      details,
    });
  }
}
