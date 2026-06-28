import { AppError } from "./AppError";

export class WebSocketError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: "WS_ERROR",
      statusCode: 500,
      details,
    });
  }
}
