import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './AuthButton.styles';

export interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.white}
        />
      ) : (
        <Text style={[styles.text, isDisabled && styles.textDisabled]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
