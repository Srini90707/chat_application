/**
 * Centralized Application Logger
 * Strips sensitive credentials, tokens, and personally identifiable information.
 */


const SENSITIVE_KEYS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'otp',
  'authorization',
  'secret',
  'pan',
  'aadhaar',
  'card',
  'cvv',
];

function sanitize(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEYS.some((sensitive) =>
      key.toLowerCase().includes(sensitive.toLowerCase())
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

class Logger {
  private isDev = __DEV__;

  debug(message: string, context?: unknown): void {
    if (this.isDev) {
      console.log(`[DEBUG] ${message}`, context ? sanitize(context) : '');
    }
  }

  info(message: string, context?: unknown): void {
    console.info(`[INFO] ${message}`, context ? sanitize(context) : '');
  }

  warn(message: string, context?: unknown): void {
    console.warn(`[WARN] ${message}`, context ? sanitize(context) : '');
  }

  error(message: string, error?: unknown): void {
    const sanitizedError =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : sanitize(error);

    console.error(`[ERROR] ${message}`, sanitizedError || '');
  }
}

export const logger = new Logger();
