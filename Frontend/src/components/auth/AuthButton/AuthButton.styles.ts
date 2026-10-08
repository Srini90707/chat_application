import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.primary,
      height: 52,
      borderRadius: theme.dimensions.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.border,
    },
    text: {
      ...theme.typography.subtitle,
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    textDisabled: {
      color: theme.colors.textMuted,
    },
  });

export const styles = createStyles(defaultTheme);
