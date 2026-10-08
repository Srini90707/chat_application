import React from 'react';
import { Text, View } from 'react-native';
import { useThemedStyles } from '@/theme';
import { formatDateSeparator } from '@/utils/dateUtils';
import { createStyles } from './DateSeparator.styles';

export interface DateSeparatorProps {
  date: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const styles = useThemedStyles(createStyles);
  const label = date.includes('T') ? formatDateSeparator(date) : date;

  if (!label) return null;

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </View>
  );
};
