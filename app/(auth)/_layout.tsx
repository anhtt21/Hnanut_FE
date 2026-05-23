import { Redirect, Stack } from 'expo-router';

import FullScreenLoader from '@/components/full-screen-loader';
import { useAuth } from '@/stores/authStore';

export default function AuthLayout() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <FullScreenLoader label="Đang kiểm tra đăng nhập..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}