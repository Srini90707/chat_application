import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import {
  Avatar,
  AppButton,
  LoadingView,
  ErrorView,
  ServerConfigModal,
} from '@/components/common';
import {
  ProfileHeader,
  ProfileInfoItem,
  ProfileMenuItem,
} from '@/components/profile';
import { serverConfigService } from '@/services/config/serverConfigService';
import { ThemeMode, useTheme, useThemedStyles } from '@/theme';
import { formatDisplayPhone } from '@/utils/phoneUtils';
import { createStyles } from './ProfileScreen.styles';

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => serverConfigService.getBaseUrl());

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)');
    }
  }, [router]);

  const handleEditProfile = useCallback(() => {
    router.push('/(main)/edit-profile');
  }, [router]);

  const handleSelectTheme = useCallback(
    async (mode: ThemeMode) => {
      await setThemeMode(mode);
      setShowThemeModal(false);
    },
    [setThemeMode]
  );

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [logout, router]);

  const handleNotificationPress = useCallback(() => {
    Alert.alert('Notifications', 'Push notification preferences can be configured in your system settings.');
  }, []);

  const handlePrivacyPress = useCallback(() => {
    Alert.alert('Privacy', 'End-to-end messaging privacy is active for all 1-to-1 chats.');
  }, []);

  const handleSettingsPress = useCallback(() => {
    Alert.alert('Settings', 'Chat backup and data management are automatically synced.');
  }, []);

  if (isLoading) {
    return <LoadingView message="Loading profile..." />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ProfileHeader title="Profile" onBack={handleBack} />
        <ErrorView
          message="Unable to load profile data."
          onRetry={handleBack}
          retryText="Return to Chats"
        />
      </SafeAreaView>
    );
  }

  const formattedPhone = formatDisplayPhone(user.mobileNumber);
  const userAbout = user.about?.trim() || 'Hey there! I am using ChatApp.';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProfileHeader
        title="Profile"
        onBack={handleBack}
        rightAction={
          <AppButton
            title="Edit"
            variant="text"
            size="small"
            onPress={handleEditProfile}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroAvatar}>
            <Avatar
              uri={user.avatar}
              name={user.name}
              size="xxl"
              showOnlineBadge={false}
            />
          </View>
          <Text style={styles.heroName}>{user.name}</Text>
          <Text style={styles.heroPhone}>{formattedPhone}</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Active Now</Text>
          </View>
        </View>

        {/* Profile Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.card}>
            <ProfileInfoItem label="Name" value={user.name} />
            <ProfileInfoItem label="Mobile" value={formattedPhone} />
            <ProfileInfoItem label="About" value={userAbout} isLast />
          </View>
        </View>

        {/* Account / Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Preferences</Text>
          <View style={styles.card}>
            <ProfileMenuItem
              iconName="person-outline"
              title="Edit Profile"
              subtitle="Update your name and photo"
              onPress={handleEditProfile}
            />
            <ProfileMenuItem
              iconName="color-palette-outline"
              title="Appearance"
              subtitle={themeMode === 'dark' ? 'Dark theme active' : 'Light theme active'}
              badge={themeMode === 'dark' ? '🌙 Dark' : '☀️ Light'}
              onPress={() => setShowThemeModal(true)}
            />
            <ProfileMenuItem
              iconName="notifications-outline"
              title="Notifications"
              subtitle="Sound, alerts & vibration"
              onPress={handleNotificationPress}
            />
            <ProfileMenuItem
              iconName="shield-checkmark-outline"
              title="Privacy"
              subtitle="Blocked contacts & permissions"
              onPress={handlePrivacyPress}
            />
            <ProfileMenuItem
              iconName="server-outline"
              title="Server Configuration"
              subtitle={serverUrl}
              onPress={() => setShowServerModal(true)}
            />
            <ProfileMenuItem
              iconName="settings-outline"
              title="Settings"
              subtitle="Chat preferences & data"
              onPress={handleSettingsPress}
              isLast
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <AppButton
            title="Log Out"
            variant="danger"
            onPress={handleLogout}
            accessibilityLabel="Log out of account"
          />
          <Text style={styles.versionText}>ChatApp v1.0.0 • Secure & Encrypted</Text>
        </View>
      </ScrollView>

      {/* In-App Theme Selector Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowThemeModal(false)}
        >
          <Pressable
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Theme</Text>
              <Text style={styles.modalSubtitle}>
                Select your preferred in-app appearance
              </Text>
            </View>

            <View style={styles.themeOptionList}>
              {/* Light Option */}
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'light' && styles.themeOptionSelected,
                ]}
                onPress={() => handleSelectTheme('light')}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ selected: themeMode === 'light' }}
                accessibilityLabel="Light theme: Clean and bright"
              >
                <Text style={styles.themeOptionEmoji}>☀️</Text>
                <View style={styles.themeOptionContent}>
                  <Text style={styles.themeOptionLabel}>Light Theme</Text>
                  <Text style={styles.themeOptionDesc}>Clean, crisp, and bright</Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    themeMode === 'light' && styles.radioCircleSelected,
                  ]}
                >
                  {themeMode === 'light' && (
                    <Ionicons name="checkmark" size={14} color={theme.colors.white} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Dark Option */}
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'dark' && styles.themeOptionSelected,
                ]}
                onPress={() => handleSelectTheme('dark')}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ selected: themeMode === 'dark' }}
                accessibilityLabel="Dark theme: Easier on the eyes"
              >
                <Text style={styles.themeOptionEmoji}>🌙</Text>
                <View style={styles.themeOptionContent}>
                  <Text style={styles.themeOptionLabel}>Dark Theme</Text>
                  <Text style={styles.themeOptionDesc}>
                    Deep navy tone, easier on the eyes
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    themeMode === 'dark' && styles.radioCircleSelected,
                  ]}
                >
                  {themeMode === 'dark' && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={theme.colors.white}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <AppButton
              title="Done"
              variant="secondary"
              size="medium"
              onPress={() => setShowThemeModal(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Backend Server Configuration Modal */}
      <ServerConfigModal
        visible={showServerModal}
        onClose={() => setShowServerModal(false)}
        onServerChanged={(newUrl) => setServerUrl(newUrl)}
      />
    </SafeAreaView>
  );
};
