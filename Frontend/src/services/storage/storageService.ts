import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types/user';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'chat_auth_access_token',
  REFRESH_TOKEN: 'chat_auth_refresh_token',
  USER_DATA: 'chat_auth_user_data',
  THEME_MODE: 'chat_app_theme_mode',
  SERVER_URL: 'chat_app_server_url',
};

// In-memory fallback if platform storage is unavailable
const memoryStorage: Record<string, string> = {};

class StorageService {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        } else {
          memoryStorage[key] = value;
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {
      memoryStorage[key] = value;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryStorage[key] || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return memoryStorage[key] || null;
    }
  }

  async deleteItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        delete memoryStorage[key];
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch {
      delete memoryStorage[key];
    }
  }

  /**
   * Persists an authenticated session
   */
  async saveAuthSession(token: string, user: User, refreshToken?: string): Promise<void> {
    await Promise.all([
      this.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
      this.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      refreshToken ? this.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken) : Promise.resolve(),
    ]);
  }

  /**
   * Updates only tokens during JWT token rotation
   */
  async updateTokens(token: string, refreshToken?: string): Promise<void> {
    await Promise.all([
      this.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
      refreshToken ? this.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken) : Promise.resolve(),
    ]);
  }

  /**
   * Retrieves the stored auth session on app startup
   */
  async getAuthSession(): Promise<{ token: string; user: User; refreshToken?: string } | null> {
    try {
      const [token, userJson, refreshToken] = await Promise.all([
        this.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        this.getItem(STORAGE_KEYS.USER_DATA),
        this.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      if (!token || !userJson) {
        return null;
      }

      const user = JSON.parse(userJson) as User;
      return {
        token,
        user,
        refreshToken: refreshToken || undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Clears the stored session upon logout
   */
  async clearAuthSession(): Promise<void> {
    await Promise.all([
      this.deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
      this.deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
      this.deleteItem(STORAGE_KEYS.USER_DATA),
    ]);
  }

  /**
   * Persists the user's manual theme mode ('light' | 'dark')
   */
  async saveThemeMode(mode: 'light' | 'dark'): Promise<void> {
    await this.setItem(STORAGE_KEYS.THEME_MODE, mode);
  }

  /**
   * Retrieves the saved theme mode or null if none is stored
   */
  async getThemeMode(): Promise<'light' | 'dark' | null> {
    try {
      const stored = await this.getItem(STORAGE_KEYS.THEME_MODE);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Persists custom backend server URL
   */
  async saveServerUrl(url: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.SERVER_URL, url);
  }

  /**
   * Retrieves the saved custom backend server URL
   */
  async getServerUrl(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.SERVER_URL);
  }

  /**
   * Removes custom backend server URL to restore default
   */
  async clearServerUrl(): Promise<void> {
    await this.deleteItem(STORAGE_KEYS.SERVER_URL);
  }
}

export const storageService = new StorageService();
