import { MEDIA_ENDPOINTS } from '@/config/api';
import { serverConfigService } from '@/services/config/serverConfigService';
import { storageService } from '@/services/storage/storageService';
import { MessageType } from '@/types/chat';

export interface UploadMediaResult {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  messageType: MessageType;
}

export const getAttachmentUrl = (url?: string): string => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('file:') ||
    url.startsWith('content:') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('ph:')
  ) {
    return url;
  }
  const baseUrl = serverConfigService.getBaseUrl().replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

class MediaService {
  async uploadFile(uri: string, name: string, mimeType?: string): Promise<UploadMediaResult> {
    const session = await storageService.getAuthSession();
    const url = `${serverConfigService.getBaseUrl()}${MEDIA_ENDPOINTS.UPLOAD}`;

    const formData = new FormData();
    formData.append('file', {
      uri,
      name,
      type: mimeType || 'application/octet-stream',
    } as any);

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(errText || `Failed to upload file (${response.status})`);
    }

    const data = await response.json();
    return data as UploadMediaResult;
  }
}

export const mediaService = new MediaService();
