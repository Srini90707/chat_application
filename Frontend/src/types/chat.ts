import { User } from './user';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageType = 'text' | 'image' | 'pdf' | 'document';

export interface Message {
  id: string;
  chatId?: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  messageType?: MessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
}

export interface Conversation {
  id: string;
  partner: User;
  lastMessage?: Message;
  unreadCount: number;
}

export interface CreateChatRequest {
  userId: string;
}

export interface CreateChatResponse {
  chatId: string;
  conversation?: Conversation;
  isNew?: boolean;
}

export type { User };
