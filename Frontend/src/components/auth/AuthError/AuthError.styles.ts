import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: `${theme.colors.error}14`,
      borderWidth: 1,
      borderColor: `${theme.colors.error}35`,
      borderRadius: theme.dimensions.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      marginBottom: theme.spacing.lg,
    },
    messageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    text: {
      ...theme.typography.caption,
      color: theme.colors.error,
      flex: 1,
      lineHeight: 18,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginTop: theme.spacing.xs + 2,
      paddingTop: theme.spacing.xs,
      gap: 6,
    },
    actionText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });

export const styles = createStyles(defaultTheme);
