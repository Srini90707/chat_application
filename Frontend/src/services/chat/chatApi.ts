import { API_CONFIG, CHAT_ENDPOINTS, USER_ENDPOINTS } from '@/config/api';
import { INITIAL_MESSAGES, INITIAL_USERS } from '@/data/mockChatData';
import { apiClient } from '@/services/api/apiClient';
import { storageService } from '@/services/storage/storageService';
import { BackendUserDto } from '@/types/auth';
import { CreateChatResponse, Message, User } from '@/types/chat';

/**
 * ChatApi handles REST transport for conversations, chat creation and message persistence.
 */
class ChatApi {
  private users: User[] = [...INITIAL_USERS];
  private messages: Record<string, Message[]> = { ...INITIAL_MESSAGES };

  async fetchUsers(): Promise<User[]> {
    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      return [...this.users];
    }

    const session = await storageService.getAuthSession();
    const currentUserNumber = session?.user?.mobileNumber || session?.user?.id;

    try {
      const rawUsers = await apiClient.get<BackendUserDto[]>(USER_ENDPOINTS.GET_ALL_USERS, {
        params: currentUserNumber ? { excludeNumber: currentUserNumber } : undefined,
      });

      if (!Array.isArray(rawUsers)) {
        return [];
      }

      return rawUsers
        .filter((u) => !currentUserNumber || u.number !== currentUserNumber)
        .map((u) => ({
          id: u.number,
          name: u.name,
          mobileNumber: u.number,
          isOnline: true,
          unreadCount: 0,
        }));
    } catch {
      return [];
    }
  }

  async fetchUserById(userId: string): Promise<User | null> {
    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const user = this.users.find((u) => u.id === userId);
      return user ? { ...user } : null;
    }

    try {
      const u = await apiClient.get<BackendUserDto>(`${USER_ENDPOINTS.GET_USER_BY_ID}/${encodeURIComponent(userId)}`);
      if (!u) return null;
      return {
        id: u.number,
        name: u.name,
        mobileNumber: u.number,
        isOnline: true,
        unreadCount: 0,
      };
    } catch {
      return null;
    }
  }

  /**
   * Create or retrieve existing 1-to-1 conversation
   * Endpoint: POST /api/chats with body { userId }
   */
  async createOrGetChat(userId: string): Promise<CreateChatResponse> {
    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      let partner = this.users.find((u) => u.id === userId);
      const isNew = !partner;

      if (!partner) {
        // If user is from INITIAL_USERS or mock data, register in active list
        const template = INITIAL_USERS.find((u) => u.id === userId);
        partner = {
          id: userId,
          name: template?.name || 'Contact',
          mobileNumber: template?.mobileNumber,
          avatar: template?.avatar,
          isOnline: template?.isOnline ?? true,
          isTyping: false,
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        };
        this.users = [partner, ...this.users];
      }

      if (!this.messages[userId]) {
        this.messages[userId] = [];
      }

      return {
        chatId: `chat-${userId}`,
        conversation: {
          id: `chat-${userId}`,
          partner,
          unreadCount: partner.unreadCount || 0,
        },
        isNew,
      };
    }

    try {
      return await apiClient.post<CreateChatResponse>(CHAT_ENDPOINTS.CHATS, { userId });
    } catch {
      const partner = await this.fetchUserById(userId);
      return {
        chatId: `chat-${userId}`,
        conversation: partner
          ? {
              id: `chat-${userId}`,
              partner,
              unreadCount: 0,
            }
          : undefined,
        isNew: true,
      };
    }
  }

  async fetchMessages(userId: string): Promise<Message[]> {
    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.messages[userId] ? [...this.messages[userId]] : [];
    }

    const session = await storageService.getAuthSession();
    let currentNumber = session?.user?.mobileNumber || session?.user?.id;

    if (!currentNumber || !/\d{5,}/.test(currentNumber)) {
      if (session?.token) {
        try {
          const parts = session.token.split('.');
          if (parts.length >= 2) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            currentNumber = decoded.sub || decoded.number || currentNumber;
          }
        } catch {}
      }
    }

    const cleanUserId = userId.trim().startsWith('+')
      ? userId.trim()
      : (userId.trim().length >= 10 ? `+${userId.trim().replace(/^\+/, '')}` : userId.trim());

    return apiClient.get<Message[]>(`${CHAT_ENDPOINTS.MESSAGES}/${encodeURIComponent(cleanUserId)}`, {
      params: currentNumber ? { currentUser: currentNumber } : undefined,
    });
  }

  async postMessage(message: Message): Promise<Message> {
    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (!this.messages[message.receiverId]) {
        this.messages[message.receiverId] = [];
      }
      this.messages[message.receiverId].push(message);

      // Update user's last message preview
      const userIdx = this.users.findIndex((u) => u.id === message.receiverId);
      if (userIdx !== -1) {
        this.users[userIdx] = {
          ...this.users[userIdx],
          lastMessage: message.text,
          lastMessageTime: message.timestamp,
        };
      }

      return message;
    }

    return apiClient.post<Message>(CHAT_ENDPOINTS.MESSAGES, message);
  }

  async markAsRead(userId: string): Promise<void> {
    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 40));
      const list = this.messages[userId];
      if (list) {
        list.forEach((msg) => {
          if (msg.senderId === userId && msg.status !== 'read') {
            msg.status = 'read';
          }
        });
      }

      const idx = this.users.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        this.users[idx] = {
          ...this.users[idx],
          unreadCount: 0,
        };
      }
      return;
    }

    try {
      await apiClient.post(`${CHAT_ENDPOINTS.MESSAGES}/${userId}/read`);
    } catch {
      // Ignored if endpoint not implemented on backend
    }
  }

  async deleteMessages(userId: string): Promise<void> {
    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      this.messages[userId] = [];
      const idx = this.users.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        this.users[idx] = {
          ...this.users[idx],
          lastMessage: '',
        };
      }
      return;
    }

    await apiClient.delete(`${CHAT_ENDPOINTS.MESSAGES}/${userId}`);
  }

  // Local helper for simulated replies
  insertIncomingMessage(message: Message): void {
    if (!this.messages[message.senderId]) {
      this.messages[message.senderId] = [];
    }
    this.messages[message.senderId].push(message);

    const idx = this.users.findIndex((u) => u.id === message.senderId);
    if (idx !== -1) {
      this.users[idx] = {
        ...this.users[idx],
        lastMessage: message.text,
        lastMessageTime: message.timestamp,
      };
    }
  }
}

export const chatApi = new ChatApi();
