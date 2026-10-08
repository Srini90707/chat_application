import React from 'react';
import {
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatFileSize, getAttachmentUrl } from '@/services/media/mediaService';
import { useTheme, useThemedStyles } from '@/theme';
import { Message } from '@/types/chat';
import { formatMessageTime } from '@/utils/dateUtils';
import { createStyles } from './MessageBubble.styles';

export interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onRetry?: (message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  onRetry,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const isImage =
    message.messageType === 'image' ||
    (!!message.attachmentUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(message.attachmentUrl));

  const isDoc =
    message.messageType === 'pdf' ||
    message.messageType === 'document' ||
    (!!message.attachmentUrl && !isImage);

  const handleOpenMedia = () => {
    if (!message.attachmentUrl) return;
    const fullUrl = getAttachmentUrl(message.attachmentUrl);
    Linking.openURL(fullUrl).catch((err) => {
      console.warn('Could not open file URL:', fullUrl, err);
    });
  };

  const renderStatusIcon = () => {
    if (!isCurrentUser) return null;

    switch (message.status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color={theme.colors.timestampOutgoing} />;
      case 'sent':
        return <Ionicons name="checkmark" size={13} color={theme.colors.timestampOutgoing} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={13} color={theme.colors.timestampOutgoing} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={13} color={theme.colors.white} />;
      case 'failed':
        return (
          <TouchableOpacity
            onPress={() => onRetry?.(message)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityLabel="Retry sending"
            accessibilityRole="button"
          >
            <Ionicons name="alert-circle" size={14} color={theme.colors.danger} />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  return (
    <View style={[styles.row, isCurrentUser ? styles.rowOutgoing : styles.rowIncoming]}>
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.bubbleOutgoing : styles.bubbleIncoming,
        ]}
      >
        {/* Image Attachment */}
        {isImage && message.attachmentUrl && (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleOpenMedia}
            activeOpacity={0.88}
          >
            {imageError ? (
              <View style={[styles.imageContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="image-outline" size={36} color={theme.colors.textMuted} />
                <Text style={[styles.docMeta, { marginTop: 6, color: theme.colors.textMuted }]}>
                  Tap to view image
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: getAttachmentUrl(message.attachmentUrl) }}
                style={styles.messageImage}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            )}
          </TouchableOpacity>
        )}

        {/* PDF / Document Attachment */}
        {isDoc && (
          <TouchableOpacity
            style={styles.docContainer}
            onPress={handleOpenMedia}
            activeOpacity={0.8}
          >
            <View style={styles.docIconBox}>
              <Ionicons
                name={message.messageType === 'pdf' || (message.attachmentName || '').toLowerCase().endsWith('.pdf') ? 'document-text' : 'attach'}
                size={22}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.docInfo}>
              <Text
                style={[
                  styles.docName,
                  isCurrentUser ? styles.docNameOutgoing : styles.docNameIncoming,
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {message.attachmentName || 'Document'}
              </Text>
              <Text
                style={[
                  styles.docMeta,
                  isCurrentUser ? styles.docMetaOutgoing : styles.docMetaIncoming,
                ]}
              >
                {(message.attachmentName || '').toLowerCase().endsWith('.pdf') || message.messageType === 'pdf' ? 'PDF • ' : ''}
                {formatFileSize(message.attachmentSize)}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Text / Caption */}
        {!!message.text && (
          <Text
            style={[
              styles.messageText,
              (isImage || isDoc) && styles.captionText,
              isCurrentUser ? styles.messageTextOutgoing : styles.messageTextIncoming,
            ]}
            selectable
          >
            {message.text}
          </Text>
        )}

        <View style={styles.footer}>
          <Text
            style={[
              styles.timestampText,
              isCurrentUser ? styles.timestampOutgoing : styles.timestampIncoming,
            ]}
          >
            {formatMessageTime(message.timestamp)}
          </Text>

          {isCurrentUser && <View style={styles.statusContainer}>{renderStatusIcon()}</View>}
        </View>
      </View>
    </View>
  );
};
