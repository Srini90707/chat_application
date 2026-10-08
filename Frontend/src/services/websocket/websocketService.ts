import { API_CONFIG } from '@/config/api';
import { serverConfigService } from '@/services/config/serverConfigService';
import { storageService } from '@/services/storage/storageService';
import { Message, MessageStatus } from '@/types/chat';

export type MessageCallback = (message: Message) => void;
export type TypingCallback = (payload: { userId: string; isTyping: boolean }) => void;
export type StatusChangeCallback = (payload: { userId: string; isOnline: boolean }) => void;
export type MessageStatusCallback = (payload: { messageId: string; status: MessageStatus }) => void;

export function getChatRoomId(user1?: string, user2?: string): string {
  const d1 = (user1 || '').replace(/\D/g, '');
  const d2 = (user2 || '').replace(/\D/g, '');
  const u1 = d1.length > 10 ? d1.slice(-10) : d1;
  const u2 = d2.length > 10 ? d2.slice(-10) : d2;
  return u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;
}

export function getFullChatRoomId(user1?: string, user2?: string): string {
  const u1 = (user1 || '').replace(/\D/g, '');
  const u2 = (user2 || '').replace(/\D/g, '');
  return u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;
}

/**
 * WebSocketService handles real-time bi-directional messaging with the Spring Boot STOMP broker.
 */
