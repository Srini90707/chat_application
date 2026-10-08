import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './AuthError.styles';

export interface AuthErrorProps {
  message?: string | null;
  actionLabel?: string;
  onAction?: () => void;
}

export const AuthError: React.FC<AuthErrorProps> = ({
  message,
  actionLabel,
  onAction,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!message) return null;

  return (
    <View style={styles.container} accessible accessibilityRole="alert">
      <View style={styles.messageRow}>
        <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
        <Text style={styles.text}>{message}</Text>
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Ionicons name="server-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
