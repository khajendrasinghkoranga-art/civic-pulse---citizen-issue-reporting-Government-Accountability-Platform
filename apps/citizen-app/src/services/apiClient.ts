import { API_BASE_URL } from '@/constants/theme';
import { tokenStorage } from './storage';

class ApiClient {
  private baseUrl = API_BASE_URL;
  private onUnauthorized: (() => void) | null = null;

  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        await tokenStorage.clearAll();
        return null;
      }

      const json = await res.json();
      const newAccess = json?.data?.accessToken;
      const newRefresh = json?.data?.refreshToken;
      if (!newAccess || !newRefresh) {
        await tokenStorage.clearAll();
        return null;
      }

      await tokenStorage.setTokens(newAccess, newRefresh);
      return newAccess;
    } catch {
      return null;
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await tokenStorage.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let res = await fetch(url, { ...options, headers });

    if (
      res.status === 401 &&
      token &&
      !endpoint.startsWith('/auth/login') &&
      !endpoint.startsWith('/auth/register') &&
      !endpoint.startsWith('/auth/google')
    ) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        res = await fetch(url, { ...options, headers });
      } else {
        this.onUnauthorized?.();
        throw new Error('Session expired. Please sign in again.');
      }
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data?.message ||
        (Array.isArray(data?.errors) && data.errors[0]?.message) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return data as T;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
