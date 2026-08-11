"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMe, login as loginRequest, logoutRequest } from "@/features/auth/api/auth-api";
import { clearAuthState } from "@/features/auth/lib/clear-auth-state";
import { tryRefreshTokens } from "@/features/auth/lib/refresh-mutex";
import { tokenStorage } from "@/features/auth/lib/token-storage";
import type { AuthUser } from "@/features/auth/types";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const access = tokenStorage.getAccess();
    if (!access) {
      setUser(null);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      const refreshed = await tryRefreshTokens();
      if (!refreshed) {
        clearAuthState();
        setUser(null);
        return;
      }
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        clearAuthState();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refreshSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    queryClient.clear();
    setUser(data.user);
    return data.user;
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // ignore network errors on logout
    } finally {
      clearAuthState();
      queryClient.clear();
      setUser(null);
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, refreshSession }),
    [user, isLoading, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
