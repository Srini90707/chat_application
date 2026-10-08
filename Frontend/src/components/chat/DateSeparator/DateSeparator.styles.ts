import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.md,
    },
    pill: {
      backgroundColor: theme.colors.dateSeparatorBg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 1,
      borderRadius: theme.dimensions.borderRadius.md,
    },
    text: {
      ...theme.typography.small,
      color: theme.colors.dateSeparatorText,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
  });

export const styles = createStyles(defaultTheme);
