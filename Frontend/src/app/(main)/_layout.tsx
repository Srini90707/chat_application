import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { Loading } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new-chat" />
      <Stack.Screen name="chat/[userId]" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
    </Stack>
  );
}
