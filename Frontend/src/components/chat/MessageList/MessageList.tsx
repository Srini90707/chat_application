import React, { useEffect, useMemo, useRef } from 'react';
import { FlatList, View } from 'react-native';
import { EmptyState } from '@/components/common';
import { Message, User } from '@/types/chat';
import { TimelineItem, buildTimelineItems } from '@/utils/messageUtils';
import { DateSeparator } from '../DateSeparator/DateSeparator';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import { TypingIndicator } from '../TypingIndicator/TypingIndicator';
import { useThemedStyles } from '@/theme';
import { createStyles } from './MessageList.styles';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  chatPartner?: User | null;
  isTyping?: boolean;
  onQuickMessage?: (text: string) => void;
  onRetryMessage?: (message: Message) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  chatPartner,
  isTyping = false,
  onQuickMessage,
  onRetryMessage,
}) => {
  const styles = useThemedStyles(createStyles);
  const flatListRef = useRef<FlatList<TimelineItem>>(null);

  const timelineItems = useMemo(() => {
    return buildTimelineItems(messages);
  }, [messages]);

  useEffect(() => {
    if (timelineItems.length > 0 || isTyping) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [timelineItems.length, isTyping]);

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          iconName="chatbubbles-outline"
          title={chatPartner ? `Chat with ${chatPartner.name}` : 'No messages yet'}
          description="Send a message or tap below to start the conversation."
          actionLabel="👋 Say Hello"
          onAction={() => onQuickMessage?.('👋 Hi there!')}
        />
      </View>
    );
  }

  const renderItem = ({ item }: { item: TimelineItem }) => {
    if (item.type === 'date') {
      return <DateSeparator date={item.date} />;
    }

    const normSender = (item.message.senderId || '').replace(/\D/g, '').slice(-10);
    const normCurrent = (currentUserId || '').replace(/\D/g, '').slice(-10);
    const isCurrentUser =
      item.message.senderId === currentUserId ||
      (normSender.length >= 10 && normCurrent.length >= 10 && normSender === normCurrent);

    return (
      <MessageBubble
        message={item.message}
        isCurrentUser={isCurrentUser}
        onRetry={onRetryMessage}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={timelineItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? <TypingIndicator userName={chatPartner?.name} /> : null}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        onLayout={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />
    </View>
  );
};
