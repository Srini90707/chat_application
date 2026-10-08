/**
 * Centralized API Error class with HTTP status code and error categorization
 */
export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static isApiError(err: unknown): err is ApiError {
    return err instanceof ApiError;
  }
}
