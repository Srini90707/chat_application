import { Message, User } from '@/types/chat';

export const CURRENT_USER: User = {
  id: 'user-me',
  name: 'Alex Johnson',
  mobileNumber: '+919123456789',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isOnline: true,
  isTyping: false,
  unreadCount: 0,
};

const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3600 * 1000).toISOString();
const daysAgo = (days: number, hours = 0) =>
  new Date(now.getTime() - (days * 24 + hours) * 3600 * 1000).toISOString();

export const INITIAL_USERS: User[] = [
  {
    id: 'user-secondary',
    name: 'Rahul Sharma',
    mobileNumber: '+919876543210',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    about: 'Hey there! I am using Chat.',
    isOnline: true,
    isTyping: false,
    lastMessage: 'Let’s catch up tomorrow morning.',
    lastMessageTime: daysAgo(1, 4),
    unreadCount: 0,
  },
  {
    id: 'user-partner',
    name: 'Sarah Miller',
    mobileNumber: '+919876543211',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    about: 'Design Systems & Product Engineering',
    isOnline: true,
    isTyping: false,
    lastMessage: "I've reviewed the design specs and left feedback on Figma!",
    lastMessageTime: minutesAgo(8),
    unreadCount: 2,
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    mobileNumber: '+919876543212',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    about: 'Available for sync',
    isOnline: false,
    isTyping: false,
    lastMessage: 'Thanks for the quick update!',
    lastMessageTime: daysAgo(2, 1),
    unreadCount: 0,
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'user-partner': [
    {
      id: 'm-1',
      senderId: 'user-partner',
      receiverId: 'user-me',
      text: 'Hey Alex! Did you manage to check the latest mobile prototype we discussed yesterday?',
      timestamp: daysAgo(1, 2),
      status: 'read',
    },
    {
      id: 'm-2',
      senderId: 'user-me',
      receiverId: 'user-partner',
      text: 'Yes! The interaction flow looks super clean. The animations are crisp and responsive.',
      timestamp: daysAgo(1, 1),
      status: 'read',
    },
    {
      id: 'm-3',
      senderId: 'user-me',
      receiverId: 'user-partner',
      text: 'One quick note on the chat bubbles: let us make sure we support really long multi-paragraph messages with nice padding and proper wrapping on small screens as well as large tablets.',
      timestamp: daysAgo(1, 1),
      status: 'read',
    },
    {
      id: 'm-4',
      senderId: 'user-partner',
      receiverId: 'user-me',
      text: 'Totally agree. I updated the bubble border radius tokens and contrast ratios this morning.',
      timestamp: hoursAgo(3),
      status: 'read',
    },
    {
      id: 'm-5',
      senderId: 'user-me',
      receiverId: 'user-partner',
      text: 'Awesome. Are all Figma components aligned with the design system?',
      timestamp: hoursAgo(1),
      status: 'delivered',
    },
    {
      id: 'm-6',
      senderId: 'user-partner',
      receiverId: 'user-me',
      text: "I've reviewed the design specs and left feedback on Figma!",
      timestamp: minutesAgo(8),
      status: 'sent',
    },
  ],
  'user-secondary': [
    {
      id: 'm-sec-1',
      senderId: 'user-me',
      receiverId: 'user-secondary',
      text: 'Hi Rahul, do you have time for a sync today?',
      timestamp: daysAgo(1, 5),
      status: 'read',
    },
    {
      id: 'm-sec-2',
      senderId: 'user-secondary',
      receiverId: 'user-me',
      text: 'Let’s catch up tomorrow morning.',
      timestamp: daysAgo(1, 4),
      status: 'read',
    },
  ],
};
