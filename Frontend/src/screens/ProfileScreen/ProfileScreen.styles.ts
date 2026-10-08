import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
    },
    heroSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    heroAvatar: {
      marginBottom: theme.spacing.md,
    },
    heroName: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      textAlign: 'center',
    },
    heroPhone: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    onlineBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      backgroundColor: `${theme.colors.online}15`,
      borderRadius: theme.dimensions.borderRadius.full,
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.online,
    },
    onlineText: {
      ...theme.typography.caption,
      color: theme.colors.online,
      fontWeight: '600',
    },
    section: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.dimensions.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    logoutSection: {
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    versionText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    // Theme selection modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.dimensions.borderRadius.xl,
      padding: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    modalHeader: {
      marginBottom: theme.spacing.lg,
    },
    modalTitle: {
      ...theme.typography.title,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    modalSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    themeOptionList: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.dimensions.borderRadius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.isDark ? theme.colors.surfaceVariant : theme.colors.background,
    },
    themeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.isDark ? `${theme.colors.primary}18` : theme.colors.primaryLight,
    },
    themeOptionEmoji: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    themeOptionContent: {
      flex: 1,
    },
    themeOptionLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    themeOptionDesc: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    radioCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioCircleSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
  });

export const styles = createStyles(defaultTheme);
