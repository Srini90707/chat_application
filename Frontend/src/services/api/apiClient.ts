import { API_CONFIG, AUTH_ENDPOINTS } from '@/config/api';
import { serverConfigService } from '@/services/config/serverConfigService';
import { storageService } from '@/services/storage/storageService';
import { ApiError } from './apiError';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
  timeoutMs?: number;
  _retry?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<string | null> | null = null;
  private onSessionExpiredCallback?: () => void;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || serverConfigService.getBaseUrl();

    // Dynamically update baseUrl whenever server configuration changes
    serverConfigService.subscribe((newUrl) => {
      this.baseUrl = newUrl;
    });
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setOnSessionExpired(callback: () => void): void {
    this.onSessionExpiredCallback = callback;
  }

  private async rotateTokens(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const session = await storageService.getAuthSession();
        if (!session?.refreshToken) {
          await storageService.clearAuthSession();
          this.onSessionExpiredCallback?.();
          return null;
        }

        const refreshResponse = await fetch(`${this.baseUrl}${AUTH_ENDPOINTS.JWT_REFRESH}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken: session.refreshToken }),
        });

        if (!refreshResponse.ok) {
          await storageService.clearAuthSession();
          this.onSessionExpiredCallback?.();
          return null;
        }

        const data = await refreshResponse.json();
        if (data?.accessToken) {
          await storageService.updateTokens(data.accessToken, data.refreshToken);
          return data.accessToken as string;
        }

        await storageService.clearAuthSession();
        this.onSessionExpiredCallback?.();
        return null;
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      body,
      params,
      requiresAuth = true,
      timeoutMs = API_CONFIG.TIMEOUT_MS,
      headers: customHeaders,
      _retry = false,
      ...fetchOptions
    } = options;

    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(customHeaders as Record<string, string>),
    };

    if (requiresAuth) {
      const session = await storageService.getAuthSession();
      if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (
          response.status === 401 &&
          requiresAuth &&
          !_retry &&
          endpoint !== AUTH_ENDPOINTS.JWT_REFRESH
        ) {
          const newToken = await this.rotateTokens();
          if (newToken) {
            return this.request<T>(endpoint, {
              ...options,
              _retry: true,
            });
          }
        }

        const errorMsg =
          data?.message || `Request failed with status ${response.status}`;
        throw new ApiError(errorMsg, response.status, data?.code);
      }

      return data as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (ApiError.isApiError(err)) {
        throw err;
      }

      if (err instanceof Error && err.name === 'AbortError') {
        throw new ApiError(
          'Network request timed out. Please check your connection and try again.',
          408,
          'TIMEOUT'
        );
      }

      throw new ApiError(
        'Unable to connect to the server. Please check your internet connection.',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
