import { API_CONFIG } from '@/config/api';
import { ApiError } from '@/services/api/apiError';
import { storageService } from '@/services/storage/storageService';
import { websocketService } from '@/services/websocket/websocketService';
import {
  AuthResponse,
  SendOtpResponse,
  VerifyLoginOtpRequest,
  VerifyRegisterOtpRequest,
} from '@/types/auth';
import { User } from '@/types/user';
import {
  validateName,
  validateOtp,
  validatePhone,
} from '@/utils/validation';
import { notificationService } from '@/services/notification/notificationService';
import { authApi } from './authApi';

// Mock storage for registered users in demo mode
interface MockUserEntry {
  id: string;
  name: string;
  mobileNumber: string;
  avatar?: string;
}

const mockRegisteredUsers: Map<string, MockUserEntry> = new Map([
  [
    '+919876543210',
    {
      id: 'user-me',
      name: 'Alex Johnson',
      mobileNumber: '+919876543210',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  ],
]);

// Track OTP verification attempts per phone number
const mockAttempts: Map<string, number> = new Map();
// Track OTP expiration timestamps
const mockOtpExpiry: Map<string, number> = new Map();

class AuthService {
  async sendOtp(rawMobile: string): Promise<SendOtpResponse> {
    const phoneCheck = validatePhone(rawMobile);
    if (!phoneCheck.isValid) {
      throw new ApiError(phoneCheck.error || 'Please enter a valid mobile number.', 400, 'INVALID_PHONE');
    }

    const mobileNumber = phoneCheck.value;

    // 1. Ensure push notification permissions & obtain token
    let fcmToken: string | null = null;
    try {
      fcmToken = await notificationService.registerForPushNotificationsAsync(mobileNumber);
    } catch {
      // Continue even if initial registration encounters warning
    }

    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      mockAttempts.set(mobileNumber, 0);
      mockOtpExpiry.set(mobileNumber, Date.now() + 5 * 60 * 1000);

      // Present instant push notification on the device with demo OTP
      await notificationService.presentOtpNotification(API_CONFIG.MOCK_OTP_CODE);

      return {
        success: true,
        message: 'OTP sent successfully via push notification.',
        mobileNumber,
        cooldownSeconds: API_CONFIG.OTP_RESEND_COOLDOWN_SECONDS,
      };
    }

    const otpRes = await authApi.generateOtp(mobileNumber, fcmToken);

    // Present instant push notification on the device with generated OTP
    if (otpRes?.otp) {
      await notificationService.presentOtpNotification(otpRes.otp);
    }

    return {
      success: true,
      message: 'OTP sent successfully via push notification.',
      mobileNumber,
      cooldownSeconds: API_CONFIG.OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  async verifyOtp(
    rawMobile: string,
    rawOtp: string
  ): Promise<{ isNewUser: boolean; authResponse?: AuthResponse }> {
    const phoneCheck = validatePhone(rawMobile);
    const mobileNumber = phoneCheck.value;

    const otpCheck = validateOtp(rawOtp);
    if (!otpCheck.isValid) {
      throw new ApiError(otpCheck.error || 'Please enter the 6-digit OTP.', 400, 'INVALID_OTP');
    }

    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      this.validateMockOtp(mobileNumber, otpCheck.value);

      const existingUser = mockRegisteredUsers.get(mobileNumber);
      if (existingUser) {
        const user: User = {
          id: existingUser.id,
          name: existingUser.name,
          avatar: existingUser.avatar,
          isOnline: true,
          unreadCount: 0,
        };

        const authResponse: AuthResponse = {
          accessToken: `mock_jwt_token_${Date.now()}`,
          refreshToken: `mock_refresh_token_${Date.now()}`,
          user,
        };

        await storageService.saveAuthSession(
          authResponse.accessToken,
          authResponse.user,
          authResponse.refreshToken
        );

        return { isNewUser: false, authResponse };
      }

      return { isNewUser: true };
    }

    try {
      const isValid = await authApi.verifyOtp(mobileNumber, otpCheck.value);
      if (!isValid) {
        throw new ApiError('Invalid or expired OTP. Please check and try again.', 400, 'INVALID_OTP');
      }

      const exists = await authApi.checkUserExists(mobileNumber);
      if (exists) {
        const response = await authApi.loginUser(mobileNumber);
        await storageService.saveAuthSession(
          response.accessToken,
          response.user,
          response.refreshToken
        );
        return { isNewUser: false, authResponse: response };
      }

      return { isNewUser: true };
    } catch (err: unknown) {
      if (ApiError.isApiError(err) && (err.statusCode === 404 || err.code === 'USER_NOT_FOUND')) {
        return { isNewUser: true };
      }
      throw err;
    }
  }

  async completeRegistration(name: string, rawMobile: string): Promise<AuthResponse> {
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      throw new ApiError(nameCheck.error || 'Please enter your full name.', 400, 'VALIDATION_ERROR');
    }

    const phoneCheck = validatePhone(rawMobile);
    const mobileNumber = phoneCheck.value;

    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const newUserId = `user-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        name: nameCheck.value,
        isOnline: true,
        unreadCount: 0,
      };

      mockRegisteredUsers.set(mobileNumber, {
        id: newUserId,
        name: nameCheck.value,
        mobileNumber,
      });

      const authResponse: AuthResponse = {
        accessToken: `mock_jwt_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        user: newUser,
      };

      await storageService.saveAuthSession(
        authResponse.accessToken,
        authResponse.user,
        authResponse.refreshToken
      );

      return authResponse;
    }

    const response = await authApi.registerUser(mobileNumber, nameCheck.value);
    await storageService.saveAuthSession(
      response.accessToken,
      response.user,
      response.refreshToken
    );
    return response;
  }

  async sendRegisterOtp(name: string, rawMobile: string): Promise<SendOtpResponse> {
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      throw new ApiError(nameCheck.error || 'Invalid name.', 400, 'VALIDATION_ERROR');
    }

    const phoneCheck = validatePhone(rawMobile);
    if (!phoneCheck.isValid) {
      throw new ApiError(phoneCheck.error || 'Invalid phone number.', 400, 'INVALID_PHONE');
    }

    const mobileNumber = phoneCheck.value;

    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reset attempts and set expiration (5 minutes from now)
      mockAttempts.set(mobileNumber, 0);
      mockOtpExpiry.set(mobileNumber, Date.now() + 5 * 60 * 1000);

      return {
        success: true,
        message: 'OTP sent successfully to your mobile number.',
        mobileNumber,
        cooldownSeconds: API_CONFIG.OTP_RESEND_COOLDOWN_SECONDS,
      };
    }

    return authApi.sendRegisterOtp({ name: nameCheck.value, mobileNumber });
  }

  /**
   * Verify registration OTP and create user account
   */
  async verifyRegisterOtp(data: VerifyRegisterOtpRequest): Promise<AuthResponse> {
    const phoneCheck = validatePhone(data.mobileNumber);
    const mobileNumber = phoneCheck.value;
    const trimmedName = data.name.trim();

    const otpCheck = validateOtp(data.otp);
    if (!otpCheck.isValid) {
      throw new ApiError(otpCheck.error || 'Invalid OTP.', 400, 'INVALID_OTP');
    }

    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      this.validateMockOtp(mobileNumber, otpCheck.value);

      const newUserId = `user-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        name: trimmedName,
        isOnline: true,
        unreadCount: 0,
      };

      mockRegisteredUsers.set(mobileNumber, {
        id: newUserId,
        name: trimmedName,
        mobileNumber,
      });

      const authResponse: AuthResponse = {
        accessToken: `mock_jwt_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        user: newUser,
      };

      await storageService.saveAuthSession(
        authResponse.accessToken,
        authResponse.user,
        authResponse.refreshToken
      );

      return authResponse;
    }

    const response = await authApi.verifyRegisterOtp({
      name: trimmedName,
      mobileNumber,
      otp: otpCheck.value,
    });

    await storageService.saveAuthSession(
      response.accessToken,
      response.user,
      response.refreshToken
    );

    return response;
  }

  /**
   * Request OTP for existing user login
   */
  async sendLoginOtp(rawMobile: string): Promise<SendOtpResponse> {
    const phoneCheck = validatePhone(rawMobile);
    if (!phoneCheck.isValid) {
      throw new ApiError(phoneCheck.error || 'Invalid phone number.', 400, 'INVALID_PHONE');
    }

    const mobileNumber = phoneCheck.value;

    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      mockAttempts.set(mobileNumber, 0);
      mockOtpExpiry.set(mobileNumber, Date.now() + 5 * 60 * 1000);

      return {
        success: true,
        message: 'OTP sent successfully to your mobile number.',
        mobileNumber,
        cooldownSeconds: API_CONFIG.OTP_RESEND_COOLDOWN_SECONDS,
      };
    }

    return authApi.sendLoginOtp({ mobileNumber });
  }

  /**
   * Verify login OTP and authenticate user
   */
  async verifyLoginOtp(data: VerifyLoginOtpRequest): Promise<AuthResponse> {
    const phoneCheck = validatePhone(data.mobileNumber);
    const mobileNumber = phoneCheck.value;

    const otpCheck = validateOtp(data.otp);
    if (!otpCheck.isValid) {
      throw new ApiError(otpCheck.error || 'Invalid OTP.', 400, 'INVALID_OTP');
    }

    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      this.validateMockOtp(mobileNumber, otpCheck.value);

      const entry = mockRegisteredUsers.get(mobileNumber) || {
        id: 'user-me',
        name: 'Alex Johnson',
        mobileNumber,
      };

      const user: User = {
        id: entry.id,
        name: entry.name,
        avatar: entry.avatar,
        isOnline: true,
        unreadCount: 0,
      };

      const authResponse: AuthResponse = {
        accessToken: `mock_jwt_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        user,
      };

      await storageService.saveAuthSession(
        authResponse.accessToken,
        authResponse.user,
        authResponse.refreshToken
      );

      return authResponse;
    }

    const response = await authApi.verifyLoginOtp({
      mobileNumber,
      otp: otpCheck.value,
    });

    await storageService.saveAuthSession(
      response.accessToken,
      response.user,
      response.refreshToken
    );

    return response;
  }

  /**
   * Resend OTP for either registration or login
   */
  async resendOtp(rawMobile: string): Promise<SendOtpResponse> {
    const phoneCheck = validatePhone(rawMobile);
    const mobileNumber = phoneCheck.value;

    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      mockAttempts.set(mobileNumber, 0);
      mockOtpExpiry.set(mobileNumber, Date.now() + 5 * 60 * 1000);

      return {
        success: true,
        message: 'A new 6-digit OTP has been sent.',
        mobileNumber,
        cooldownSeconds: API_CONFIG.OTP_RESEND_COOLDOWN_SECONDS,
      };
    }

    return authApi.resendOtp(mobileNumber);
  }

  /**
   * Terminate active session and disconnect real-time services
   */
  async logout(): Promise<void> {
    try {
      websocketService.disconnect();
      await storageService.clearAuthSession();
      if (!API_CONFIG.MOCK_AUTH) {
        await authApi.logout();
      }
    } catch {
      // Ensure local state clears regardless of API failure
    }
  }

  private validateMockOtp(mobileNumber: string, otp: string): void {
    const attempts = mockAttempts.get(mobileNumber) || 0;
    if (attempts >= API_CONFIG.MAX_OTP_ATTEMPTS) {
      throw new ApiError(
        'Too many failed attempts. Please request a new OTP.',
        429,
        'TOO_MANY_ATTEMPTS'
      );
    }

    const expiry = mockOtpExpiry.get(mobileNumber);
    if (expiry && Date.now() > expiry) {
      throw new ApiError(
        'The OTP has expired. Please request a new OTP.',
        400,
        'OTP_EXPIRED'
      );
    }

    if (otp !== API_CONFIG.MOCK_OTP_CODE) {
      mockAttempts.set(mobileNumber, attempts + 1);
      const remaining = API_CONFIG.MAX_OTP_ATTEMPTS - (attempts + 1);
      throw new ApiError(
        `Invalid OTP. (Demo OTP is ${API_CONFIG.MOCK_OTP_CODE}). ${remaining} attempt(s) remaining.`,
        400,
        'INVALID_OTP'
      );
    }

    mockAttempts.delete(mobileNumber);
    mockOtpExpiry.delete(mobileNumber);
  }
}

export const authService = new AuthService();
