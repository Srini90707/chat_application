import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.caption,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark ? theme.colors.inputBackground : theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.dimensions.borderRadius.md,
      height: 52,
      paddingHorizontal: theme.spacing.md,
    },
    inputRowFocused: {
      borderColor: theme.colors.primary,
    },
    inputRowError: {
      borderColor: theme.colors.danger,
    },
    prefixContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: theme.spacing.sm,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      marginRight: theme.spacing.md,
      gap: 4,
    },
    flag: {
      fontSize: 18,
    },
    prefixText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    input: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      fontSize: 16,
      letterSpacing: 1,
      paddingVertical: 0,
    },
    errorText: {
      ...theme.typography.small,
      color: theme.colors.danger,
      marginTop: theme.spacing.xs,
    },
  });

export const styles = createStyles(defaultTheme);
