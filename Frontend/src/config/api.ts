export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.88.8:8085',
  TIMEOUT_MS: 15000,
  MOCK_AUTH: false,
  MOCK_OTP_CODE: '123456',
  OTP_RESEND_COOLDOWN_SECONDS: 45,
  MAX_OTP_ATTEMPTS: 5,
};

export const AUTH_ENDPOINTS = {
  OTP_GENERATE: '/otp/generate',
  OTP_VERIFY: '/otp/verify',
  USER_REGISTER: '/user/register',
  USER_LOGIN: '/user/login',
  USER_RETRIVE: '/user/retrive',
  JWT_REFRESH: '/jwt/refresh',
};

export const USER_ENDPOINTS = {
  SEARCH_BY_MOBILE: '/user/search',
  GET_USER_BY_ID: '/user/retrive',
  GET_USER_BY_NUMBER: '/user/retrive',
  UPDATE_USER: '/user/update',
  GET_ALL_USERS: '/user/all',
  UPDATE_FCM_TOKEN: '/user/fcm-token',
};

export const CHAT_ENDPOINTS = {
  CHATS: '/chats',
  MESSAGES: '/messages',
};

export const MEDIA_ENDPOINTS = {
  UPLOAD: '/media/upload',
};
