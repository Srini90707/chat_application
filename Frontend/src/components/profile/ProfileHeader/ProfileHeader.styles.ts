import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: theme.spacing.xs,
      width: 40,
      alignItems: 'flex-start',
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    rightPlaceholder: {
      width: 40,
    },
  });

export const styles = createStyles(defaultTheme);
