import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './ProfileHeader.styles';

export interface ProfileHeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  title,
  onBack,
  rightAction,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      {rightAction ? (
        <View style={styles.rightPlaceholder}>{rightAction}</View>
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
};
