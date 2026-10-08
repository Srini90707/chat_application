import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
      width: '100%',
    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.md,
      padding: theme.spacing.xs,
    },
    logoBadge: {
      marginBottom: theme.spacing.lg,
      width: 76,
      height: 76,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 16,
      elevation: 6,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: theme.isDark ? theme.colors.border : theme.colors.primaryLight,
    },
    logoImage: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    iconWrapper: {
      width: 56,
      height: 56,
      borderRadius: theme.dimensions.borderRadius.full,
      backgroundColor: theme.isDark ? theme.colors.surfaceVariant : theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.heading,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.lg,
      lineHeight: 20,
    },
  });

export const styles = createStyles(defaultTheme);
