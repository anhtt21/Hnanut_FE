import { Redirect, Stack } from "expo-router";

import FullScreenLoader from "@/components/full-screen-loader";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";

export default function AuthLayout() {
  const { isLoading, isAuthenticated } = useAuth();
  const { t } = usePreferences();

  if (isLoading) {
    return <FullScreenLoader label={t("checkingLogin")} />;
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
