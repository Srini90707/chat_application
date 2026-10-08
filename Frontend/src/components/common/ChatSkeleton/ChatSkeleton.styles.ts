import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContainer: {
      flex: 1,
      paddingTop: theme.spacing.xs,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.borderLight,
    },
    avatarSkeleton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.surfaceVariant,
      marginRight: theme.spacing.md,
    },
    contentSkeleton: {
      flex: 1,
      justifyContent: 'center',
    },
    topRowSkeleton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs + 2,
    },
    nameSkeleton: {
      width: 120,
      height: 14,
      borderRadius: theme.dimensions.borderRadius.xs,
      backgroundColor: theme.colors.surfaceVariant,
    },
    timeSkeleton: {
      width: 45,
      height: 10,
      borderRadius: theme.dimensions.borderRadius.xs,
      backgroundColor: theme.colors.surfaceVariant,
    },
    messageSkeleton: {
      width: '75%',
      height: 12,
      borderRadius: theme.dimensions.borderRadius.xs,
      backgroundColor: theme.colors.surfaceVariant,
    },
  });

export const styles = createStyles(defaultTheme);
