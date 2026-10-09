import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { USER_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/services/api/apiClient';
import { storageService } from '@/services/storage/storageService';

const PUSH_TOKEN_STORAGE_KEY = 'chat_device_push_token';

// Configure foreground notification presentation handler
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Ignored if notifications handler setup is delayed
}

const isValidFcmToken = (token?: string | null): boolean => {
  return Boolean(
    token &&
    typeof token === 'string' &&
    !token.startsWith('fcm_dev_') &&
    token.trim().length > 20
  );
};

class NotificationService {
  private registeredToken: string | null = null;
  private isRegistering: boolean = false;

  /**
   * Initializes notification channels and requests permissions
   */
  private async setupAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Chat Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0284C7',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      } catch (e) {
        console.warn('[NotificationService] Failed to create Android notification channel:', e);
      }
    }
  }

  /**
   * Obtains the native FCM device push token and registers it with the backend
   */
  async registerForPushNotificationsAsync(userPhone?: string): Promise<string | null> {
    if (this.isRegistering) {
      if (isValidFcmToken(this.registeredToken) && userPhone) {
        await this.syncTokenWithBackend(userPhone, this.registeredToken!);
      }
      return this.registeredToken;
    }

    this.isRegistering = true;
    try {
      await this.setupAndroidChannel();

      // 1. Check cached token - only accept real FCM tokens, discard fake dev tokens
      if (!isValidFcmToken(this.registeredToken)) {
        const cached = await storageService.getItem(PUSH_TOKEN_STORAGE_KEY);
        if (isValidFcmToken(cached)) {
          this.registeredToken = cached;
          console.log('[NotificationService] Loaded valid cached push token');
        } else if (cached) {
          // Clear legacy dummy token so native token is requested
          console.log('[NotificationService] Purging outdated dummy token:', cached);
          await storageService.deleteItem(PUSH_TOKEN_STORAGE_KEY).catch(() => {});
          this.registeredToken = null;
        }
      }

      // 2. Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[NotificationService] Notification permission not granted');
      }

      // 3. Obtain real native FCM device token
      let freshToken = '';
      try {
        const deviceData = await Notifications.getDevicePushTokenAsync();
        const rawToken = typeof deviceData.data === 'string' ? deviceData.data : JSON.stringify(deviceData.data);
        if (isValidFcmToken(rawToken)) {
          freshToken = rawToken.trim();
          console.log('[NotificationService] Successfully retrieved native device push token');
        }
      } catch (devErr) {
        console.log('[NotificationService] Native getDevicePushToken failed, trying getExpoPushToken fallback...', devErr);
        try {
          const expoData = await Notifications.getExpoPushTokenAsync({
            projectId: '6390c828-06c6-431a-a912-b8283a0e06ca',
          });
          if (isValidFcmToken(expoData.data)) {
            freshToken = expoData.data.trim();
            console.log('[NotificationService] Successfully retrieved Expo push token');
          }
        } catch (expoErr) {
          console.warn('[NotificationService] Failed to retrieve push token:', expoErr);
        }
      }

      // 4. Save and sync if valid token was obtained
      if (isValidFcmToken(freshToken)) {
        this.registeredToken = freshToken;
        await storageService.setItem(PUSH_TOKEN_STORAGE_KEY, freshToken);
        console.log('[NotificationService] Real FCM token persisted locally');
      }

      // 5. Sync with backend if phone number provided
      if (userPhone && isValidFcmToken(this.registeredToken)) {
        await this.syncTokenWithBackend(userPhone, this.registeredToken!);
      }

      return this.registeredToken;
    } catch (err) {
      console.warn('[NotificationService] Error in registerForPushNotificationsAsync:', err);
      return this.registeredToken;
    } finally {
      this.isRegistering = false;
    }
  }

  /**
   * Syncs the FCM token with the backend database
   */
  async syncTokenWithBackend(phoneNumber: string, token?: string): Promise<void> {
    const fcmToken = token || this.registeredToken;
    if (!isValidFcmToken(fcmToken) || !phoneNumber) {
      console.log('[NotificationService] Skipped sync: valid token or phoneNumber missing');
      return;
    }

    try {
      console.log(`[NotificationService] Registering token with backend for user: ${phoneNumber}...`);
      await apiClient.post(
        USER_ENDPOINTS.UPDATE_FCM_TOKEN,
        {
          number: phoneNumber.trim(),
          fcmToken: fcmToken!.trim(),
        },
        { requiresAuth: false }
      );
      console.log(`[NotificationService] FCM token successfully saved in database for ${phoneNumber}!`);
    } catch (err) {
      console.warn('[NotificationService] Failed to sync FCM token with backend:', err);
    }
  }

  getRegisteredToken(): string | null {
    return isValidFcmToken(this.registeredToken) ? this.registeredToken : null;
  }

  /**
   * Triggers an instant high-priority push notification containing the OTP verification code.
   */
  async presentOtpNotification(otp: string): Promise<void> {
    try {
      await this.setupAndroidChannel();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💬 Verification Code',
          body: `Your verification code is: ${otp}. Do not share this code with anyone.`,
          data: { type: 'otp', otp },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log(`[NotificationService] Push notification presented with OTP: ${otp}`);
    } catch (err) {
      console.warn('[NotificationService] Error presenting OTP notification:', err);
    }
  }

  /**
   * Triggers a local chat message notification when a message arrives
   */
  async presentChatMessageNotification(
    senderName: string,
    messageText: string,
    data: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await this.setupAndroidChannel();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: senderName || '💬 New Message',
          body: messageText || 'You received a new message',
          data: { type: 'chat', ...data },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (err) {
      console.warn('[NotificationService] Error presenting chat notification:', err);
    }
  }

  /**
   * Listen for user tapping the OTP push notification
   */
  addNotificationResponseListener(callback: (otp: string) => void): (() => void) | undefined {
    try {
      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const otp = response.notification.request.content.data?.otp;
        if (otp && typeof otp === 'string') {
          callback(otp);
        }
      });

      return () => {
        subscription.remove();
      };
    } catch {
      return undefined;
    }
  }
}

export const notificationService = new NotificationService();
