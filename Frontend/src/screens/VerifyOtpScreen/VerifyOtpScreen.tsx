import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthButton,
  AuthError,
  AuthHeader,
  OTPInput,
} from '@/components/auth';
import { Avatar } from '@/components/common';
import { API_CONFIG } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/services/api/errorHandler';
import { authService } from '@/services/auth/authService';
import { notificationService } from '@/services/notification/notificationService';
import { useTheme, useThemedStyles } from '@/theme';
import { maskPhoneNumber } from '@/utils/phoneUtils';
import { validateName, validateOtp } from '@/utils/validation';
import { createStyles } from './VerifyOtpScreen.styles';

interface VerifyOtpScreenProps {
  mobileNumber: string;
  name?: string;
  mode?: 'login' | 'register';
}

export const VerifyOtpScreen: React.FC<VerifyOtpScreenProps> = ({
  mobileNumber,
  name: initialName = '',
}) => {
  const router = useRouter();
  const { login, register } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [step, setStep] = useState<'otp' | 'name'>('otp');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState(initialName);
  const [nameFocused, setNameFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(
    API_CONFIG.OTP_RESEND_COOLDOWN_SECONDS
  );
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const handleVerifyOtp = useCallback(
    async (codeToVerify?: string) => {
      if (loading) return;
      const code = codeToVerify || otp;
      const otpValidation = validateOtp(code);
      if (!otpValidation.isValid) {
        setError(otpValidation.error || 'Please enter the 6-digit OTP.');
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const result = await authService.verifyOtp(mobileNumber, otpValidation.value);

        if (!result.isNewUser && result.authResponse) {
          await login(result.authResponse.accessToken, result.authResponse.user);
          router.replace('/(main)');
        } else {
          setStep('name');
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Invalid OTP. Please check and try again.'));
        setOtp('');
      } finally {
        setLoading(false);
      }
    },
    [otp, mobileNumber, login, router, loading]
  );

  // Listen for user tapping or receiving the push notification with OTP
  useEffect(() => {
    const unsubscribe = notificationService.addNotificationResponseListener((receivedOtp) => {
      if (receivedOtp && receivedOtp.length === 6) {
        setOtp(receivedOtp);
        handleVerifyOtp(receivedOtp);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [handleVerifyOtp]);

  const handleCompleteRegistration = async () => {
    if (loading) return;
    setError(null);

    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setError(nameValidation.error || 'Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.completeRegistration(
        nameValidation.value,
        mobileNumber
      );
      await register(result.accessToken, result.user);
      router.replace('/(main)');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to complete registration. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setError(null);
    setResending(true);
    try {
      await authService.resendOtp(mobileNumber);
      setCountdown(API_CONFIG.OTP_RESEND_COOLDOWN_SECONDS);
      setOtp('');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to resend OTP. Try again.'));
    } finally {
      setResending(false);
    }
  };

  const formattedCountdown = `00:${countdown < 10 ? `0${countdown}` : countdown}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 'otp' ? (
            <>
              <AuthHeader
                title="Verify your number"
                subtitle={`Verification code sent via push notification to\n${maskPhoneNumber(mobileNumber)}`}
                onBack={() => router.back()}
              />

              {API_CONFIG.MOCK_AUTH && (
                <Text style={styles.demoHint}>
                  💡 Demo Mode: Enter OTP {API_CONFIG.MOCK_OTP_CODE} to proceed
                </Text>
              )}

              <AuthError message={error} />

              <OTPInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (error) setError(null);
                }}
                onComplete={(fullCode) => handleVerifyOtp(fullCode)}
                error={Boolean(error)}
                disabled={loading}
              />

              <AuthButton
                title="Verify"
                onPress={() => handleVerifyOtp()}
                loading={loading}
                disabled={otp.length !== 6}
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendPrompt}>{"Didn't receive the code?"}</Text>

                {countdown > 0 ? (
                  <View style={styles.timerBlock}>
                    <Text style={styles.resendDisabledText}>Resend OTP</Text>
                    <Text style={styles.countdownTimer}>{formattedCountdown}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResend}
                    disabled={resending}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.resendText}>
                      {resending ? 'Sending...' : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <>
              <AuthHeader
                title="What's your name? ✨"
                subtitle="Please enter your name to complete your registration"
                onBack={() => setStep('otp')}
              />

              <AuthError message={error} />

              <View style={styles.nameAvatarWrapper}>
                <Avatar
                  name={name.trim() || 'New User'}
                  size="xlarge"
                />
              </View>

              <View style={styles.nameInputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    nameFocused && styles.textInputFocused,
                    Boolean(error && name.trim().length < 2) && styles.textInputError,
                  ]}
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={theme.colors.placeholder}
                  autoCapitalize="words"
                  autoFocus
                  editable={!loading}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  accessibilityLabel="Full name input"
                />
              </View>

              <AuthButton
                title="Get Started"
                onPress={handleCompleteRegistration}
                loading={loading}
                disabled={name.trim().length < 2}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
