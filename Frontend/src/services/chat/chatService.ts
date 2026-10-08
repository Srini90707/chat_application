import { API_CONFIG } from '@/config/api';
import { CURRENT_USER } from '@/data/mockChatData';
import { ApiError } from '@/services/api/apiError';
import { CreateChatResponse, Message, MessageStatus, User } from '@/types/chat';
import { generateMessageId, isValidMessage, sanitizeMessageText } from '@/utils/messageUtils';
import { websocketService } from '../websocket/websocketService';
import { chatApi } from './chatApi';

class ChatService {
  private activeTimers: ReturnType<typeof setTimeout>[] = [];
  private inFlightSubmissions: Set<string> = new Set();

  async getUsers(): Promise<User[]> {
    return chatApi.fetchUsers();
  }

  async getUserById(userId: string): Promise<User | null> {
    return chatApi.fetchUserById(userId);
  }

  async createOrGetChat(userId: string): Promise<CreateChatResponse> {
    if (!userId) {
      throw new ApiError('User ID is required to start a chat.', 400, 'INVALID_USER_ID');
    }
    return chatApi.createOrGetChat(userId);
  }

  async getMessages(userId: string): Promise<Message[]> {
    return chatApi.fetchMessages(userId);
  }

  async sendMessage(params: {
    receiverId: string;
    text: string;
    senderId?: string;
    clientMessageId?: string;
    messageType?: Message['messageType'];
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
  }): Promise<Message> {
    const rawText = params.text || '';
    const isMedia = !!params.attachmentUrl || params.messageType === 'image' || params.messageType === 'pdf' || params.messageType === 'document';
    
    if (!isMedia && !isValidMessage(rawText)) {
      throw new ApiError('Message cannot be empty.', 400, 'EMPTY_MESSAGE');
    }

    const sanitizedText = sanitizeMessageText(rawText);
    const senderId = params.senderId || CURRENT_USER.id;
    const submissionKey = `${senderId}:${params.receiverId}:${sanitizedText}:${params.attachmentUrl || ''}`;

    // Prevent duplicate rapid submissions
    if (this.inFlightSubmissions.has(submissionKey)) {
      throw new ApiError('Duplicate message submission in progress.', 429, 'DUPLICATE_SUBMISSION');
    }

    this.inFlightSubmissions.add(submissionKey);
    setTimeout(() => {
      this.inFlightSubmissions.delete(submissionKey);
    }, 1500);

    const messageId = params.clientMessageId || generateMessageId();
    const newMessage: Message = {
      id: messageId,
      chatId: `chat-${params.receiverId}`,
      senderId,
      receiverId: params.receiverId,
      text: sanitizedText,
      timestamp: new Date().toISOString(),
      status: 'sending',
      messageType: params.messageType || 'text',
      attachmentUrl: params.attachmentUrl,
      attachmentName: params.attachmentName,
      attachmentSize: params.attachmentSize,
    };

    try {
      // 1. Post to backend REST API (persists to PostgreSQL & broadcasts to receiver)
      const saved = await chatApi.postMessage(newMessage);

      // 2. Broadcast through WebSocket tunnel if socket is available
      try {
        websocketService.sendMessage(saved || newMessage);
      } catch {}

      // 3. Status transition simulation only in mock mode
      if (API_CONFIG.MOCK_AUTH) {
        const timer1 = setTimeout(() => {
          newMessage.status = 'sent';
          websocketService.emitMessageStatus(newMessage.id, 'sent');
        }, 400);

        const timer2 = setTimeout(() => {
          newMessage.status = 'delivered';
          websocketService.emitMessageStatus(newMessage.id, 'delivered');
        }, 1000);

        this.activeTimers.push(timer1, timer2);
        this.simulatePartnerInteraction(params.receiverId, senderId);
      }

      return saved || newMessage;
    } catch (err: unknown) {
      newMessage.status = 'failed';
      websocketService.emitMessageStatus(newMessage.id, 'failed');
      throw err;
    } finally {
      this.inFlightSubmissions.delete(submissionKey);
    }
  }

  async retrySendMessage(failedMessage: Message): Promise<Message> {
    return this.sendMessage({
      receiverId: failedMessage.receiverId,
      text: failedMessage.text,
      senderId: failedMessage.senderId,
      clientMessageId: failedMessage.id,
    });
  }

  async markMessagesAsRead(userId: string): Promise<void> {
    await chatApi.markAsRead(userId);
  }

  async clearChat(userId: string): Promise<void> {
    await chatApi.deleteMessages(userId);
  }

  /**
   * Clears any pending timeouts to prevent memory leaks or phantom events on unmount/logout
   */
  clearPendingSimulations(): void {
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.activeTimers = [];
    this.inFlightSubmissions.clear();
  }

  subscribeToMessages(callback: (message: Message) => void): () => void {
    return websocketService.onMessage(callback);
  }

  subscribeToRoom(roomId: string, callback: (message: Message) => void, altRoomId?: string): () => void {
    return websocketService.subscribeToRoom(roomId, callback, altRoomId);
  }

  subscribeToTyping(callback: (payload: { userId: string; isTyping: boolean }) => void): () => void {
    return websocketService.onTyping(callback);
  }

  subscribeToStatus(callback: (payload: { userId: string; isOnline: boolean }) => void): () => void {
    return websocketService.onStatusChange(callback);
  }

  subscribeToMessageStatus(
    callback: (payload: { messageId: string; status: MessageStatus }) => void
  ): () => void {
    return websocketService.onMessageStatus(callback);
  }

  private simulatePartnerInteraction(partnerId: string, currentUserId: string): void {
    const typingTimer = setTimeout(() => {
      websocketService.emitTyping(partnerId, true);
    }, 1200);

    const replyTimer = setTimeout(() => {
      websocketService.emitTyping(partnerId, false);

      const replies = [
        'Got it! Looking into that right now.',
        'Sounds good to me, let’s go ahead with that.',
        'Thanks for updating me. I will verify this on our end.',
        'Awesome work! Let me review and get back to you shortly.',
        'Received. Everything looks on track.',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const incomingMessage: Message = {
        id: generateMessageId(),
        chatId: `chat-${partnerId}`,
        senderId: partnerId,
        receiverId: currentUserId,
        text: randomReply,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      chatApi.insertIncomingMessage(incomingMessage);
      websocketService.emitMessage(incomingMessage);
    }, 3200);

    this.activeTimers.push(typingTimer, replyTimer);
  }
}

export const chatService = new ChatService();
