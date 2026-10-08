import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      minHeight: 76,
    },
    avatarWrapper: {
      marginRight: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      position: 'relative',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    name: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
      flex: 1,
      marginRight: theme.spacing.sm,
      fontWeight: '600',
    },
    nameUnread: {
      fontWeight: '700',
    },
    time: {
      ...theme.typography.small,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    timeUnread: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    lastMessage: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    lastMessageUnread: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    typingText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontStyle: 'italic',
    },
    unreadBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.badge,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unreadText: {
      color: theme.colors.badgeText,
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 14,
    },
    divider: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: -theme.spacing.lg,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  });

export const styles = createStyles(defaultTheme);
