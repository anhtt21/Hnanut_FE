import { Redirect, Stack } from "expo-router";
import { MealDraftProvider } from "@/stores/mealDraftStore";
import FullScreenLoader from "@/components/full-screen-loader";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";
import { ProfileProvider } from "@/stores/profileStore";

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
    <ProfileProvider>
      <MealDraftProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings/account" />
          <Stack.Screen name="settings/goal" />
          <Stack.Screen name="settings/general" />
          <Stack.Screen name="meals/create" />
        </Stack>
      </MealDraftProvider>
    </ProfileProvider>
  );
}
