import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      marginVertical: 3,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      width: '100%',
    },
    rowOutgoing: {
      justifyContent: 'flex-end',
    },
    rowIncoming: {
      justifyContent: 'flex-start',
    },
    bubble: {
      maxWidth: `${Math.round(theme.dimensions.maxBubbleWidthPercentage * 100)}%`,
      paddingHorizontal: theme.spacing.md + 2,
      paddingVertical: theme.spacing.sm + 2,
      borderRadius: theme.dimensions.borderRadius.bubble,
    },
    bubbleOutgoing: {
      backgroundColor: theme.colors.outgoingMessage,
      borderBottomRightRadius: theme.dimensions.borderRadius.xs,
    },
    bubbleIncoming: {
      backgroundColor: theme.colors.incomingMessage,
      borderBottomLeftRadius: theme.dimensions.borderRadius.xs,
    },
    messageText: {
      ...theme.typography.body,
      letterSpacing: -0.1,
    },
    messageTextOutgoing: {
      color: theme.colors.outgoingMessageText,
    },
    messageTextIncoming: {
      color: theme.colors.incomingMessageText,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      alignSelf: 'flex-end',
      marginTop: theme.spacing.xs,
      gap: 4,
    },
    timestampText: {
      ...theme.typography.small,
    },
    timestampOutgoing: {
      color: theme.colors.timestampOutgoing,
    },
    timestampIncoming: {
      color: theme.colors.timestampIncoming,
    },
    statusContainer: {
      marginLeft: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      width: 220,
      height: 200,
      borderRadius: theme.dimensions.borderRadius.sm,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: 4,
    },
    messageImage: {
      width: '100%',
      height: '100%',
    },
    docContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
      borderRadius: theme.dimensions.borderRadius.sm,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      marginBottom: 4,
      minWidth: 200,
      maxWidth: 240,
    },
    docIconBox: {
      width: 42,
      height: 42,
      borderRadius: theme.dimensions.borderRadius.xs,
      backgroundColor: '#E53935',
      alignItems: 'center',
      justifyContent: 'center',
    },
    docInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    docName: {
      ...theme.typography.body,
      fontSize: 13,
      fontWeight: '600',
    },
    docNameOutgoing: {
      color: theme.colors.outgoingMessageText,
    },
    docNameIncoming: {
      color: theme.colors.incomingMessageText,
    },
    docMeta: {
      ...theme.typography.small,
      fontSize: 11,
      marginTop: 2,
    },
    docMetaOutgoing: {
      color: theme.colors.timestampOutgoing,
    },
    docMetaIncoming: {
      color: theme.colors.timestampIncoming,
    },
    captionText: {
      marginTop: 4,
    },
  });

export const styles = createStyles(defaultTheme);
