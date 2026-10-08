import { storageService } from '@/services/storage/storageService';
import { logger } from '@/utils/logger';

export const DEFAULT_BACKEND_HOST = '192.168.88.8';
export const DEFAULT_BACKEND_PORT = 8085;
export const DEFAULT_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_BACKEND_HOST}:${DEFAULT_BACKEND_PORT}`;
export const SERVER_STORAGE_KEY = 'chat_app_server_url';
export const EXPO_METRO_PORT = 8081;

export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
  isMetroPortWarning?: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  statusCode?: number;
}

type ServerUrlListener = (newUrl: string) => void;

class ServerConfigService {
  private activeBaseUrl: string = DEFAULT_BASE_URL;
  private isInitialized = false;
  private listeners: Set<ServerUrlListener> = new Set();

  /**
   * Initializes the service by restoring any previously stored custom server URL
   */
  async init(): Promise<string> {
    if (this.isInitialized) {
      return this.activeBaseUrl;
    }

    try {
      const storedUrl = await storageService.getServerUrl();
      if (storedUrl) {
        const validation = this.validateUrl(storedUrl);
        if (validation.isValid && validation.normalizedUrl) {
          this.activeBaseUrl = validation.normalizedUrl;
          logger.info(`Restored custom server URL: ${this.activeBaseUrl}`);
        } else {
          // Stored URL was corrupted/invalid, clear it
          await storageService.clearServerUrl();
          this.activeBaseUrl = DEFAULT_BASE_URL;
        }
      } else {
        this.activeBaseUrl = DEFAULT_BASE_URL;
      }
    } catch (err) {
      logger.error('Failed to restore server URL from storage, using default', err);
      this.activeBaseUrl = DEFAULT_BASE_URL;
    } finally {
      this.isInitialized = true;
      this.notifyListeners(this.activeBaseUrl);
    }

    return this.activeBaseUrl;
  }

  /**
   * Returns the currently active Base URL
   */
  getBaseUrl(): string {
    return this.activeBaseUrl;
  }

  /**
   * Returns the hardcoded/environment default Base URL
   */
  getDefaultBaseUrl(): string {
    return DEFAULT_BASE_URL;
  }

  /**
   * Returns the WebSocket URL corresponding to the active Base URL
   */
  getWsUrl(): string {
    const clean = this.activeBaseUrl.replace(/\/+$/, '');
    return clean.replace(/^http/, 'ws') + '/ws';
  }

  /**
   * Returns whether the active URL is a custom configured URL
   */
  isCustomUrl(): boolean {
    return this.activeBaseUrl !== DEFAULT_BASE_URL;
  }

  /**
   * Validates and normalizes a candidate server URL
   */
  validateUrl(rawUrl?: string): UrlValidationResult {
    if (!rawUrl || !rawUrl.trim()) {
      return { isValid: false, error: 'Server URL cannot be empty.' };
    }

    const trimmed = rawUrl.trim();

    // Check unsupported protocols
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('file:') ||
      lower.startsWith('javascript:') ||
      lower.startsWith('ftp:') ||
      lower.startsWith('data:')
    ) {
      return { isValid: false, error: 'Unsupported protocol. Only http:// and https:// are supported.' };
    }

    // Must start with http:// or https://
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
      return {
        isValid: false,
        error: 'URL must begin with http:// or https:// (e.g. http://192.168.1.100:8085)',
      };
    }

    try {
      const parsed = new URL(trimmed);

      // Verify protocol
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isValid: false, error: 'Protocol must be either HTTP or HTTPS.' };
      }

      // Verify hostname
      if (!parsed.hostname || parsed.hostname.includes(' ')) {
        return { isValid: false, error: 'Invalid server hostname or IP address.' };
      }

      // Check port safety
      let isMetroPortWarning = false;
      if (parsed.port === String(EXPO_METRO_PORT)) {
        isMetroPortWarning = true;
      }

      // Normalize: remove trailing slash and path extras
      const portPart = parsed.port ? `:${parsed.port}` : '';
      const normalized = `${parsed.protocol}//${parsed.hostname}${portPart}`;

      return {
        isValid: true,
        normalizedUrl: normalized,
        isMetroPortWarning,
      };
    } catch {
      return { isValid: false, error: 'Malformed URL. Please check the address format.' };
    }
  }

  /**
   * Tests reachability of candidate server URL
   * Non-destructive: Does NOT automatically save or persist the URL
   */
  async testConnection(targetUrl: string, timeoutMs: number = 4500): Promise<ConnectionTestResult> {
    const validation = this.validateUrl(targetUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      return {
        success: false,
        message: validation.error || 'Invalid server URL format.',
      };
    }

    const baseUrl = validation.normalizedUrl;
    logger.info(`Testing connection to server: ${baseUrl}`);

    // Candidate health check endpoints (Actuator health first, then doc/auth fallbacks)
    const probeEndpoints = [
      '/actuator/health',
      '/actuator/info',
      '/v3/api-docs',
      '/otp/generate',
    ];

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let reached = false;
      let lastStatus = 0;

      for (const endpoint of probeEndpoints) {
        try {
          const res = await fetch(`${baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              Accept: 'application/json, text/plain, */*',
            },
            signal: controller.signal,
          });

          lastStatus = res.status;

          // Any server response (200, 204, 400, 401, 403, 405) proves the host is reached & responding!
          if (res.status === 200 || res.status === 204) {
            reached = true;
            break;
          } else if (res.status === 401 || res.status === 403 || res.status === 405 || res.status === 400) {
            // Spring Security blocked or endpoint required POST; host is definitely UP and responding
            reached = true;
            break;
          }
        } catch {
          // Try next probe endpoint if network not completely dead
        }
      }

      clearTimeout(timeoutTimer);

      if (reached) {
        return {
          success: true,
          message: 'Server reachable and responding',
          statusCode: lastStatus,
        };
      }

      return {
        success: false,
        message: 'Unable to connect to server. Check IP, port, Wi-Fi or backend status.',
        statusCode: lastStatus,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutTimer);

      if (err instanceof Error && err.name === 'AbortError') {
        return {
          success: false,
          message: 'Connection timed out. Server took too long to respond.',
        };
      }

      return {
        success: false,
        message: 'Network request failed. Device and server may not be on the same network.',
      };
    }
  }

  /**
   * Persists and activates a custom server URL
   */
  async saveServerUrl(newUrl: string): Promise<UrlValidationResult> {
    const validation = this.validateUrl(newUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      return validation;
    }

    const normalized = validation.normalizedUrl;

    try {
      await storageService.saveServerUrl(normalized);
      this.activeBaseUrl = normalized;
      logger.info(`Active server URL updated and persisted: ${normalized}`);
      this.notifyListeners(normalized);
      return { isValid: true, normalizedUrl: normalized };
    } catch (err) {
      logger.error('Failed to persist server URL', err);
      return { isValid: false, error: 'Failed to save server URL to storage.' };
    }
  }

  /**
   * Resets server configuration back to the application default
   */
  async resetToDefault(): Promise<string> {
    try {
      await storageService.clearServerUrl();
      this.activeBaseUrl = DEFAULT_BASE_URL;
      logger.info(`Reset server URL to default: ${DEFAULT_BASE_URL}`);
      this.notifyListeners(DEFAULT_BASE_URL);
      return DEFAULT_BASE_URL;
    } catch (err) {
      logger.error('Failed to clear server URL from storage', err);
      this.activeBaseUrl = DEFAULT_BASE_URL;
      this.notifyListeners(DEFAULT_BASE_URL);
      return DEFAULT_BASE_URL;
    }
  }

  /**
   * Subscribes to server URL change events
   */
  subscribe(listener: ServerUrlListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(url: string): void {
    this.listeners.forEach((listener) => {
      try {
        listener(url);
      } catch (e) {
        logger.error('Error executing server URL listener', e);
      }
    });
  }
}

export const serverConfigService = new ServerConfigService();
