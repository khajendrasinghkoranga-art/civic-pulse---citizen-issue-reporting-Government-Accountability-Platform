'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import type { User, AuthResponse } from '@/types';

export interface GoogleAuthPayload {
  code?: string;
  redirectUri?: string;
  idToken?: string;
  accessToken?: string;
  credential?: string;
  email?: string;
  name?: string;
  googleId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    nameOrData: string | { name: string; email: string; password: string; phone?: string; role?: string },
    email?: string,
    password?: string,
    phone?: string
  ) => Promise<void>;
  loginWithGoogle: (data: GoogleAuthPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
      apiClient.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (
    nameOrData: string | { name: string; email: string; password: string; phone?: string; role?: string },
    email?: string,
    password?: string,
    phone?: string
  ) => {
    const payload =
      typeof nameOrData === 'object'
        ? nameOrData
        : { name: nameOrData, email, password, phone };
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const loginWithGoogle = async (data: GoogleAuthPayload) => {
    const res = await apiClient.post<AuthResponse>('/auth/google', data);
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore
    } finally {
      apiClient.clearTokens();
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
