import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    lastItem: {
      borderBottomWidth: 0,
    },
    label: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    value: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
  });

export const styles = createStyles(defaultTheme);
