import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './LoadingView.styles';

export interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Loading...',
  size = 'large',
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container} accessible accessibilityRole="progressbar">
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};
