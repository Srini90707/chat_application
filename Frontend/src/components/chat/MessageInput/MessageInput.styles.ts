import { Platform, StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.sm,
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.inputBackground,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 22,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: Platform.OS === 'ios' ? 6 : 2,
      minHeight: theme.dimensions.inputMinHeight,
      maxHeight: theme.dimensions.inputMaxHeight,
    },
    textInput: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      maxHeight: 100,
      paddingRight: theme.spacing.xs,
      paddingVertical: 4,
    },
    emojiButton: {
      padding: theme.spacing.xs,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    sendButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    sendButtonDisabled: {
      backgroundColor: theme.isDark ? theme.colors.surfaceVariant : theme.colors.borderLight,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: Platform.OS === 'ios' ? 36 : theme.spacing.lg,
    },
    modalTitle: {
      ...theme.typography.h3,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: theme.spacing.md,
    },
    optionButton: {
      alignItems: 'center',
      padding: theme.spacing.sm,
      width: 100,
    },
    optionIconCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    optionLabel: {
      ...theme.typography.small,
      fontWeight: '500',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    cancelButton: {
      marginTop: theme.spacing.md,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.isDark ? theme.colors.surfaceVariant : theme.colors.borderLight,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
  });

export const styles = createStyles(defaultTheme);
