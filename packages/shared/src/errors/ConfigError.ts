import { AppError } from "./AppError";

export class ConfigError extends AppError {
  constructor(message: string) {
    super(message, {
      code: "CONFIG_ERROR",
      statusCode: 500,
    });
  }
}
