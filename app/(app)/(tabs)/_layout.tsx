import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { authPalettes } from "@/constants/appTheme";
import { usePreferences } from "@/stores/preferenceStore";

export default function TabLayout() {
  const { colorMode, t } = usePreferences();
  const palette = authPalettes[colorMode];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.primaryDark,
        tabBarInactiveTintColor: palette.icon,
        tabBarStyle: {
          backgroundColor: palette.cardBg,
          borderTopColor: palette.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabHome"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("tabExplore"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profileTab"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
