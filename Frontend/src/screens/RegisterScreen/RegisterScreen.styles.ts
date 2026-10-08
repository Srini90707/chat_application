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
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl,
      justifyContent: 'space-between',
    },
    formContainer: {
      flex: 1,
    },
    securityNote: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.lg,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.xl,
      gap: 6,
    },
    footerText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    footerLink: {
      ...theme.typography.subtitle,
      color: theme.colors.primary,
    },
  });

export const styles = createStyles(defaultTheme);
