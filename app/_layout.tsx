import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Platform, StyleSheet, View } from "react-native";

import { AuthProvider } from "@/stores/authStore";
import { PreferenceProvider, usePreferences } from "@/stores/preferenceStore";

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
    <View style={styles.webCanvas}>
      <View
        style={Platform.OS === "web" ? styles.phoneFrame : styles.nativeFrame}
      >
        <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: "modal",
                  title: "Modal",
                  headerShown: true,
                }}
              />
            </Stack>
            <StatusBar style={colorMode === "dark" ? "light" : "dark"} />
          </AuthProvider>
        </ThemeProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webCanvas: {
    flex: 1,
    backgroundColor: "#E8EFEA",
    alignItems: Platform.OS === "web" ? "center" : "stretch",
    justifyContent: Platform.OS === "web" ? "center" : "flex-start",
  },
  phoneFrame: {
    width: 390,
    height: 844,
    maxHeight: "96%",
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#F5FBF7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.16,
    shadowRadius: 36,
  },
  nativeFrame: {
    flex: 1,
  },
});
