import { User } from './user';

export interface RegisterRequest {
  name: string;
  mobileNumber: string;
}

export interface VerifyRegisterOtpRequest {
  name: string;
  mobileNumber: string;
  otp: string;
}

export interface LoginRequest {
  mobileNumber: string;
}

export interface VerifyLoginOtpRequest {
  mobileNumber: string;
  otp: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  mobileNumber: string;
  cooldownSeconds?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface BackendUserDto {
  number: string;
  name: string;
}

export interface BackendAuthResponseDto {
  user: BackendUserDto;
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
}

export interface BackendOtpDto {
  number: string;
  otp: string;
}

export interface BackendJwtResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
}
