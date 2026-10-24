"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth, adminApi } from "@/lib/api";

interface AdminAuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  hasJurisdiction: (issueSector?: string | null) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = getStoredToken();
    const savedUser = getStoredUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      // Verify token in background
      adminApi.getMe()
        .then((fresh) => {
          setUser(fresh);
          setStoredAuth(savedToken, fresh);
        })
        .catch(() => {
          // Token invalid
          clearStoredAuth();
          setUser(null);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const result = await adminApi.login(email, password);
    setToken(result.accessToken);
    setUser(result.user);
    setStoredAuth(result.accessToken, result.user);
    return result.user;
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  };

  // RBAC Jurisdiction Check
  const hasJurisdiction = (issueSector?: string | null): boolean => {
    if (!user) return false;
    // Super admin has jurisdiction everywhere
    if (user.role === "SUPER_ADMIN") return true;

    // If magistrate has no sector assigned, cannot modify
    if (!user.sector) return false;
    if (!issueSector) return false;

    const userSec = user.sector.toLowerCase().trim();
    const issSec = issueSector.toLowerCase().trim();

    if (userSec === issSec) return true;

    // Check sector number (e.g. Sector 1 vs Sector 1 (Central...))
    const userMatch = userSec.match(/sector[-\s]*(\d+)/i);
    const issMatch = issSec.match(/sector[-\s]*(\d+)/i);
    if (userMatch && issMatch && userMatch[1] === issMatch[1]) {
        return true;
    }

    return userSec.includes(issSec) || issSec.includes(userSec);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
        hasJurisdiction,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
