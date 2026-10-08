import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '@/theme';
import { StatusIndicator } from '../StatusIndicator/StatusIndicator';
import { createStyles } from './Avatar.styles';

export type AvatarSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'xxl'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge';

export interface AvatarProps {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  isOnline?: boolean;
  showStatus?: boolean;
  showOnlineBadge?: boolean;
  showEditBadge?: boolean;
  onEditPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 'md',
  isOnline,
  showStatus = false,
  showOnlineBadge = false,
  showEditBadge = false,
  onEditPress,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [imageError, setImageError] = useState(false);

  const sizeMap: Record<AvatarSize, number> = {
    sm: theme.dimensions.avatar.sm,
    small: theme.dimensions.avatar.sm,
    md: theme.dimensions.avatar.md,
    medium: theme.dimensions.avatar.md,
    lg: theme.dimensions.avatar.lg,
    large: theme.dimensions.avatar.lg,
    xl: theme.dimensions.avatar.xl,
    xlarge: theme.dimensions.avatar.xl,
    xxl: theme.dimensions.avatar.xxl,
  };

  const pixelSize = sizeMap[size] || theme.dimensions.avatar.md;
  const borderRadius = pixelSize / 2;
  const fontSize = Math.max(12, Math.round(pixelSize * 0.36));

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const indicatorSize = Math.max(10, Math.round(pixelSize * 0.26));
  const hasValidImage = Boolean(uri) && !imageError;
  const shouldShowStatus = showStatus || showOnlineBadge;

  return (
    <View style={[styles.container, { width: pixelSize, height: pixelSize }]}>
      {hasValidImage ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: pixelSize, height: pixelSize, borderRadius }]}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.placeholder, { width: pixelSize, height: pixelSize, borderRadius }]}>
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}

      {shouldShowStatus && isOnline !== undefined && (
        <View style={styles.indicatorContainer}>
          <StatusIndicator isOnline={isOnline} size={indicatorSize} />
        </View>
      )}

      {showEditBadge && (
        <TouchableOpacity
          style={styles.editBadge}
          onPress={onEditPress}
          activeOpacity={0.8}
          accessibilityLabel="Change profile picture"
          accessibilityRole="button"
        >
          <Ionicons
            name="camera"
            size={16}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
