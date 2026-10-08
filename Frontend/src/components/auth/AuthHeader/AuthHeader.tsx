import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './AuthHeader.styles';

export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  showLogo?: boolean;
  onBack?: () => void;
  onLogoLongPress?: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  iconName,
  showLogo = false,
  onBack,
  onLogoLongPress,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      )}

      {showLogo && (
        <TouchableOpacity
          style={styles.logoBadge}
          onLongPress={onLogoLongPress}
          delayLongPress={500}
          activeOpacity={onLogoLongPress ? 0.85 : 1}
          accessibilityLabel="Application logo"
        >
          <Image
            source={require('../../../../assets/images/app-logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {iconName && !showLogo && (
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={28} color={theme.colors.primary} />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};
