import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    demoHint: {
      ...theme.typography.small,
      color: theme.colors.primary,
      backgroundColor: theme.isDark ? `${theme.colors.primary}20` : theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.dimensions.borderRadius.sm,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
    },
    nameAvatarWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.lg,
    },
    nameInputContainer: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    label: {
      ...theme.typography.caption,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    textInput: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      backgroundColor: theme.isDark ? theme.colors.inputBackground : theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.dimensions.borderRadius.md,
      height: 52,
      paddingHorizontal: theme.spacing.md,
    },
    textInputFocused: {
      borderColor: theme.colors.primary,
    },
    textInputError: {
      borderColor: theme.colors.danger,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.xxl,
      gap: 6,
    },
    resendPrompt: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    timerBlock: {
      alignItems: 'center',
      gap: 4,
    },
    resendDisabledText: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
      fontWeight: '600',
    },
    countdownTimer: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    resendButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
    },
    resendText: {
      ...theme.typography.subtitle,
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });

export const styles = createStyles(defaultTheme);
