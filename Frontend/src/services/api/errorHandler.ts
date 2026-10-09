import { ApiError } from './apiError';

/**
 * Converts any caught error into a clear, user-friendly message
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred. Please try again.'
): string {
  if (ApiError.isApiError(error)) {
    if (error.statusCode === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (error.statusCode === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.statusCode === 404) {
      return 'Requested resource not found.';
    }
    if (error.statusCode === 408 || error.code === 'TIMEOUT') {
      return 'Request timed out. Please check your connection and retry.';
    }
    if (error.statusCode && error.statusCode >= 500) {
      return 'Server is temporarily unavailable. Please try again later.';
    }
    if (error.code === 'NETWORK_ERROR') {
      return error.message || 'Unable to connect to the server. Please check your internet connection.';
    }
    return error.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
}

/**
 * Detects whether an error is caused by network failure, unreachable server,
 * timeout, or server connectivity issues (excluding business/auth errors).
 */
export function isNetworkOrServerConnectivityError(error: unknown): boolean {
  if (ApiError.isApiError(error)) {
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      error.statusCode === 0 ||
      error.statusCode === 408 ||
      (typeof error.statusCode === 'number' && error.statusCode >= 502 && error.statusCode <= 504)
    );
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('network request failed') ||
      msg.includes('network error') ||
      msg.includes('failed to connect') ||
      msg.includes('connection refused') ||
      msg.includes('timed out') ||
      msg.includes('timeout') ||
      msg.includes('unreachable')
    );
  }

  return false;
}
