import React from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, StatusIndicator } from '@/components/common';
import { useTheme, useThemedStyles } from '@/theme';
import { User } from '@/types/chat';
import { createStyles } from './ChatHeader.styles';

export interface ChatHeaderProps {
  user: User | null;
  onClearChat?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ user, onClearChat }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleOptionsPress = () => {
    const options = ['View Contact Info', 'Clear Chat History', 'Cancel'];
    const destructiveIndex = 1;
    const cancelButtonIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex: destructiveIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            Alert.alert(user?.name || 'Contact', `Status: ${user?.isOnline ? 'Online' : 'Offline'}`);
          } else if (buttonIndex === destructiveIndex) {
            confirmClear();
          }
        }
      );
    } else {
      Alert.alert(
        user?.name || 'Options',
        'Choose an action:',
        [
          {
            text: 'View Contact Info',
            onPress: () =>
              Alert.alert(user?.name || 'Contact', `Status: ${user?.isOnline ? 'Online' : 'Offline'}`),
          },
          {
            text: 'Clear Chat History',
            style: 'destructive',
            onPress: confirmClear,
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const confirmClear = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages in this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: onClearChat },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.profileRow}>
        <Avatar
          uri={user?.avatar}
          name={user?.name}
          size="md"
          isOnline={user?.isOnline}
          showStatus
        />

        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name || 'Chat'}
          </Text>
          <StatusIndicator isOnline={!!user?.isOnline} showText size={8} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.moreButton}
        onPress={handleOptionsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
        accessibilityLabel="Chat options"
        accessibilityRole="button"
      >
        <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};
