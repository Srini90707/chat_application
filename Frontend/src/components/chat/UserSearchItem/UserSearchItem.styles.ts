import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.dimensions.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
      alignItems: 'center',
    },
    avatarWrapper: {
      marginBottom: theme.spacing.md,
    },
    userInfo: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    name: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
      marginBottom: 4,
      textAlign: 'center',
    },
    phone: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    about: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.dimensions.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      minHeight: 48,
    },
    actionButtonDisabled: {
      opacity: 0.7,
    },
    actionButtonText: {
      ...theme.typography.button,
      color: theme.colors.white,
      fontWeight: '700',
    },
  });

export const styles = createStyles(defaultTheme);
