import { StyleSheet } from 'react-native';
import { theme as defaultTheme, Theme } from '@/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    changePhotoButton: {
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
    },
    changePhotoText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    formSection: {
      marginTop: theme.spacing.sm,
    },
    readOnlyHelper: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      marginTop: -theme.spacing.sm,
      marginBottom: theme.spacing.md,
      marginLeft: theme.spacing.xs,
    },
    buttonContainer: {
      marginTop: theme.spacing.xl,
    },
  });

export const styles = createStyles(defaultTheme);
