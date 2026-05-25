import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authService } from "@/services/authService";
import {
  clearAuthUser,
  clearAuthTokens,
  getAuthUser,
  getAuthTokens,
  saveAuthUser,
  saveAuthTokens,
} from "@/services/authTokenStore";
import { accountService } from "@/services/accountService";
import type { AuthResponse, AuthTokens, AuthUser } from "@/types/auth";

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  user: AuthUser | null;
  setSession: (response: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  reloadSession: () => Promise<void>;
  updateUser: (nextUser: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const reloadSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const [storedTokens, storedUser] = await Promise.all([
        getAuthTokens(),
        getAuthUser(),
      ]);

      if (!storedTokens || isRefreshTokenExpired(storedTokens)) {
        await clearAuthTokens();
        await clearAuthUser();
        setTokens(null);
        setUser(null);
        return;
      }

      setTokens(storedTokens);
      setUser(storedUser);

      try {
        const account = await accountService.getAccount();
        const nextUser: AuthUser = {
          userId: account.userId,
          email: account.email,
          fullName: account.fullName,
          role: account.role,
          avatarUrl: account.avatarUrl ?? null,
        };

        setUser(nextUser);
        await saveAuthUser(nextUser);
      } catch {
        if (!storedUser) {
          setUser(null);
        }
      }
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
    const nextUser: AuthUser = {
      userId: response.userId,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
      avatarUrl: response.avatarUrl ?? null,
    };

    await saveAuthUser(nextUser);
    setUser(nextUser);
  }, []);

  const updateUser = useCallback((nextUser: Partial<AuthUser>) => {
    setUser((current) => {
      if (current) {
        const updatedUser = { ...current, ...nextUser };
        void saveAuthUser(updatedUser);
        return updatedUser;
      }

      if (
        nextUser.userId &&
        nextUser.email &&
        nextUser.fullName &&
        nextUser.role
      ) {
        const createdUser = {
          userId: nextUser.userId,
          email: nextUser.email,
          fullName: nextUser.fullName,
          role: nextUser.role,
          avatarUrl: nextUser.avatarUrl ?? null,
        };

        void saveAuthUser(createdUser);
        return createdUser;
      }

      return current;
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      await clearAuthUser();
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
      updateUser,
    }),
    [isLoading, tokens, user, setSession, signOut, reloadSession, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

function isRefreshTokenExpired(tokens: AuthTokens): boolean {
  return new Date(tokens.refreshTokenExpiresAtUtc).getTime() <= Date.now();
}
