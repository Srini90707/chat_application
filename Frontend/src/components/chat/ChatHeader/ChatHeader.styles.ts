import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: theme.dimensions.headerHeight,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    backButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.xs,
    },
    profileRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    nameBlock: {
      flex: 1,
      justifyContent: 'center',
    },
    name: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    moreButton: {
      padding: theme.spacing.sm,
    },
  });

export const styles = createStyles(defaultTheme);
