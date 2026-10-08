import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/common/AppButton/AppButton';
import { AppInput } from '@/components/common/AppInput/AppInput';
import {
  DEFAULT_BACKEND_PORT,
  serverConfigService,
} from '@/services/config/serverConfigService';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './ServerConfigModal.styles';

export interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onServerChanged?: (newUrl: string) => void;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'failed';

const ServerConfigDialog: React.FC<Pick<ServerConfigModalProps, 'onClose' | 'onServerChanged'>> = ({
  onClose,
  onServerChanged,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [inputUrl, setInputUrl] = useState(() => serverConfigService.getBaseUrl());
  const [activeUrl, setActiveUrl] = useState(() => serverConfigService.getBaseUrl());
  const [isCustom, setIsCustom] = useState(() => serverConfigService.isCustomUrl());
  const [inputError, setInputError] = useState<string | null>(null);
  const [isMetroWarning, setIsMetroWarning] = useState(false);

  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleTextChange = (text: string) => {
    setInputUrl(text);
    if (inputError) {
      setInputError(null);
    }
    if (testStatus !== 'idle') {
      setTestStatus('idle');
      setTestMessage('');
    }

    const val = serverConfigService.validateUrl(text);
    setIsMetroWarning(Boolean(val.isMetroPortWarning));
  };

  const handleFixMetroPort = () => {
    const fixed = inputUrl.replace(':8081', `:${DEFAULT_BACKEND_PORT}`);
    setInputUrl(fixed);
    setIsMetroWarning(false);
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleTestConnection = async () => {
    const validation = serverConfigService.validateUrl(inputUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      setInputError(validation.error || 'Please enter a valid URL.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing connectivity...');

    try {
      const res = await serverConfigService.testConnection(validation.normalizedUrl);
      if (res.success) {
        setTestStatus('success');
        setTestMessage('Connected successfully');
      } else {
        setTestStatus('failed');
        setTestMessage(res.message);
      }
    } catch {
      setTestStatus('failed');
      setTestMessage('Connection test failed.');
    }
  };

  const handleSave = async () => {
    const validation = serverConfigService.validateUrl(inputUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      setInputError(validation.error || 'Please enter a valid URL.');
      return;
    }

    setIsSaving(true);
    try {
      const saveRes = await serverConfigService.saveServerUrl(validation.normalizedUrl);
      if (saveRes.isValid && saveRes.normalizedUrl) {
        setActiveUrl(saveRes.normalizedUrl);
        setIsCustom(true);
        onServerChanged?.(saveRes.normalizedUrl);
        Alert.alert(
          'Server Updated',
          `Active backend URL set to:\n${saveRes.normalizedUrl}`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Save Failed', saveRes.error || 'Could not save server URL.');
      }
    } catch {
      Alert.alert('Error', 'Unable to persist server URL.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      'Reset Server URL?',
      'Restore the default application server URL?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const defaultUrl = await serverConfigService.resetToDefault();
            setInputUrl(defaultUrl);
            setActiveUrl(defaultUrl);
            setIsCustom(false);
            setInputError(null);
            setIsMetroWarning(false);
            setTestStatus('idle');
            setTestMessage('');
            onServerChanged?.(defaultUrl);
            Alert.alert('Default Restored', `Server reset to:\n${defaultUrl}`);
          },
        },
      ]
    );
  };

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Server Configuration</Text>
            <Text style={styles.subtitle}>Configure mobile backend API address</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close server configuration"
          >
            <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Current Server Box */}
        <View style={styles.currentServerBox}>
          <View style={styles.currentServerHeader}>
            <Text style={styles.currentServerLabel}>Active Server</Text>
            <View
              style={[
                styles.currentServerBadge,
                isCustom ? styles.badgeCustom : styles.badgeDefault,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  !isCustom && styles.badgeTextDefault,
                ]}
              >
                {isCustom ? 'Custom' : 'Default'}
              </Text>
            </View>
          </View>
          <Text style={styles.currentServerValue} numberOfLines={1} ellipsizeMode="middle">
            {activeUrl}
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <AppInput
            label="Backend Server URL"
            value={inputUrl}
            onChangeText={handleTextChange}
            placeholder="http://192.168.1.100:8085"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            error={inputError || undefined}
            leftIcon={<Ionicons name="link-outline" size={18} color={theme.colors.textMuted} />}
            accessibilityLabel="Backend server URL input"
          />
        </View>

        {/* Port Warning Banner */}
        {isMetroWarning && (
          <View style={styles.warningBanner}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning-outline" size={16} color={theme.colors.warning} />
              <Text style={styles.warningTitle}>Port 8081 Detected</Text>
            </View>
            <Text style={styles.warningText}>
              Port 8081 is normally used by Expo/Metro bundler. Your Spring Boot backend is typically running on port {DEFAULT_BACKEND_PORT}.
            </Text>
            <TouchableOpacity
              style={styles.fixPortButton}
              onPress={handleFixMetroPort}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Use port ${DEFAULT_BACKEND_PORT}`}
            >
              <Text style={styles.fixPortText}>Use Port {DEFAULT_BACKEND_PORT}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Test Connection Section */}
        <View style={styles.testSection}>
          <View style={styles.testRow}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestConnection}
              disabled={testStatus === 'testing' || !inputUrl.trim()}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Test connection to server"
            >
              {testStatus === 'testing' ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons name="pulse-outline" size={16} color={theme.colors.textPrimary} />
              )}
              <Text style={styles.testButtonText}>Test Connection</Text>
            </TouchableOpacity>

            {/* Status Badge */}
            {testStatus !== 'idle' ? (
              <View
                style={[
                  styles.statusBadge,
                  testStatus === 'testing' && styles.statusTesting,
                  testStatus === 'success' && styles.statusSuccess,
                  testStatus === 'failed' && styles.statusFailed,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        testStatus === 'success'
                          ? theme.colors.success
                          : testStatus === 'failed'
                          ? theme.colors.error
                          : theme.colors.primary,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        testStatus === 'success'
                          ? theme.colors.success
                          : testStatus === 'failed'
                          ? theme.colors.error
                          : theme.colors.primary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {testMessage}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AppButton
            title="Save & Connect"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving || !inputUrl.trim() || Boolean(inputError)}
            accessibilityLabel="Save and connect to server"
          />

          <AppButton
            title="Reset to Default"
            variant="outline"
            onPress={handleReset}
            disabled={isSaving || !isCustom}
            accessibilityLabel="Reset to default server URL"
          />
        </View>
      </Pressable>
    </Pressable>
  );
};

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  visible,
  onClose,
  onServerChanged,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {visible ? (
        <ServerConfigDialog onClose={onClose} onServerChanged={onServerChanged} />
      ) : null}
    </Modal>
  );
};
