import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
    },
    bubble: {
      backgroundColor: theme.colors.incomingMessage,
      borderRadius: theme.dimensions.borderRadius.bubble,
      borderBottomLeftRadius: theme.dimensions.borderRadius.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: theme.colors.textSecondary,
    },
    label: {
      ...theme.typography.small,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
  });

export const styles = createStyles(defaultTheme);
