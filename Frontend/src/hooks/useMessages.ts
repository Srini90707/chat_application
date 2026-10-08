import { useCallback, useEffect, useState } from 'react';
import { chatService } from '@/services/chat/chatService';
import { mediaService } from '@/services/media/mediaService';
import { getChatRoomId, getFullChatRoomId, websocketService } from '@/services/websocket/websocketService';
import { Message, User } from '@/types/chat';

// Helper to normalize phone numbers (matches last 10 digits regardless of +91, 91, or spaces)
const normalizePhone = (val?: string) => (val || '').replace(/\D/g, '').slice(-10);

const isChatMatch = (
  sender: string,
  receiver: string,
  partnerId: string,
  currentId?: string
) => {
  const normSender = normalizePhone(sender);
  const normReceiver = normalizePhone(receiver);
  const normPartner = normalizePhone(partnerId);

  // If this message involves the active chat partner (as sender or receiver), it belongs to this chat!
  if (normSender === normPartner || normReceiver === normPartner) {
    return true;
  }

  const normCurrent = normalizePhone(currentId);
  return (
    (normSender === normPartner && normReceiver === normCurrent) ||
    (normSender === normCurrent && normReceiver === normPartner)
  );
};

export function useMessages(userId: string, currentUserId: string = 'user-me') {
  const [partner, setPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      const [fetchedUser, fetchedMessages] = await Promise.all([
        chatService.getUserById(userId),
        chatService.getMessages(userId),
      ]);

      setPartner(fetchedUser);
      setMessages(fetchedMessages || []);
      setError(null);

      await chatService.markMessagesAsRead(userId);
    } catch {
      setError('Unable to load chat conversation.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    Promise.all([chatService.getUserById(userId), chatService.getMessages(userId)])
      .then(([fetchedUser, fetchedMessages]) => {
        if (isMounted) {
          setPartner(fetchedUser);
          setMessages(fetchedMessages || []);
          setError(null);
          setLoading(false);
        }
        return chatService.markMessagesAsRead(userId);
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load chat conversation.');
          setLoading(false);
        }
      });

    // Ensure WebSocket connection is actively maintained for current user
    if (currentUserId && currentUserId !== 'user-me') {
      websocketService.connect(currentUserId);
    }

    const roomId = getChatRoomId(userId, currentUserId);
    const altRoomId = getFullChatRoomId(userId, currentUserId);

    // 1a. Listen to Room topic (/topic/chat.{roomId} and /topic/chat.{altRoomId})
    const unsubRoom = chatService.subscribeToRoom(roomId, (msg) => {
      if (!isMounted) return;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === msg.id);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = msg;
          return copy;
        }
        return [...prev, msg];
      });

      if (normalizePhone(msg.senderId) === normalizePhone(userId)) {
        chatService.markMessagesAsRead(userId);
      }
    }, altRoomId);

    // 1b. Listen to User queue (/user/queue/messages)
    const unsubMsg = chatService.subscribeToMessages((msg) => {
      if (!isMounted) return;

      if (isChatMatch(msg.senderId, msg.receiverId, userId, currentUserId)) {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === msg.id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = msg;
            return copy;
          }
          return [...prev, msg];
        });

        if (normalizePhone(msg.senderId) === normalizePhone(userId)) {
          chatService.markMessagesAsRead(userId);
        }
      }
    });

    // 2. Real-time background sync interval (keeps open chat updated every 2 seconds)
    const pollInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const fresh = await chatService.getMessages(userId);
        if (!isMounted || !Array.isArray(fresh) || fresh.length === 0) return;

        setMessages((prev) => {
          const prevIds = new Set(prev.map((m) => m.id));
          const hasNew = fresh.some((m) => !prevIds.has(m.id));

          if (!hasNew && prev.length === fresh.length) {
            return prev;
          }

          // Merge without losing optimistic local bubbles
          const map = new Map<string, Message>();
          prev.forEach((m) => map.set(m.id, m));
          fresh.forEach((m) => map.set(m.id, m));

          return Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
      } catch {
        // Silently ignore background polling errors
      }
    }, 2000);

    // 3. Typing indicator listener
    const unsubTyping = chatService.subscribeToTyping(({ userId: typingUserId, isTyping }) => {
      if (!isMounted) return;
      if (normalizePhone(typingUserId) === normalizePhone(userId)) {
        setIsPartnerTyping(isTyping);
      }
    });

    // 4. Message status receipt listener
    const unsubStatus = chatService.subscribeToMessageStatus(({ messageId, status }) => {
      if (!isMounted) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status } : m))
      );
    });

    // 5. Partner presence status listener
    const unsubPresence = chatService.subscribeToStatus(({ userId: presenceUserId, isOnline }) => {
      if (!isMounted) return;
      if (normalizePhone(presenceUserId) === normalizePhone(userId)) {
        setPartner((prev) => (prev ? { ...prev, isOnline } : null));
      }
    });

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      unsubRoom();
      unsubMsg();
      unsubTyping();
      unsubStatus();
      unsubPresence();
      chatService.clearPendingSimulations();
    };
  }, [userId, currentUserId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!userId || !trimmed) return;

      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const optimisticMsg: Message = {
        id: localId,
        chatId: `chat-${userId}`,
        senderId: currentUserId,
        receiverId: userId,
        text: trimmed,
        timestamp: new Date().toISOString(),
        status: 'sending',
      };

      // Optimistic update: instantly render message bubble on screen
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const sent = await chatService.sendMessage({
          receiverId: userId,
          text: trimmed,
          senderId: currentUserId,
          clientMessageId: localId,
        });

        // Update status to 'sent' once backend confirms
        setMessages((prev) =>
          prev.map((m) =>
            m.id === localId ? { ...m, id: sent.id || m.id, status: 'sent' } : m
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, status: 'failed' } : m))
        );
      }
    },
    [userId, currentUserId]
  );

  const sendMediaMessage = useCallback(
    async (params: {
      uri: string;
      name: string;
      mimeType?: string;
      size?: number;
      messageType: 'image' | 'pdf' | 'document';
      caption?: string;
    }) => {
      if (!userId) return;

      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const optimisticMsg: Message = {
        id: localId,
        chatId: `chat-${userId}`,
        senderId: currentUserId,
        receiverId: userId,
        text: (params.caption || '').trim(),
        timestamp: new Date().toISOString(),
        status: 'sending',
        messageType: params.messageType,
        attachmentUrl: params.uri,
        attachmentName: params.name,
        attachmentSize: params.size,
      };

      // Optimistic update: render message with local media preview immediately
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        // Upload media file to server
        const uploaded = await mediaService.uploadFile(params.uri, params.name, params.mimeType);

        // Send via chatService / WebSocket / REST
        const sent = await chatService.sendMessage({
          receiverId: userId,
          text: (params.caption || '').trim(),
          senderId: currentUserId,
          clientMessageId: localId,
          messageType: uploaded.messageType || params.messageType,
          attachmentUrl: uploaded.fileUrl,
          attachmentName: uploaded.fileName || params.name,
          attachmentSize: uploaded.fileSize || params.size,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === localId
              ? {
                  ...m,
                  id: sent.id || m.id,
                  status: 'sent',
                  timestamp: sent.timestamp || m.timestamp,
                  attachmentUrl: sent.attachmentUrl || uploaded.fileUrl,
                  messageType: sent.messageType || uploaded.messageType || params.messageType,
                }
              : m
          )
        );
      } catch (err) {
        console.error('Failed to send media message:', err);
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, status: 'failed' } : m))
        );
      }
    },
    [userId, currentUserId]
  );

  const retryMessage = useCallback(
    async (failedMessage: Message) => {
      if (!userId) return;
      try {
        await chatService.retrySendMessage(failedMessage);
      } catch {
        // Status remains failed
      }
    },
    [userId]
  );

  const clearConversation = useCallback(async () => {
    if (!userId) return;
    await chatService.clearChat(userId);
    setMessages([]);
  }, [userId]);

  return {
    partner,
    messages,
    loading,
    error,
    isPartnerTyping,
    sendMessage,
    sendMediaMessage,
    retryMessage,
    clearConversation,
    refreshMessages: loadData,
  };
}
