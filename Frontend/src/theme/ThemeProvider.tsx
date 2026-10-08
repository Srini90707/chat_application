import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { storageService } from '@/services/storage/storageService';
import { darkTheme } from './darkTheme';
import { lightTheme, type Theme } from './lightTheme';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  themeMode: 'light',
  isDark: false,
  setThemeMode: async () => {},
  toggleTheme: async () => {},
});

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Always default to 'light' immediately so there is no flickering/blank state
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  // Load saved preference on startup once
  useEffect(() => {
    let isMounted = true;
    const loadSavedTheme = async () => {
      try {
        const savedMode = await storageService.getThemeMode();
        if (isMounted && savedMode && (savedMode === 'light' || savedMode === 'dark')) {
          setThemeModeState(savedMode);
        }
      } catch {
        // Fallback to light
      }
    };

    loadSavedTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await storageService.saveThemeMode(mode);
    } catch {
      // Storage error handled silently
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    await setThemeMode(nextMode);
  }, [themeMode, setThemeMode]);

  const activeTheme = useMemo(() => {
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode]);

  const contextValue = useMemo<ThemeContextValue>(() => {
    return {
      theme: activeTheme,
      themeMode,
      isDark: themeMode === 'dark',
      setThemeMode,
      toggleTheme,
    };
  }, [activeTheme, themeMode, setThemeMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
