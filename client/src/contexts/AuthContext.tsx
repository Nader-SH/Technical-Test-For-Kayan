import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { configureInterceptors } from '../api/axios';
import {
  loginRequest,
  logoutRequest,
  refreshSession,
  signupRequest,
  type SignupPayload,
} from '../api/auth';
import type {
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  User,
} from '../types/api';
import { ROLE_DEFAULT_ROUTE, STORAGE_KEYS } from '../utils/constants';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const persistUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.LAST_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.LAST_USER);
  }
};

const persistRefreshToken = (token: string | null | undefined) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const accessTokenRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const setAccessToken = useCallback((token: string | null | undefined) => {
    accessTokenRef.current = token ?? null;
  }, []);

  const handleLoginSuccess = useCallback(
    (payload: LoginResponse, message: string = 'Welcome back!') => {
      setUser(payload.user);
      persistUser(payload.user);

      if (payload.accessToken) {
        setAccessToken(payload.accessToken);
      }

      if (payload.refreshToken) {
        persistRefreshToken(payload.refreshToken);
      }

      toast.success(message);

      const redirect =
        ROLE_DEFAULT_ROUTE[payload.user.role] ?? ROLE_DEFAULT_ROUTE.patient;
      navigate(redirect, { replace: true });
    },
    [navigate, setAccessToken]
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload);
      if (!response.accessToken) {
        console.warn(
          'Access token missing from login response. Falling back to cookies.'
        );
      }
      handleLoginSuccess(response);
    },
    [handleLoginSuccess]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      await signupRequest(payload);
      toast.success('Account created successfully! Please sign in.');
      // After signup, automatically log in
      await login({ email: payload.email, password: payload.password });
    },
    [login]
  );

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    persistUser(null);
    persistRefreshToken(null);
    navigate('/login', { replace: true });
  }, [navigate, setAccessToken]);

  const applyTokenPatch = useCallback(
    (response?: RefreshResponse | null) => {
      if (!response) return;
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }
      if (response.refreshToken) {
        persistRefreshToken(response.refreshToken);
      }
    },
    [setAccessToken]
  );

  const refresh = useCallback(async () => {
    const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!storedRefresh) {
      return null;
    }
    try {
      const response = await refreshSession(storedRefresh);
      applyTokenPatch(response);
      return response?.accessToken ?? null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn('Refresh token failed:', errorMessage);
      clearSession();
      return null;
    }
  }, [applyTokenPatch, clearSession]);

  const logout = useCallback(async () => {
    const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      await logoutRequest(storedRefresh || undefined);
    } catch {
      console.warn('Logout failed, clearing session anyway.');
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    configureInterceptors({
      getToken: () => accessTokenRef.current,
      onRefresh: refresh,
      onLogout: logout,
    });
  }, [logout, refresh]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const lastUserRaw = localStorage.getItem(STORAGE_KEYS.LAST_USER);
        if (lastUserRaw) {
          try {
            const parsedUser = JSON.parse(lastUserRaw) as User;
            setUser(parsedUser);
          } catch {
            persistUser(null);
          }
        }

        const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (storedRefresh) {
          try {
            await Promise.race([
              refresh(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Refresh timeout')), 5000)
              ),
            ]);
          } catch (error) {
            console.warn('Refresh failed during bootstrap:', error);
            persistUser(null);
            persistRefreshToken(null);
          }
        }
      } catch (error) {
        console.error('Bootstrap error:', error);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      accessToken: accessTokenRef.current,
      isBootstrapping,
      login,
      signup,
      logout,
      refresh,
    }),
    [user, isBootstrapping, login, signup, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* eslint-disable-next-line react-refresh/only-export-components */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

