import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
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
import { Ionicons } from '@expo/vector-icons';
import { UserSearchItem } from '@/components/chat';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/services/api/errorHandler';
import { chatService } from '@/services/chat/chatService';
import { userService } from '@/services/user/userService';
import { useTheme, useThemedStyles } from '@/theme';
import { UserSearchResult } from '@/types/user';
import { formatDisplayPhone } from '@/utils/phoneUtils';
import { validatePhone } from '@/utils/validation';
import { createStyles } from './NewChatScreen.styles';

export const NewChatScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user: currentUser } = useAuth();

  const [mobileInput, setMobileInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [foundUser, setFoundUser] = useState<UserSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Prevent duplicate taps while a search is executing
  const isSearchingRef = useRef(false);

  const handleInputChange = (text: string) => {
    // Only accept numeric characters
    const numeric = text.replace(/[^\d]/g, '').slice(0, 10);
    setMobileInput(numeric);
    if (error) setError(null);
    if (hasSearched) {
      setHasSearched(false);
      setFoundUser(null);
    }
  };

  const handleClear = () => {
    setMobileInput('');
    setError(null);
    setFoundUser(null);
    setHasSearched(false);
  };

  const handleSearch = useCallback(async () => {
    if (isSearchingRef.current || loading) return;

    Keyboard.dismiss();
    setError(null);
    setFoundUser(null);
    setHasSearched(false);

    const validation = validatePhone(mobileInput);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid 10-digit mobile number.');
      return;
    }

    isSearchingRef.current = true;
    setLoading(true);

    try {
      const result = await userService.searchUser(
        validation.value,
        currentUser?.mobileNumber,
        currentUser?.id
      );

      setFoundUser(result);
      setHasSearched(true);
    } catch (err: unknown) {
      setHasSearched(true);
      setError(getErrorMessage(err, 'Failed to search for user. Please try again.'));
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  }, [mobileInput, loading, currentUser]);

  const handleStartChat = useCallback(
    async (targetUser: UserSearchResult) => {
      if (startingChat) return;

      setStartingChat(true);
      setError(null);

      try {
        const chatResult = await chatService.createOrGetChat(targetUser.id);

        router.replace({
          pathname: '/(main)/chat/[userId]',
          params: {
            userId: targetUser.id,
            chatId: chatResult.chatId,
          },
        });
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Unable to start chat. Please try again.'));
        setStartingChat(false);
      }
    },
    [startingChat, router]
  );

  const canSearch = mobileInput.length === 10 && !loading && !startingChat;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Chat</Text>

        {(mobileInput.length > 0 || foundUser || error) ? (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Reset"
            accessibilityRole="button"
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mobile Number Search Card */}
          <View style={styles.searchCard}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.inputRow, isFocused ? styles.inputRowFocused : null]}>
              <View style={styles.prefixContainer}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.prefix}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                value={mobileInput}
                onChangeText={handleInputChange}
                placeholder="Enter 10-digit number"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onSubmitEditing={canSearch ? handleSearch : undefined}
                returnKeyType="search"
                editable={!loading && !startingChat}
                autoFocus
              />

              {mobileInput.length > 0 && !loading && (
                <TouchableOpacity
                  style={styles.clearIcon}
                  onPress={handleClear}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.searchButton, !canSearch ? styles.searchButtonDisabled : null]}
              onPress={handleSearch}
              disabled={!canSearch}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Search user"
            >
              {loading ? (
                <ActivityIndicator
                  color={theme.colors.white}
                  size="small"
                />
              ) : (
                <>
                  <Ionicons
                    name="search"
                    size={18}
                    color={theme.colors.white}
                  />
                  <Text style={styles.searchButtonText}>Search User</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Initial State (Before Search) */}
          {!hasSearched && !loading && !foundUser && !error && (
            <View style={styles.initialStateContainer}>
              <View style={styles.initialIconWrapper}>
                <Ionicons name="search-outline" size={36} color={theme.colors.primary} />
              </View>
              <Text style={styles.initialTitle}>Start a conversation</Text>
              <Text style={styles.initialSubtitle}>
                Enter any 10-digit mobile number above to find and chat with registered users.
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {error && !loading && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <Text style={styles.loadingText}>Searching registered users...</Text>
            </View>
          )}

          {/* User Found State */}
          {foundUser && !loading && (
            <View style={{ marginTop: theme.spacing.sm }}>
              <Text
                style={[
                  styles.label,
                  { marginBottom: theme.spacing.md, color: theme.colors.textPrimary },
                ]}
              >
                Search Result
              </Text>
              <UserSearchItem
                user={foundUser}
                onStartChat={handleStartChat}
                loading={startingChat}
              />
            </View>
          )}

          {/* User Not Found State */}
          {hasSearched && !foundUser && !loading && !error && (
            <View style={styles.notFoundContainer}>
              <View style={styles.notFoundIconWrapper}>
                <Ionicons name="person-remove-outline" size={40} color={theme.colors.textMuted} />
              </View>
              <Text style={styles.notFoundTitle}>No User Found</Text>
              <Text style={styles.notFoundSubtitle}>
                No registered user was found for {formatDisplayPhone(mobileInput)}.
                {'\n'}Make sure the user has created an account on Chat.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
