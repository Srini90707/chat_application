import React, { useEffect } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { notificationService } from '@/services/notification/notificationService';
import { AppThemeProvider, useTheme } from '@/theme';

function AppNavigation() {
  const { isDark } = useTheme();

  useEffect(() => {
    // Pre-initialize push notifications so device token is ready before auth
    notificationService.registerForPushNotificationsAsync();
  }, []);

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </AppThemeProvider>
  );
}
