import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '@/screens';

export default function MainChatRoute() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  // If '+' was converted to space by router parameter decoding, restore '+'
  const raw = typeof userId === 'string' ? userId.trim() : '';
  const cleanUserId = raw.startsWith('+') ? raw : (raw ? `+${raw.replace(/^\+/, '')}` : '');

  return <ChatScreen userId={cleanUserId} />;
}
