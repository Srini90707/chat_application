import { AUTH_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/services/api/apiClient';
import { ApiError } from '@/services/api/apiError';
import { notificationService } from '@/services/notification/notificationService';
import {
  AuthResponse,
  BackendAuthResponseDto,
  BackendJwtResponseDto,
  BackendOtpDto,
  BackendUserDto,
  LoginRequest,
  RegisterRequest,
  SendOtpResponse,
  VerifyLoginOtpRequest,
  VerifyRegisterOtpRequest,
} from '@/types/auth';

export { ApiError as AuthApiError };

class AuthApi {
  async refreshTokens(refreshToken: string): Promise<BackendJwtResponseDto> {
    return apiClient.post<BackendJwtResponseDto>(
      AUTH_ENDPOINTS.JWT_REFRESH,
      { refreshToken },
      { requiresAuth: false }
    );
  }

  async generateOtp(number: string): Promise<BackendOtpDto> {
    return apiClient.post<BackendOtpDto>(
      `${AUTH_ENDPOINTS.OTP_GENERATE}/${encodeURIComponent(number)}`,
      undefined,
      { requiresAuth: false }
    );
  }

  async verifyOtp(number: string, otp: string): Promise<boolean> {
    return apiClient.post<boolean>(
      AUTH_ENDPOINTS.OTP_VERIFY,
      { number, otp },
      { requiresAuth: false }
    );
  }

  async registerUser(number: string, name: string, fcmToken?: string | null): Promise<AuthResponse> {
    const token = fcmToken || notificationService.getRegisteredToken() || undefined;
    const res = await apiClient.post<BackendAuthResponseDto>(
      AUTH_ENDPOINTS.USER_REGISTER,
      {
        number,
        name,
        ...(token ? { fcmToken: token } : {}),
      },
      { requiresAuth: false }
    );

    // Ensure backend is synced
    if (token) {
      notificationService.syncTokenWithBackend(res.user.number, token);
    }

    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      user: {
        id: res.user.number,
        name: res.user.name,
        mobileNumber: res.user.number,
        isOnline: true,
        unreadCount: 0,
      },
    };
  }

  async loginUser(number: string, fcmToken?: string | null): Promise<AuthResponse> {
    const token = fcmToken || notificationService.getRegisteredToken() || undefined;
    const res = await apiClient.post<BackendAuthResponseDto>(
      AUTH_ENDPOINTS.USER_LOGIN,
      {
        number,
        ...(token ? { fcmToken: token } : {}),
      },
      { requiresAuth: false }
    );

    // Ensure backend is synced
    if (token) {
      notificationService.syncTokenWithBackend(res.user.number, token);
    }

    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      user: {
        id: res.user.number,
        name: res.user.name,
        mobileNumber: res.user.number,
        isOnline: true,
        unreadCount: 0,
      },
    };
  }

  async checkUserExists(number: string): Promise<boolean> {
    try {
      const res = await apiClient.get<BackendUserDto>(
        `${AUTH_ENDPOINTS.USER_RETRIVE}/${encodeURIComponent(number)}`,
        { requiresAuth: false }
      );
      return Boolean(res && res.number);
    } catch (err: unknown) {
      if (ApiError.isApiError(err) && err.statusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  async sendRegisterOtp(data: RegisterRequest): Promise<SendOtpResponse> {
    await this.generateOtp(data.mobileNumber);
    return {
      success: true,
      message: 'OTP generated and sent successfully.',
      mobileNumber: data.mobileNumber,
    };
  }

  async verifyRegisterOtp(data: VerifyRegisterOtpRequest): Promise<AuthResponse> {
    return this.registerUser(data.mobileNumber, data.name);
  }

  async sendLoginOtp(data: LoginRequest): Promise<SendOtpResponse> {
    await this.generateOtp(data.mobileNumber);
    return {
      success: true,
      message: 'OTP generated and sent successfully.',
      mobileNumber: data.mobileNumber,
    };
  }

  async verifyLoginOtp(data: VerifyLoginOtpRequest): Promise<AuthResponse> {
    return this.loginUser(data.mobileNumber);
  }

  async resendOtp(mobileNumber: string): Promise<SendOtpResponse> {
    await this.generateOtp(mobileNumber);
    return {
      success: true,
      message: 'New OTP generated successfully.',
      mobileNumber,
    };
  }

  async logout(): Promise<void> {
    // Stateless JWT: simply discard locally
  }
}

export const authApi = new AuthApi();
