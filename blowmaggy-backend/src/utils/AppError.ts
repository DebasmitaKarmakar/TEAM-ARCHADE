export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = codeFor(status),
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

function codeFor(status: number) {
  switch (status) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 422: return 'UNPROCESSABLE';
    case 429: return 'TOO_MANY_REQUESTS';
    case 502: return 'BAD_GATEWAY';
    default: return 'ERROR';
  }
}

export const notFound = (what = 'Resource') => new AppError(404, `${what} not found`);
