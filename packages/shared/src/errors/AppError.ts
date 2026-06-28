export interface ErrorMetadata {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: unknown;
}

export class AppError extends Error {
  public readonly code: string;

  public readonly statusCode: number;

  public readonly details?: unknown;

  constructor(message: string, metadata: ErrorMetadata) {
    super(message);

    this.name = this.constructor.name;

    this.code = metadata.code;

    this.statusCode = metadata.statusCode;

    this.details = metadata.details;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      details: this.details,
    };
  }
}
