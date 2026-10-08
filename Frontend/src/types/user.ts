export interface User {
  id: string;
  name: string;
  mobileNumber?: string;
  avatar?: string;
  about?: string;
  isOnline: boolean;
  isTyping?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface UserSearchResult {
  id: string;
  name: string;
  mobileNumber: string;
  avatar?: string;
  about?: string;
  isOnline: boolean;
}

export type UserStatus = 'online' | 'offline' | 'typing';