class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private currentUserId: string | null = null;
  private messageListeners: Set<MessageCallback> = new Set();
  private typingListeners: Set<TypingCallback> = new Set();
  private statusListeners: Set<StatusChangeCallback> = new Set();
  private messageStatusListeners: Set<MessageStatusCallback> = new Set();
  private activeRoomSubscriptions: Map<string, MessageCallback> = new Map();
  private processedMessageIds: Set<string> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    serverConfigService.subscribe(() => {
      if (this.currentUserId && this.isConnected) {
        const uid = this.currentUserId;
        this.disconnect();
        this.connect(uid);
      }
    });
  }

  /**
   * Connect to WebSocket server for the specified user (idempotent)
   */
  async connect(userId: string): Promise<void> {
    if (this.isConnected && this.currentUserId === userId) {
      return;
    }

    this.currentUserId = userId;

    if (API_CONFIG.MOCK_AUTH) {
      this.isConnected = true;
      return;
    }

    const session = await storageService.getAuthSession();
    const token = session?.token || '';

    const wsUrl = serverConfigService.getWsUrl();

    try {
      if (this.socket) {
        try {
          this.socket.close();
        } catch {}
      }

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        // Send STOMP CONNECT frame
        const headers = [
          'CONNECT',
          'accept-version:1.1,1.2',
          'host:localhost',
        ];
        if (token) {
          headers.push(`Authorization:Bearer ${token}`);
          headers.push(`passcode:${token}`);
        }
        if (this.currentUserId) {
          headers.push(`login:${this.currentUserId}`);
        }
        const connectFrame = headers.join('\n') + '\n\n\0';
        this.safeSend(connectFrame);
      };

      this.socket.onmessage = (event) => {
        if (typeof event.data === 'string') {
          this.handleStompFrame(event.data);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        if (!this.reconnectTimer && this.currentUserId) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.currentUserId) {
              this.connect(this.currentUserId);
            }
          }, 3000);
        }
      };

      this.socket.onerror = () => {
        this.isConnected = false;
      };
    } catch {
      this.isConnected = false;
    }
  }

  private safeSend(payload: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(payload);
      } catch {
        // Network socket write error ignored
      }
    }
  }

  /**
   * Parses incoming STOMP frames (handles both LF and CRLF, multiple frames per chunk)
   */
  private handleStompFrame(raw: string): void {
    if (!raw || typeof raw !== 'string') return;

    // Split on STOMP NULL byte delimiter to process bundled frames
    const chunks = raw.split('\0');

    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('CONNECTED')) {
        this.isConnected = true;

        // 1. Subscribe to private user queues
        this.safeSend('SUBSCRIBE\nid:sub-messages\ndestination:/user/queue/messages\n\n\0');
        this.safeSend('SUBSCRIBE\nid:sub-typing\ndestination:/user/queue/typing\n\n\0');

        // 2. Resubscribe to all active room topics
        this.activeRoomSubscriptions.forEach((_, roomId) => {
          this.safeSend(`SUBSCRIBE\nid:sub-room-${roomId}\ndestination:/topic/chat.${roomId}\n\n\0`);
        });
        continue;
      }

      if (trimmed.startsWith('MESSAGE')) {
        // Support both CRLF and LF header separators
        let bodyIndex = trimmed.indexOf('\r\n\r\n');
        let headerOffset = 4;
        if (bodyIndex === -1) {
          bodyIndex = trimmed.indexOf('\n\n');
          headerOffset = 2;
        }

        if (bodyIndex === -1) continue;

        const body = trimmed.slice(bodyIndex + headerOffset).trim();
        if (!body) continue;

        try {
          const data = JSON.parse(body);

          const rawText = data.text !== undefined ? data.text : data.content;
          if (rawText !== undefined) {
            const msgId = data.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            if (this.processedMessageIds.has(msgId)) continue;
            this.processedMessageIds.add(msgId);

            const message: Message = {
              id: msgId,
              chatId: `chat-${data.receiverId || data.senderId}`,
              senderId: data.senderId,
              receiverId: data.receiverId,
              text: rawText,
              timestamp: data.timestamp || new Date().toISOString(),
              status: (data.status as MessageStatus) || 'delivered',
            };

            // Deliver to general message listeners
            this.messageListeners.forEach((fn) => {
              try { fn(message); } catch {}
            });

            // Deliver to room topic listener (matches both 10-digit and full-digit room IDs)
            const roomId = getChatRoomId(data.senderId, data.receiverId);
            const roomIdFull = getFullChatRoomId(data.senderId, data.receiverId);
            const cb1 = this.activeRoomSubscriptions.get(roomId);
            const cb2 = this.activeRoomSubscriptions.get(roomIdFull);
            if (cb1) {
              try { cb1(message); } catch {}
            }
            if (cb2 && cb2 !== cb1) {
              try { cb2(message); } catch {}
            }
          } else if (data.isTyping !== undefined && data.userId) {
            this.typingListeners.forEach((fn) => {
              try { fn({ userId: data.userId, isTyping: data.isTyping }); } catch {}
            });
          }
        } catch {
          // Ignored non-JSON STOMP frame body
        }
      }
    }
  }

  /**
   * Subscribes to a specific 1-to-1 conversation room topic: /topic/chat.{roomId}
   */
  subscribeToRoom(roomId: string, callback: MessageCallback, altRoomId?: string): () => void {
    const subId = `sub-room-${roomId}`;
    this.activeRoomSubscriptions.set(roomId, callback);

    if (this.isConnected) {
      this.safeSend(`SUBSCRIBE\nid:${subId}\ndestination:/topic/chat.${roomId}\n\n\0`);
    }

    let unsubAlt: (() => void) | null = null;
    if (altRoomId && altRoomId !== roomId) {
      const altSubId = `sub-room-${altRoomId}`;
      this.activeRoomSubscriptions.set(altRoomId, callback);
      if (this.isConnected) {
        this.safeSend(`SUBSCRIBE\nid:${altSubId}\ndestination:/topic/chat.${altRoomId}\n\n\0`);
      }
      unsubAlt = () => {
        this.activeRoomSubscriptions.delete(altRoomId);
        if (this.isConnected) {
          this.safeSend(`UNSUBSCRIBE\nid:${altSubId}\n\n\0`);
        }
      };
    }

    return () => {
      this.activeRoomSubscriptions.delete(roomId);
      if (this.isConnected) {
        this.safeSend(`UNSUBSCRIBE\nid:${subId}\n\n\0`);
      }
      unsubAlt?.();
    };
  }

  /**
   * Disconnect the active WebSocket connection
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
    }
    this.socket = null;
    this.isConnected = false;
    this.currentUserId = null;
    this.messageListeners.clear();
    this.typingListeners.clear();
    this.statusListeners.clear();
    this.messageStatusListeners.clear();
    this.activeRoomSubscriptions.clear();
    this.processedMessageIds.clear();
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Send a live message through the WebSocket STOMP tunnel
   */
  sendMessage(message: Message): void {
    this.processedMessageIds.add(message.id);

    if (!this.isConnected || !this.socket) {
      return;
    }

    const payload = JSON.stringify({
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      status: 'sent',
    });

    const frame = `SEND\ndestination:/app/chat.send\ncontent-type:application/json\n\n${payload}\0`;
    this.safeSend(frame);
  }

  sendTyping(receiverId: string, isTyping: boolean): void {
    if (!this.isConnected || !this.socket) return;

    const payload = JSON.stringify({
      receiverId,
      isTyping,
    });

    const frame = `SEND\ndestination:/app/chat.typing\ncontent-type:application/json\n\n${payload}\0`;
    this.safeSend(frame);
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  onTyping(callback: TypingCallback): () => void {
    this.typingListeners.add(callback);
    return () => {
      this.typingListeners.delete(callback);
    };
  }

  onStatusChange(callback: StatusChangeCallback): () => void {
    this.statusListeners.add(callback);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  onMessageStatus(callback: MessageStatusCallback): () => void {
    this.messageStatusListeners.add(callback);
    return () => {
      this.messageStatusListeners.delete(callback);
    };
  }

  emitMessage(message: Message): void {
    this.processedMessageIds.add(message.id);
    this.messageListeners.forEach((fn) => fn(message));
  }

  emitTyping(userId: string, isTyping: boolean): void {
    this.typingListeners.forEach((fn) => fn({ userId, isTyping }));
  }

  emitStatusChange(userId: string, isOnline: boolean): void {
    this.statusListeners.forEach((fn) => fn({ userId, isOnline }));
  }

  emitMessageStatus(messageId: string, status: MessageStatus): void {
    this.messageStatusListeners.forEach((fn) => fn({ messageId, status }));
  }
}

export const websocketService = new WebSocketService();
