import { storageService } from '@/services/storage/storageService';
import { logger } from '@/utils/logger';

export const DEFAULT_BACKEND_HOST = '192.168.88.6';
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

    let trimmed = rawUrl.trim();

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

    // Auto-prepend protocol if missing
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
      // If it looks like a cloud tunnel (trycloudflare, ngrok, loca.lt) or standard HTTPS domain
      if (
        lower.includes('trycloudflare.com') ||
        lower.includes('ngrok') ||
        lower.includes('loca.lt')
      ) {
        trimmed = `https://${trimmed}`;
      } else {
        trimmed = `http://${trimmed}`;
      }
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

      // Auto-attach backend port 8085 if user provided raw IP/localhost without port
      let port = parsed.port;
      const isIpOrLocalhost =
        /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname) ||
        parsed.hostname === 'localhost' ||
        parsed.hostname === '10.0.2.2';

      if (!port && isIpOrLocalhost && parsed.protocol === 'http:') {
        port = String(DEFAULT_BACKEND_PORT);
      }

      // Check port safety (Metro port 8081 warning)
      let isMetroPortWarning = false;
      if (port === String(EXPO_METRO_PORT)) {
        isMetroPortWarning = true;
      }

      // Normalize: remove trailing slash and path extras
      const portPart = port ? `:${port}` : '';
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
  async testConnection(targetUrl: string, probeTimeoutMs: number = 3500): Promise<ConnectionTestResult> {
    const validation = this.validateUrl(targetUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      return {
        success: false,
        message: validation.error || 'Invalid server URL format.',
      };
    }

    const baseUrl = validation.normalizedUrl;
    logger.info(`Testing connection to server: ${baseUrl}`);

    // Candidate health check endpoints in order of lightness
    const probeEndpoints = [
      '/health',
      '/actuator/health',
      '/v3/api-docs',
      '/user/all',
      '/',
    ];

    let reached = false;
    let lastStatus = 0;
    let hadTimeout = false;

    for (const endpoint of probeEndpoints) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), probeTimeoutMs);

      try {
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json, text/plain, */*',
          },
          signal: controller.signal,
        });

        clearTimeout(timer);
        lastStatus = res.status;

        // Any HTTP response (2xx, 3xx, 4xx, 5xx) confirms the server is reachable and responding
        if (res.status >= 200 && res.status < 600) {
          reached = true;
          break;
        }
      } catch (err: unknown) {
        clearTimeout(timer);
        if (err instanceof Error && err.name === 'AbortError') {
          hadTimeout = true;
        }
      }
    }

    if (reached) {
      return {
        success: true,
        message: 'Server reachable and responding',
        statusCode: lastStatus,
      };
    }

    if (hadTimeout) {
      return {
        success: false,
        message: 'Connection timed out. Check Wi-Fi and server status.',
      };
    }

    return {
      success: false,
      message: 'Network request failed. Device and PC must be on the same Wi-Fi.',
    };
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
