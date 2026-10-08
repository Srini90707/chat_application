import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthButton,
  AuthError,
  AuthHeader,
  PhoneInput,
} from '@/components/auth';
import { ServerConfigModal } from '@/components/common';
import {
  getErrorMessage,
  isNetworkOrServerConnectivityError,
} from '@/services/api/errorHandler';
import { authService } from '@/services/auth/authService';
import { useThemedStyles } from '@/theme';
import { validatePhone } from '@/utils/validation';
import { createStyles } from './LoginScreen.styles';

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnectivityError, setIsConnectivityError] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);

  const handleContinue = async () => {
    if (loading) return;
    setError(null);
    setIsConnectivityError(false);

    const validation = validatePhone(mobileNumber);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    try {
      await authService.sendLoginOtp(validation.value);

      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          mode: 'login',
          mobileNumber: validation.value,
        },
      });
    } catch (err: unknown) {
      const isConn = isNetworkOrServerConnectivityError(err);
      setIsConnectivityError(isConn);
      setError(getErrorMessage(err, 'Unable to send OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.replace('/(auth)/register');
  };

  const isFormValid = mobileNumber.length === 10;

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
          <View style={styles.formContainer}>
            <AuthHeader
              showLogo
              title="Welcome Back 👋"
              subtitle="Sign in to continue chatting"
              onLogoLongPress={() => setShowServerConfig(true)}
            />

            <AuthError
              message={error}
              actionLabel={isConnectivityError ? 'Tap to change Server IP / URL' : undefined}
              onAction={isConnectivityError ? () => setShowServerConfig(true) : undefined}
            />

            <PhoneInput
              value={mobileNumber}
              onChangeText={(val) => {
                setMobileNumber(val);
                if (error) setError(null);
              }}
              label="Mobile Number"
              placeholder="Enter mobile number"
              disabled={loading}
            />

            <AuthButton
              title="Continue"
              onPress={handleContinue}
              loading={loading}
              disabled={!isFormValid}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{"Don't have an account?"}</Text>
            <TouchableOpacity
              onPress={navigateToRegister}
              disabled={loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ServerConfigModal
        visible={showServerConfig}
        onClose={() => setShowServerConfig(false)}
      />
    </SafeAreaView>
  );
};
