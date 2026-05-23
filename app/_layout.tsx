import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/stores/authStore";
import {
  PreferenceProvider,
  usePreferences,
} from "@/stores/preferenceStore";

export const unstable_settings = {
  anchor: "(app)",
};

export default function RootLayout() {
  return (
    <PreferenceProvider>
      <RootNavigator />
    </PreferenceProvider>
  );
}

function RootNavigator() {
  const { colorMode } = usePreferences();

  return (
    <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal", headerShown: true }}
          />
        </Stack>
        <StatusBar style={colorMode === "dark" ? "light" : "dark"} />
      </AuthProvider>
    </ThemeProvider>
  );
}
