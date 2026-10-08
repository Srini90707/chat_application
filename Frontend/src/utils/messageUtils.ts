import { Message } from '@/types/chat';

export { isSameDay } from './dateUtils';

export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function sanitizeMessageText(text: string): string {
  return text.trim();
}

export function isValidMessage(text: string): boolean {
  return sanitizeMessageText(text).length > 0;
}

export interface DateGroupedMessages {
  dateKey: string;
  dateLabel: string;
  messages: Message[];
}

export type TimelineItem =
  | { type: 'date'; id: string; date: string }
  | { type: 'message'; id: string; message: Message };

/**
 * Transforms a chronological message list into timeline items including date separators
 */
export function buildTimelineItems(messages: Message[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  let lastDateStr = '';

  messages.forEach((msg) => {
    const date = msg.timestamp ? new Date(msg.timestamp) : null;
    const dateStr = date && !isNaN(date.getTime()) ? date.toDateString() : '';

    if (dateStr && dateStr !== lastDateStr) {
      items.push({
        type: 'date',
        id: `date-sep-${msg.id}-${dateStr}`,
        date: msg.timestamp,
      });
      lastDateStr = dateStr;
    }

    items.push({
      type: 'message',
      id: msg.id,
      message: msg,
    });
  });

  return items;
}
