import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AppInput, AppButton } from '@/components/common';
import { ProfileHeader } from '@/components/profile';
import { useTheme, useThemedStyles } from '@/theme';
import { formatDisplayPhone } from '@/utils/phoneUtils';
import { createStyles } from './EditProfileScreen.styles';

export const EditProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [name, setName] = useState(user?.name || '');
  const [about, setAbout] = useState(user?.about || '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty =
    name.trim() !== (user?.name || '').trim() ||
    about.trim() !== (user?.about || '').trim();

  const handleBack = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  }, [isDirty, router]);

  const handleChangePhoto = useCallback(() => {
    Alert.alert(
      'Profile Photo',
      'Choose a photo option:',
      [
        {
          text: 'Use Default Avatar',
          onPress: async () => {
            try {
              setIsSaving(true);
              await updateUser({ avatar: undefined });
              Alert.alert('Success', 'Profile photo reset to default.');
            } catch {
              Alert.alert('Error', 'Failed to update photo.');
            } finally {
              setIsSaving(false);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [updateUser]);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Full name is required.');
      return;
    }
    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters.');
      return;
    }
    setNameError(null);

    setIsSaving(true);
    try {
      await updateUser({
        name: trimmedName,
        about: about.trim(),
      });
      Alert.alert('Profile Updated', 'Your changes have been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Unable to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [name, about, updateUser, router]);

  const formattedPhone = formatDisplayPhone(user?.mobileNumber);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProfileHeader
        title="Edit Profile"
        onBack={handleBack}
        rightAction={
          <AppButton
            title="Save"
            variant="text"
            size="small"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving || !isDirty}
          />
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Avatar
              uri={user?.avatar}
              name={name || user?.name || ''}
              size="xxl"
              showEditBadge
              onEditPress={handleChangePhoto}
            />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleChangePhoto}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <AppInput
              label="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(null);
              }}
              placeholder="Enter your name"
              error={nameError || undefined}
              autoCapitalize="words"
              editable={!isSaving}
              maxLength={50}
              accessibilityLabel="Full name"
            />

            <AppInput
              label="Mobile Number"
              value={formattedPhone}
              editable={false}
              rightIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
              }
              accessibilityLabel="Mobile number read-only"
            />
            <Text style={styles.readOnlyHelper}>
              Mobile number is verified and cannot be changed.
            </Text>

            <AppInput
              label="About"
              value={about}
              onChangeText={setAbout}
              placeholder="Tell others about yourself"
              editable={!isSaving}
              maxLength={120}
              accessibilityLabel="About bio"
            />
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <AppButton
              title="Save Changes"
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving || !isDirty}
              accessibilityLabel="Save profile changes"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
