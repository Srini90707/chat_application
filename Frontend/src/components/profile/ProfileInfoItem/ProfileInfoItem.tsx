import React from 'react';
import { View, Text } from 'react-native';
import { useThemedStyles } from '@/theme';
import { createStyles } from './ProfileInfoItem.styles';

export interface ProfileInfoItemProps {
  label: string;
  value: string;
  isLast?: boolean;
}

export const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({
  label,
  value,
  isLast = false,
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View
      style={[styles.container, isLast && styles.lastItem]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};
