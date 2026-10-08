import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '@/theme';
import { MessageType } from '@/types/chat';
import { isValidMessage, sanitizeMessageText } from '@/utils/messageUtils';
import { createStyles } from './MessageInput.styles';

export interface SendMediaParams {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  messageType: 'image' | 'pdf' | 'document';
  caption?: string;
}

export interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendMediaMessage?: (params: SendMediaParams) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendMediaMessage,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [text, setText] = useState('');
  const [showAttachModal, setShowAttachModal] = useState(false);

  const canSend = isValidMessage(text) && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSendMessage(sanitizeMessageText(text));
    setText('');
  };

  const handleAttachment = () => {
    if (disabled) return;
    setShowAttachModal(true);
  };

  const handlePickImage = async () => {
    setShowAttachModal(false);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const fileName = asset.fileName || `image_${Date.now()}.jpg`;
        onSendMediaMessage?.({
          uri: asset.uri,
          name: fileName,
          mimeType: asset.mimeType || 'image/jpeg',
          size: asset.fileSize,
          messageType: 'image',
          caption: text.trim() || undefined,
        });
        setText('');
      }
    } catch {
      Alert.alert('Error', 'Unable to select image.');
    }
  };

  const handleTakePhoto = async () => {
    setShowAttachModal(false);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        quality: 0.85,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
        onSendMediaMessage?.({
          uri: asset.uri,
          name: fileName,
          mimeType: asset.mimeType || 'image/jpeg',
          size: asset.fileSize,
          messageType: 'image',
          caption: text.trim() || undefined,
        });
        setText('');
      }
    } catch {
      Alert.alert('Error', 'Unable to capture photo.');
    }
  };

  const handlePickDocument = async () => {
    setShowAttachModal(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', '*/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const fileName = asset.name || `file_${Date.now()}`;
        const mime = asset.mimeType || 'application/octet-stream';
        const isPdf = mime.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

        onSendMediaMessage?.({
          uri: asset.uri,
          name: fileName,
          mimeType: mime,
          size: asset.size,
          messageType: isPdf ? 'pdf' : 'document',
          caption: text.trim() || undefined,
        });
        setText('');
      }
    } catch {
      Alert.alert('Error', 'Unable to select document.');
    }
  };

  const handleEmoji = () => {
    setText((prev) => prev + ' 😊');
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.row}>
          {/* Attachment button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleAttachment}
            activeOpacity={0.7}
            accessibilityLabel="Add attachment"
            accessibilityRole="button"
          >
            <Ionicons name="attach-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Input box */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.placeholder}
              multiline
              maxLength={1000}
              textAlignVertical="center"
            />

            <TouchableOpacity
              style={styles.emojiButton}
              onPress={handleEmoji}
              activeOpacity={0.7}
              accessibilityLabel="Emoji picker"
              accessibilityRole="button"
            >
              <Ionicons name="happy-outline" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Send button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={canSend ? theme.colors.white : theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Media Attach Modal */}
      <Modal
        visible={showAttachModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAttachModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Share Content</Text>

            <View style={styles.optionsRow}>
              {/* Photo / Gallery */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handlePickImage}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="images" size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.optionLabel}>Gallery</Text>
              </TouchableOpacity>

              {/* Camera */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleTakePhoto}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#EC4899' }]}>
                  <Ionicons name="camera" size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.optionLabel}>Camera</Text>
              </TouchableOpacity>

              {/* Document / PDF */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handlePickDocument}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="document-text" size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.optionLabel}>PDF / Doc</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAttachModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
