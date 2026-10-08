import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './ProfileMenuItem.styles';

export interface ProfileMenuItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isDestructive?: boolean;
  isLast?: boolean;
  badge?: string;
  showChevron?: boolean;
  disabled?: boolean;
}

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  iconName,
  title,
  subtitle,
  onPress,
  isDestructive = false,
  isLast = false,
  badge,
  showChevron = true,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity
      style={[styles.container, isLast && styles.lastItem]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View
        style={[
          styles.iconContainer,
          isDestructive && { backgroundColor: `${theme.colors.error}18` },
        ]}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={isDestructive ? theme.colors.error : theme.colors.primary}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, isDestructive && styles.destructiveTitle]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.trailingContainer}>
        {badge ? <Text style={styles.badgeText}>{badge}</Text> : null}
        {showChevron && !isDestructive ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.textMuted}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};
