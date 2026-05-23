import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authService } from '@/services/authService';
import { clearAuthTokens, getAuthTokens, saveAuthTokens } from '@/services/authTokenStore';
import type { AuthResponse, AuthTokens, AuthUser } from '@/types/auth';

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  user: AuthUser | null;
  setSession: (response: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  reloadSession: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const reloadSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const storedTokens = await getAuthTokens();

      if (!storedTokens || isRefreshTokenExpired(storedTokens)) {
        await clearAuthTokens();
        setTokens(null);
        setUser(null);
        return;
      }

      setTokens(storedTokens);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadSession();
  }, [reloadSession]);

  const setSession = useCallback(async (response: AuthResponse) => {
    const nextTokens: AuthTokens = {
      accessToken: response.accessToken,
      accessTokenExpiresAtUtc: response.accessTokenExpiresAtUtc,
      refreshToken: response.refreshToken,
      refreshTokenExpiresAtUtc: response.refreshTokenExpiresAtUtc,
    };

    await saveAuthTokens(nextTokens);

    setTokens(nextTokens);
    setUser({
      userId: response.userId,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setTokens(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isLoading,
      isAuthenticated: tokens !== null,
      tokens,
      user,
      setSession,
      signOut,
      reloadSession,
    }),
    [isLoading, tokens, user, setSession, signOut, reloadSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

function isRefreshTokenExpired(tokens: AuthTokens): boolean {
  return new Date(tokens.refreshTokenExpiresAtUtc).getTime() <= Date.now();
}