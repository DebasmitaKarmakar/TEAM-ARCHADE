/**
 * Application error with HTTP status code.
 * Thrown in services/controllers, caught by the error middleware.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? this.deriveCode(statusCode);
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  private deriveCode(status: number): string {
    switch (status) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'VALIDATION_ERROR';
      case 429: return 'TOO_MANY_REQUESTS';
      default:  return 'INTERNAL_ERROR';
    }
  }
}
