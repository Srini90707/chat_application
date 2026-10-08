import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/common';
import { useTheme, useThemedStyles } from '@/theme';
import { UserSearchResult } from '@/types/user';
import { formatDisplayPhone } from '@/utils/phoneUtils';
import { createStyles } from './UserSearchItem.styles';

export interface UserSearchItemProps {
  user: UserSearchResult;
  onStartChat: (user: UserSearchResult) => void;
  loading?: boolean;
}

export const UserSearchItem: React.FC<UserSearchItemProps> = ({
  user,
  onStartChat,
  loading = false,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const iconColor = theme.colors.white;

  return (
    <View style={styles.card}>
      <View style={styles.avatarWrapper}>
        <Avatar
          uri={user.avatar}
          name={user.name}
          size="xl"
          isOnline={user.isOnline}
          showStatus
        />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.phone}>{formatDisplayPhone(user.mobileNumber)}</Text>
        {user.about ? (
          <Text style={styles.about} numberOfLines={2}>
            {user.about}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, loading ? styles.actionButtonDisabled : null]}
        onPress={() => onStartChat(user)}
        disabled={loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Start chat with ${user.name}`}
      >
        {loading ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : (
          <>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={iconColor} />
            <Text style={styles.actionButtonText}>Start Chat</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};
