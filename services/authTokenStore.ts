import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthTokens } from '@/types/auth';
import type { AuthUser } from '@/types/auth';

const AUTH_TOKENS_KEY = 'hnanut.auth.tokens';
const AUTH_USER_KEY = 'hnanut.auth.user';

export async function getAuthTokens(): Promise<AuthTokens | null> {
  const raw =
    Platform.OS === 'web'
      ? localStorage.getItem(AUTH_TOKENS_KEY)
      : await SecureStore.getItemAsync(AUTH_TOKENS_KEY);

  return raw ? (JSON.parse(raw) as AuthTokens) : null;
}

export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  const raw = JSON.stringify(tokens);

  if (Platform.OS === 'web') {
    localStorage.setItem(AUTH_TOKENS_KEY, raw);
    return;
  }

  await SecureStore.setItemAsync(AUTH_TOKENS_KEY, raw);
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const raw =
    Platform.OS === 'web'
      ? localStorage.getItem(AUTH_USER_KEY)
      : await SecureStore.getItemAsync(AUTH_USER_KEY);

  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export async function saveAuthUser(user: AuthUser): Promise<void> {
  const raw = JSON.stringify(user);

  if (Platform.OS === 'web') {
    localStorage.setItem(AUTH_USER_KEY, raw);
    return;
  }

  await SecureStore.setItemAsync(AUTH_USER_KEY, raw);
}

export async function clearAuthUser(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_USER_KEY);
}

export async function clearAuthTokens(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(AUTH_TOKENS_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_TOKENS_KEY);
}
