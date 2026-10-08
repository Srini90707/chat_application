import React from 'react';
import { Text, View } from 'react-native';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './StatusIndicator.styles';

export interface StatusIndicatorProps {
  isOnline: boolean;
  showText?: boolean;
  size?: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isOnline,
  showText = false,
  size = 12,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const indicatorColor = isOnline ? theme.colors.online : theme.colors.offline;

  if (showText) {
    return (
      <View style={styles.textRow}>
        <View
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: indicatorColor,
            },
          ]}
        />
        <Text style={styles.label}>{isOnline ? 'Online' : 'Offline'}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: indicatorColor,
        },
      ]}
    />
  );
};
