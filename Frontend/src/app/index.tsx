import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Loading } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { Theme, useThemedStyles } from '@/theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default function IndexRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(main)');
      } else {
        router.replace('/(auth)/register');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <View style={styles.container}>
      <Loading message="Restoring session..." />
    </View>
  );
}
