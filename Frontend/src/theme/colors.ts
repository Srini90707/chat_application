export interface ThemeColors {
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryPressed: string;

  // Surfaces & Backgrounds
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;

  // Typography
  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textTertiary: string;

  // Form Controls & Borders
  border: string;
  borderLight: string;
  inputBackground: string;
  placeholder: string;

  // Chat Bubbles & Content
  messageSent: string;
  messageSentText: string;
  messageReceived: string;
  messageReceivedText: string;
  incomingMessage: string;
  incomingMessageText: string;
  outgoingMessage: string;
  outgoingMessageText: string;
  timestampIncoming: string;
  timestampOutgoing: string;
  dateSeparatorBg: string;
  dateSeparatorText: string;

  // Status & Feedback
  success: string;
  danger: string;
  error: string;
  warning: string;
  online: string;
  offline: string;
  typing: string;

  // Interactive & Badges
  badge: string;
  badgeText: string;
  icon: string;
  iconSecondary: string;
  ripple: string;

  // Invariants
  white: string;
  black: string;
}

export const lightColors: ThemeColors = {
  // Primary Blue Brand
  primary: '#1E70EB',
  primaryDark: '#1558B5',
  primaryLight: '#EFF6FF',
  primaryPressed: '#175CD3',

  // Clean White / Soft Cool-Gray Surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  card: '#FFFFFF',

  // High-Contrast Modern Slate Typography
  text: '#0F172A',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textTertiary: '#94A3B8',

  // Crisp Form Controls & Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  inputBackground: '#F8FAFC',
  placeholder: '#94A3B8',

  // Chat Colors: Brand Blue Sent / Soft Cool-Slate Received
  messageSent: '#1E70EB',
  messageSentText: '#FFFFFF',
  messageReceived: '#F1F5F9',
  messageReceivedText: '#0F172A',
  incomingMessage: '#F1F5F9',
  incomingMessageText: '#0F172A',
  outgoingMessage: '#1E70EB',
  outgoingMessageText: '#FFFFFF',
  timestampIncoming: '#64748B',
  timestampOutgoing: 'rgba(255, 255, 255, 0.85)',
  dateSeparatorBg: '#E2E8F0',
  dateSeparatorText: '#475569',

  // Status & Feedback
  success: '#10B981',
  danger: '#EF4444',
  error: '#EF4444',
  warning: '#F59E0B',
  online: '#10B981',
  offline: '#94A3B8',
  typing: '#1E70EB',

  // Badges & Actions
  badge: '#1E70EB',
  badgeText: '#FFFFFF',
  icon: '#1E70EB',
  iconSecondary: '#64748B',
  ripple: 'rgba(30, 112, 235, 0.12)',

  // Invariants
  white: '#FFFFFF',
  black: '#000000',
};

export const darkColors: ThemeColors = {
  // Electric Royal Blue on Dark Navy
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#1E293B',
  primaryPressed: '#1D4ED8',

  // Deep Navy Charcoal Surfaces (NOT pitch black)
  background: '#0B1120',
  surface: '#111C35',
  surfaceVariant: '#192646',
  card: '#111C35',

  // High-Contrast Clean White / Slate Typography
  text: '#F8FAFC',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textTertiary: '#64748B',

  // Dark Slate Borders & Inputs
  border: '#1E2D4A',
  borderLight: '#16233B',
  inputBackground: '#16233B',
  placeholder: '#64748B',

  // Chat Colors: Electric Blue Sent / Dark Navy Slate Received
  messageSent: '#2563EB',
  messageSentText: '#FFFFFF',
  messageReceived: '#192646',
  messageReceivedText: '#F8FAFC',
  incomingMessage: '#192646',
  incomingMessageText: '#F8FAFC',
  outgoingMessage: '#2563EB',
  outgoingMessageText: '#FFFFFF',
  timestampIncoming: '#94A3B8',
  timestampOutgoing: 'rgba(255, 255, 255, 0.85)',
  dateSeparatorBg: '#192646',
  dateSeparatorText: '#94A3B8',

  // Status & Feedback
  success: '#10B981',
  danger: '#F87171',
  error: '#F87171',
  warning: '#FBBF24',
  online: '#10B981',
  offline: '#64748B',
  typing: '#3B82F6',

  // Badges & Actions
  badge: '#2563EB',
  badgeText: '#FFFFFF',
  icon: '#3B82F6',
  iconSecondary: '#94A3B8',
  ripple: 'rgba(37, 99, 235, 0.18)',

  // Invariants
  white: '#FFFFFF',
  black: '#000000',
};

// Backwards-compatibility alias with existing src/constants/colors.ts
export const colors = lightColors;
export type ColorTokens = ThemeColors;
