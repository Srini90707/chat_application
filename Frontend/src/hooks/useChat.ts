import { useCallback, useEffect, useMemo, useState } from 'react';
import { chatService } from '@/services/chat/chatService';
import { User } from '@/types/chat';

export function useChat() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await chatService.getUsers();
      setUsers(data);
      setError(null);
    } catch {
      setError('Unable to load conversations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    chatService
      .getUsers()
      .then((data) => {
        if (isMounted) {
          setUsers(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load conversations. Please try again.');
          setLoading(false);
        }
      });

    // Subscribe to status changes
    const unsubStatus = chatService.subscribeToStatus(({ userId, isOnline }) => {
      if (!isMounted) return;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isOnline } : u))
      );
    });

    // Subscribe to new messages to update last message preview and sort
    const unsubMessages = chatService.subscribeToMessages((msg) => {
      if (!isMounted) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === msg.senderId || u.id === msg.receiverId) {
            return {
              ...u,
              lastMessage: msg.text,
              lastMessageTime: msg.timestamp,
            };
          }
          return u;
        })
      );
    });

    return () => {
      isMounted = false;
      unsubStatus();
      unsubMessages();
    };
  }, []);

  const refreshUsers = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    // Sort conversations by latest message timestamp descending
    const sorted = [...users].sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });

    const q = searchQuery.toLowerCase().trim();
    if (!q) return sorted;
    return sorted.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.mobileNumber && u.mobileNumber.includes(q))
    );
  }, [users, searchQuery]);

  return {
    users,
    filteredUsers,
    loading,
    refreshing,
    error,
    searchQuery,
    setSearchQuery,
    refreshUsers,
  };
}
