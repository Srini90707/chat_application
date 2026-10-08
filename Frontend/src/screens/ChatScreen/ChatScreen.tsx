import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChatHeader, MessageInput, MessageList } from '@/components/chat';
import { Loading } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './ChatScreen.styles';

interface ChatScreenProps {
  userId: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ userId }) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.mobileNumber || currentUser?.id || 'user-me';

  const {
    partner,
    messages,
    loading,
    error,
    isPartnerTyping,
    sendMessage,
    sendMediaMessage,
    retryMessage,
    clearConversation,
    refreshMessages,
  } = useMessages(userId, currentUserId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      {/* 1-to-1 Chat Header */}
      <ChatHeader user={partner} onClearChat={clearConversation} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <Loading message="Loading conversation..." />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshMessages}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            chatPartner={partner}
            isTyping={isPartnerTyping}
            onQuickMessage={sendMessage}
            onRetryMessage={retryMessage}
          />
        )}

        {/* Message Input Bar */}
        <MessageInput
          onSendMessage={sendMessage}
          onSendMediaMessage={sendMediaMessage}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
