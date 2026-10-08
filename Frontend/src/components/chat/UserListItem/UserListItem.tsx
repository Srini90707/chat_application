import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar } from '@/components/common';
import { useThemedStyles } from '@/theme';
import { User } from '@/types/chat';
import { formatPreviewTime } from '@/utils/dateUtils';
import { createStyles } from './UserListItem.styles';

interface UserListItemProps {
  user: User;
  onPress: (user: User) => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user, onPress }) => {
  const styles = useThemedStyles(createStyles);
  const hasUnread = (user.unreadCount ?? 0) > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(user)}
      activeOpacity={0.65}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${user.name}`}
    >
      <View style={styles.avatarWrapper}>
        <Avatar
          uri={user.avatar}
          name={user.name}
          size="lg"
          isOnline={user.isOnline}
          showStatus
        />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.name, hasUnread && styles.nameUnread]}
            numberOfLines={1}
          >
            {user.name}
          </Text>

          {user.lastMessageTime ? (
            <Text style={[styles.time, hasUnread && styles.timeUnread]}>
              {formatPreviewTime(user.lastMessageTime)}
            </Text>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.lastMessage,
              hasUnread && styles.lastMessageUnread,
              user.isTyping && styles.typingText,
            ]}
            numberOfLines={1}
          >
            {user.isTyping ? 'Typing...' : user.lastMessage || 'No messages yet'}
          </Text>

          {hasUnread ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {user.unreadCount && user.unreadCount > 99 ? '99+' : user.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.divider} />
      </View>
    </TouchableOpacity>
  );
};
