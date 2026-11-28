import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from './apiClient';
import { tokenStorage } from './storage';
import type { ApiResponse, AuthResponse, User } from '@/types';

interface GoogleAuthPayload {
  email?: string;
  name?: string;
  idToken?: string;
  accessToken?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      setUser(res.data);
      await tokenStorage.setUserJson(JSON.stringify(res.data));
    } catch {
      const cachedUser = await tokenStorage.getUserJson();
      const token = await tokenStorage.getAccessToken();
      if (cachedUser && token) {
        try {
          setUser(JSON.parse(cachedUser));
          return;
        } catch {
          // ignore invalid json
        }
      }
      setUser(null);
      await tokenStorage.clearAll();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      setUser(null);
    });
    refreshUser();
  }, [refreshUser]);

  const persistSession = async (res: AuthResponse) => {
    await tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
    await tokenStorage.setUserJson(JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    await persistSession(res);
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) => {
    const res = await apiClient.post<AuthResponse>('/auth/register', {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      phone: payload.phone?.trim() || undefined,
    });
    await persistSession(res);
  };

  const loginWithGoogle = async (payload: GoogleAuthPayload) => {
    const res = await apiClient.post<AuthResponse>('/auth/google', payload);
    await persistSession(res);
  };

  const logout = async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore logout network errors
    } finally {
      await tokenStorage.clearAll();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
