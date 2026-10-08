import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    badge: {
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    textRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    dot: {
      marginRight: 2,
    },
    label: {
      ...theme.typography.small,
      color: theme.colors.textSecondary,
    },
  });

export const styles = createStyles(defaultTheme);
