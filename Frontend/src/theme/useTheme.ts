import { useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Theme } from './lightTheme';
import { ThemeContext, ThemeContextValue } from './ThemeProvider';

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within an AppThemeProvider');
  }
  return context;
};

/**
 * Helper hook to create and memoize StyleSheet styles based on the active theme.
 * Re-runs only when the active theme mode changes.
 */
export function useThemedStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<unknown>
>(createStyles: (theme: Theme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => createStyles(theme), [theme, createStyles]);
}
