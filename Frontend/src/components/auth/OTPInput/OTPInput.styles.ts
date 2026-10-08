import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    inputWrapper: {
      position: 'relative',
      width: '100%',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    hiddenInput: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.01,
      color: 'transparent',
      zIndex: 10,
    },
    box: {
      flex: 1,
      maxWidth: 52,
      height: 60,
      borderRadius: theme.dimensions.borderRadius.md,
      backgroundColor: theme.isDark ? theme.colors.inputBackground : theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxFocused: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.isDark ? `${theme.colors.primary}20` : theme.colors.primaryLight,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    boxFilled: {
      borderColor: theme.colors.primary,
    },
    boxError: {
      borderColor: theme.colors.danger,
      backgroundColor: `${theme.colors.danger}15`,
    },
    digitText: {
      ...theme.typography.title,
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    cursor: {
      width: 2,
      height: 24,
      backgroundColor: theme.colors.primary,
      borderRadius: 1,
    },
  });

export const styles = createStyles(defaultTheme);
