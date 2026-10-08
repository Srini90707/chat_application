import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './AppButton.styles';

export type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
export type AppButtonSize = 'small' | 'medium' | 'large';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDisabled = disabled || loading;

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'text':
        return styles.textVariantText;
      default:
        return styles.primaryText;
    }
  };

  const getIndicatorColor = () => {
    switch (variant) {
      case 'outline':
      case 'secondary':
        return theme.colors.textPrimary;
      case 'danger':
        return theme.colors.error;
      case 'text':
        return theme.colors.primary;
      default:
        return theme.colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIndicatorColor()} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.textLabel,
              getTextStyle(),
              size === 'small' && styles.smallText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
