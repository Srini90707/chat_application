import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './Loading.styles';

export interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'large',
  color,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const spinnerColor = color || theme.colors.primary;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};
