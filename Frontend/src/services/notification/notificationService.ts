import { Platform } from 'react-native';
import { USER_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/services/api/apiClient';
import { storageService } from '@/services/storage/storageService';

const PUSH_TOKEN_STORAGE_KEY = 'chat_device_push_token';

// Safe dynamic access to expo-notifications
let NotificationsModule: typeof import('expo-notifications') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  NotificationsModule = require('expo-notifications');
  if (NotificationsModule?.setNotificationHandler) {
    NotificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch {
  // Gracefully fallback if notifications native bridge is not available
}

class NotificationService {
  private registeredToken: string | null = null;
  private isRegistering: boolean = false;

  async registerForPushNotificationsAsync(userPhone?: string): Promise<string | null> {
    if (this.isRegistering) {
      if (this.registeredToken && userPhone) {
        await this.syncTokenWithBackend(userPhone, this.registeredToken);
      }
      return this.registeredToken;
    }

    this.isRegistering = true;
    try {
      // 1. Try to load cached token from persistent storage first
      if (!this.registeredToken) {
        const cached = await storageService.getItem(PUSH_TOKEN_STORAGE_KEY);
        if (cached) {
          this.registeredToken = cached;
          console.log('[NotificationService] Loaded cached push token:', cached);
        }
      }

      let token = '';

      if (NotificationsModule) {
        try {
          const { status: existingStatus } = await NotificationsModule.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await NotificationsModule.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus === 'granted') {
            // Android notification channel setup
            if (Platform.OS === 'android') {
              await NotificationsModule.setNotificationChannelAsync('default', {
                name: 'Chat Notifications',
                importance: NotificationsModule.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#0284C7',
                sound: 'default',
              });
            }

            // 1. Try native device token (FCM on Android / APNs on iOS)
            try {
              const deviceData = await NotificationsModule.getDevicePushTokenAsync();
              token = typeof deviceData.data === 'string' ? deviceData.data : JSON.stringify(deviceData.data);
              console.log('[NotificationService] Retrieved native device push token:', token);
            } catch (devErr) {
              console.log('[NotificationService] Native token retrieval fallback, requesting Expo push token...');
              try {
                const expoData = await NotificationsModule.getExpoPushTokenAsync({
                  projectId: '6390c828-06c6-431a-a912-b8283a0e06ca',
                });
                token = expoData.data;
                console.log('[NotificationService] Retrieved Expo push token:', token);
              } catch (expoErr) {
                console.warn('[NotificationService] Failed to get Expo push token:', expoErr);
              }
            }
          } else {
            console.log('[NotificationService] Notification permission status:', finalStatus);
          }
        } catch (permErr) {
          console.warn('[NotificationService] Permission or channel check failed:', permErr);
        }
      }

      // If native/Expo token was retrieved, use it; otherwise fallback to cached or persistent dev token
      if (token) {
        this.registeredToken = token;
        await storageService.setItem(PUSH_TOKEN_STORAGE_KEY, token);
      } else if (!this.registeredToken) {
        // Fallback token for emulators or dev environment without Google Play Services
        const cleanPhone = (userPhone || 'client').replace(/[^0-9]/g, '');
        const fallbackToken = `fcm_dev_${Platform.OS}_${cleanPhone}_${Math.random().toString(36).substring(2, 10)}`;
        this.registeredToken = fallbackToken;
        await storageService.setItem(PUSH_TOKEN_STORAGE_KEY, fallbackToken);
        console.log('[NotificationService] Generated persistent dev push token:', fallbackToken);
      }

      const activeToken = this.registeredToken;
      if (userPhone && activeToken) {
        await this.syncTokenWithBackend(userPhone, activeToken);
      }

      return activeToken;
    } catch (err) {
      console.warn('[NotificationService] Error in registerForPushNotificationsAsync:', err);
      return this.registeredToken;
    } finally {
      this.isRegistering = false;
    }
  }

  async syncTokenWithBackend(phoneNumber: string, token?: string): Promise<void> {
    const fcmToken = token || this.registeredToken;
    if (!fcmToken || !phoneNumber) {
      console.log('[NotificationService] Skipped sync: token or phoneNumber missing');
      return;
    }

    try {
      console.log(`[NotificationService] Registering token with backend for user: ${phoneNumber}...`);
      await apiClient.post(
        USER_ENDPOINTS.UPDATE_FCM_TOKEN,
        {
          number: phoneNumber.trim(),
          fcmToken: fcmToken.trim(),
        },
        { requiresAuth: false }
      );
      console.log(`[NotificationService] FCM token successfully saved in database for ${phoneNumber}!`);
    } catch (err) {
      console.warn('[NotificationService] Failed to sync FCM token with backend:', err);
    }
  }

  getRegisteredToken(): string | null {
    return this.registeredToken;
  }
}

export const notificationService = new NotificationService();
