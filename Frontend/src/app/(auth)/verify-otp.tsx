import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { VerifyOtpScreen } from '@/screens';

export default function VerifyOtpRoute() {
  const params = useLocalSearchParams<{
    mode?: string;
    mobileNumber?: string;
    name?: string;
  }>();

  return (
    <VerifyOtpScreen
      mode={(params.mode as 'login' | 'register') || 'login'}
      mobileNumber={params.mobileNumber || ''}
      name={params.name || ''}
    />
  );
}
