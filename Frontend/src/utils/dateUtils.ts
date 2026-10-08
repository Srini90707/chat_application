/**
 * Utility functions for date formatting in the chat interface.
 */

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isYesterday(targetDate: Date, today: Date = new Date()): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(targetDate, yesterday);
}

/**
 * Format a timestamp into a human-friendly date separator label (e.g., "Today", "Yesterday", "Oct 12, 2026").
 */
export function formatDateSeparator(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) return '';

  if (isSameDay(date, now)) {
    return 'Today';
  }

  if (isYesterday(date, now)) {
    return 'Yesterday';
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  };

  return date.toLocaleDateString(undefined, options);
}

/**
 * Format message time to "10:24 AM"
 */
export function formatMessageTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Format timestamp for the user list preview.
 */
export function formatPreviewTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) return '';

  if (isSameDay(date, now)) {
    return formatMessageTime(dateString);
  }

  if (isYesterday(date, now)) {
    return 'Yesterday';
  }

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
