import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details,
    });
  }
}
