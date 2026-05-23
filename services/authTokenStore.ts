import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthTokens } from '@/types/auth';

const AUTH_TOKENS_KEY = 'hnanut.auth.tokens';

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

export async function clearAuthTokens(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(AUTH_TOKENS_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_TOKENS_KEY);
}