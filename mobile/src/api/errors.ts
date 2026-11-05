// manzu-b error bodies are inconsistent (docs/OPEN_QUESTIONS F6). Seen shapes:
//   { error: 'NO_TOKEN' | 'TOKEN_EXPIRED' | ..., message }            (middleware/auth.js)
//   { error: 'AUTH_RATE_LIMIT_EXCEEDED', message, retryAfter }        (config/rate-limits.js)
//   { message: 'Validation error', errors: ZodIssue[] }               (routes/auth.js)
//   { message, error: <same message> }                                (most route catch blocks)
//   { error: '<message>' } / { errors: [...] }                        (Joi validators)
export type ApiErrorCode =
  | 'NO_TOKEN'
  | 'INVALID_FORMAT'
  | 'TOKEN_EXPIRED'
  | 'INVALID_TOKEN'
  | 'FORBIDDEN'
  | 'AUTH_RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'NOT_CONFIGURED'
  | 'FORBIDDEN_ENDPOINT'
  | 'HTTP_ERROR'
  | (string & {});

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: unknown;
  readonly retryAfter?: string;
  /** Raw `error` string from `{ message: 'Server error', error: err.message }` bodies (not shown as-is). */
  readonly serverReason?: string;

  constructor(message: string, status: number, code: ApiErrorCode, details?: unknown, retryAfter?: string, serverReason?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
    this.serverReason = serverReason;
  }

  get isNetwork(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}

const CODE_PATTERN = /^[A-Z][A-Z0-9_]+$/;

function defaultMessage(status: number): string {
  if (status === 400) return 'Please check the details and try again.';
  if (status === 401) return 'Authentication failed. Please log in again.';
  if (status === 403) return "You don't have permission to do this.";
  if (status === 404) return 'Not found.';
  if (status === 409) return 'This conflicts with existing data.';
  if (status === 429) return 'Too many requests. Please try again later.';
  if (status >= 500) return 'Something went wrong on the server. Please try again.';
  return 'Request failed. Please try again.';
}

function firstIssueMessage(errors: unknown): string | undefined {
  if (!Array.isArray(errors) || errors.length === 0) return undefined;
  const first = errors[0] as unknown;
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'message' in first && typeof first.message === 'string') {
    return first.message;
  }
  return undefined;
}

export function normalizeErrorBody(status: number, body: unknown): ApiError {
  if (!body || typeof body !== 'object') {
    return new ApiError(defaultMessage(status), status, 'HTTP_ERROR');
  }
  const b = body as Record<string, unknown>;
  const errorField = typeof b.error === 'string' ? b.error : undefined;
  const code = errorField && CODE_PATTERN.test(errorField) ? errorField : 'HTTP_ERROR';
  const rawMessage = typeof b.message === 'string' ? b.message : undefined;

  let message = rawMessage;
  if (rawMessage === 'Validation error') message = firstIssueMessage(b.errors) ?? rawMessage;
  if (!message && errorField && code === 'HTTP_ERROR') message = errorField;
  if (!message) message = firstIssueMessage(b.errors);
  if (!message || (status >= 500 && /prisma|invalid `|stack|at \w+ \(/i.test(message))) {
    message = defaultMessage(status);
  }

  const retryAfter = typeof b.retryAfter === 'string' ? b.retryAfter : undefined;
  const serverReason = errorField && code === 'HTTP_ERROR' && errorField !== message ? errorField : undefined;
  return new ApiError(message, status, code, b.errors ?? b.details, retryAfter, serverReason);
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) return new ApiError(err.message, 0, 'HTTP_ERROR');
  return new ApiError('Something went wrong. Please try again.', 0, 'HTTP_ERROR');
}

export function errorMessage(err: unknown): string {
  return toApiError(err).message;
}
