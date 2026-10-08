import React from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserListItem } from '@/components/chat';
import { EmptyState, Avatar, ErrorView, ChatSkeletonList } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useTheme, useThemedStyles } from '@/theme';
import { User } from '@/types/chat';
import { createStyles } from './UsersScreen.styles';

export const UsersScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user: currentUser } = useAuth();
  const {
    filteredUsers,
    loading,
    refreshing,
    error,
    searchQuery,
    setSearchQuery,
    refreshUsers,
  } = useChat();

  React.useEffect(() => {
    const phone = currentUser?.mobileNumber || currentUser?.id;
    if (phone) {
      import('@/services/notification/notificationService').then(({ notificationService }) => {
        notificationService.registerForPushNotificationsAsync(phone);
      });
    }
  }, [currentUser]);

  const handleUserPress = (user: User) => {
    router.push({
      pathname: '/(main)/chat/[userId]',
      params: { userId: user.id },
    });
  };

  const handleNewChatPress = () => {
    router.push('/(main)/new-chat');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header with Title, Profile Avatar, and Actions */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
            onPress={() => router.push('/(main)/profile')}
            activeOpacity={0.7}
            accessibilityLabel="View profile"
            accessibilityRole="button"
          >
            <Avatar
              uri={currentUser?.avatar}
              name={currentUser?.name || 'You'}
              size="medium"
              showOnlineBadge
              isOnline={true}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Chats</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {currentUser?.name || 'You'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerIconButton, styles.newChatHeaderBtn]}
              onPress={handleNewChatPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="New Chat by mobile number"
              accessibilityRole="button"
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={18}
                color={theme.isDark ? theme.colors.black : theme.colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.push('/(main)/profile')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Profile settings"
              accessibilityRole="button"
            >
              <Ionicons name="person-outline" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <ChatSkeletonList count={7} />
      ) : error ? (
        <ErrorView
          title="Couldn't Load Chats"
          message={error}
          onRetry={refreshUsers}
          retryText="Try Again"
        />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <UserListItem user={item} onPress={handleUserPress} />}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshUsers}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                iconName="chatbubbles-outline"
                title="No conversations yet"
                description={
                  searchQuery
                    ? `No contacts match "${searchQuery}"`
                    : 'Start a new conversation with any mobile number.'
                }
                actionLabel="Start New Chat"
                onAction={handleNewChatPress}
              />
            }
          />

          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={handleNewChatPress}
            activeOpacity={0.85}
            accessibilityLabel="New Chat"
            accessibilityRole="button"
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={24}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};
