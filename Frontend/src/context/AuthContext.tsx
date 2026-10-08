import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient } from '@/services/api/apiClient';
import { authService } from '@/services/auth/authService';
import { serverConfigService } from '@/services/config/serverConfigService';
import { notificationService } from '@/services/notification/notificationService';
import { storageService } from '@/services/storage/storageService';
import { websocketService } from '@/services/websocket/websocketService';
import { AuthState } from '@/types/auth';
import { User } from '@/types/user';

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => Promise<void>;
  register: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
  });

  const restoreSession = useCallback(async () => {
    try {
      const session = await storageService.getAuthSession();
      if (session && session.token && session.user) {
        websocketService.connect(session.user.id);
        notificationService.registerForPushNotificationsAsync(session.user.mobileNumber || session.user.id);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: session.user,
          accessToken: session.token,
        });
        return;
      }
    } catch {
      // Fallback to unauthenticated on error
    }

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    apiClient.setOnSessionExpired(() => {
      if (!isMounted) return;
      websocketService.disconnect();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
      });
    });

    serverConfigService
      .init()
      .then(() => storageService.getAuthSession())
      .then((session) => {
        if (!isMounted) return;
        if (session && session.token && session.user) {
          websocketService.connect(session.user.id);
          notificationService.registerForPushNotificationsAsync(session.user.mobileNumber || session.user.id);
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: session.user,
            accessToken: session.token,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            accessToken: null,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            accessToken: null,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (token: string, user: User) => {
    websocketService.connect(user.id);
    notificationService.registerForPushNotificationsAsync(user.mobileNumber || user.id);
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user,
      accessToken: token,
    });
  }, []);

  const register = useCallback(async (token: string, user: User) => {
    websocketService.connect(user.id);
    notificationService.registerForPushNotificationsAsync(user.mobileNumber || user.id);
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user,
      accessToken: token,
    });
  }, []);

  const updateUser = useCallback(
    async (updatedFields: Partial<User>) => {
      if (!authState.user || !authState.accessToken) return;

      const mergedUser: User = {
        ...authState.user,
        ...updatedFields,
      };

      await storageService.saveAuthSession(authState.accessToken, mergedUser);

      setAuthState((prev) => ({
        ...prev,
        user: mergedUser,
      }));
    },
    [authState.user, authState.accessToken]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
    });
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      login,
      register,
      logout,
      updateUser,
      restoreSession,
    }),
    [authState, login, register, logout, updateUser, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
