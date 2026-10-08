import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.dimensions.borderRadius.md,
      gap: theme.spacing.sm,
    },
    // Sizes
    small: {
      height: 36,
      paddingHorizontal: theme.spacing.md,
    },
    medium: {
      height: 48,
      paddingHorizontal: theme.spacing.lg,
    },
    large: {
      height: theme.dimensions.buttonHeight,
      paddingHorizontal: theme.spacing.xl,
    },
    // Variants
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    danger: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.error,
    },
    text: {
      backgroundColor: 'transparent',
      height: 'auto',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    disabled: {
      opacity: 0.5,
    },
    // Typography
    textLabel: {
      ...theme.typography.button,
      textAlign: 'center',
    },
    primaryText: {
      color: theme.colors.white,
      fontWeight: '700',
    },
    secondaryText: {
      color: theme.colors.textPrimary,
    },
    outlineText: {
      color: theme.colors.textPrimary,
    },
    dangerText: {
      color: theme.colors.error,
    },
    textVariantText: {
      color: theme.colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    smallText: {
      fontSize: 13,
    },
  });

export const styles = createStyles(defaultTheme);
