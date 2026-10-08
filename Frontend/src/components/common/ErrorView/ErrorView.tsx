import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '@/theme';
import { AppButton } from '../AppButton/AppButton';
import { createStyles } from './ErrorView.styles';

export interface ErrorViewProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container} accessible accessibilityRole="alert">
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={36} color={theme.colors.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <AppButton
          title={retryText}
          variant="primary"
          size="medium"
          onPress={onRetry}
          style={styles.button}
        />
      ) : null}
    </View>
  );
};
