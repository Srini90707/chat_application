import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.dimensions.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
    },
    currentServerBox: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.dimensions.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    currentServerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    currentServerLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    currentServerBadge: {
      paddingHorizontal: theme.spacing.xs + 2,
      paddingVertical: 2,
      borderRadius: theme.dimensions.borderRadius.xs,
    },
    badgeDefault: {
      backgroundColor: `${theme.colors.textSecondary}20`,
    },
    badgeCustom: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    badgeText: {
      ...theme.typography.caption,
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    badgeTextDefault: {
      color: theme.colors.textSecondary,
    },
    currentServerValue: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.mono?.fontFamily,
      fontSize: 13,
    },
    inputSection: {
      marginBottom: theme.spacing.md,
    },
    warningBanner: {
      backgroundColor: `${theme.colors.warning}18`,
      borderWidth: 1,
      borderColor: `${theme.colors.warning}40`,
      borderRadius: theme.dimensions.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    warningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: 4,
    },
    warningTitle: {
      ...theme.typography.caption,
      color: theme.colors.warning,
      fontWeight: '700',
    },
    warningText: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      lineHeight: 18,
    },
    fixPortButton: {
      alignSelf: 'flex-start',
      marginTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      backgroundColor: theme.colors.warning,
      borderRadius: theme.dimensions.borderRadius.xs,
    },
    fixPortText: {
      ...theme.typography.caption,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    testSection: {
      marginBottom: theme.spacing.lg,
    },
    testRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.dimensions.borderRadius.md,
      paddingVertical: 10,
      paddingHorizontal: theme.spacing.md,
      gap: 6,
    },
    testButtonText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      fontSize: 13,
    },
    statusBadge: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.dimensions.borderRadius.md,
      borderWidth: 1,
      gap: 6,
    },
    statusIdle: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    statusTesting: {
      backgroundColor: `${theme.colors.primary}12`,
      borderColor: `${theme.colors.primary}30`,
    },
    statusSuccess: {
      backgroundColor: `${theme.colors.success}14`,
      borderColor: `${theme.colors.success}35`,
    },
    statusFailed: {
      backgroundColor: `${theme.colors.error}14`,
      borderColor: `${theme.colors.error}35`,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      ...theme.typography.caption,
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
    },
    actions: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
  });

export const styles = createStyles(defaultTheme);
