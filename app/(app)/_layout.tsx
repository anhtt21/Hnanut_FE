import { Redirect, Stack } from "expo-router";

import FullScreenLoader from "@/components/full-screen-loader";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";

export default function ProtectedAppLayout() {
  const { isLoading, isAuthenticated } = useAuth();
  const { t } = usePreferences();

  if (isLoading) {
    return <FullScreenLoader label={t("restoringSession")} />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings/account" />
      <Stack.Screen name="settings/goal" />
      <Stack.Screen name="settings/general" />
    </Stack>
  );
}
