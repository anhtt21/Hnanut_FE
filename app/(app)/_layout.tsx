import { Redirect, Stack } from 'expo-router';

import FullScreenLoader from '@/components/full-screen-loader';
import { useAuth } from '@/stores/authStore';

export default function ProtectedAppLayout() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <FullScreenLoader label="Đang khôi phục phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}