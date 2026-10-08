import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      ...theme.typography.heading,
      color: theme.colors.textPrimary,
    },
    headerSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerIconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.isDark ? theme.colors.surfaceVariant : theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    newChatHeaderBtn: {
      backgroundColor: theme.colors.primary,
    },
    userBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark ? theme.colors.surfaceVariant : theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.dimensions.borderRadius.full,
      gap: 6,
    },
    userBadgeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.online,
    },
    userBadgeText: {
      ...theme.typography.small,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark ? theme.colors.inputBackground : theme.colors.surfaceVariant,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.dimensions.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      height: 44,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      paddingVertical: 0,
    },
    listContent: {
      flexGrow: 1,
      backgroundColor: theme.colors.surface,
      paddingBottom: 80,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    errorText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.danger,
      textAlign: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.dimensions.borderRadius.md,
    },
    retryButtonText: {
      ...theme.typography.subtitle,
      color: theme.isDark ? theme.colors.black : theme.colors.white,
      fontWeight: '700',
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.primaryDark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
  });

export const styles = createStyles(defaultTheme);
