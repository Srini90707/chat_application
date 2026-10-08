import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
      marginLeft: 2,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      height: theme.dimensions.inputHeight,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.dimensions.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
    },
    inputWrapperFocused: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.isDark ? theme.colors.inputBackground : theme.colors.surface,
    },
    inputWrapperError: {
      borderColor: theme.colors.error,
    },
    inputWrapperDisabled: {
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.border,
      opacity: 0.8,
    },
    input: {
      flex: 1,
      height: '100%',
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      paddingVertical: 0,
    },
    inputDisabled: {
      color: theme.colors.textSecondary,
    },
    leftIconContainer: {
      marginRight: theme.spacing.sm,
    },
    rightIconContainer: {
      marginLeft: theme.spacing.sm,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      marginTop: 4,
      marginLeft: 2,
    },
    helperText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 4,
      marginLeft: 2,
    },
  });

export const styles = createStyles(defaultTheme);
