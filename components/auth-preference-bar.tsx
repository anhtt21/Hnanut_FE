import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authPalettes } from "@/constants/appTheme";
import { usePreferences } from "@/stores/preferenceStore";

export default function AuthPreferenceBar() {
  const { colorMode, language, t, toggleColorMode, toggleLanguage } =
    usePreferences();
  const palette = authPalettes[colorMode];
  const styles = createStyles(palette);
  const isDark = colorMode === "dark";

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        style={styles.pill}
        onPress={toggleLanguage}
      >
        <Ionicons name="language-outline" size={15} color={palette.primaryDark} />
        <Text style={styles.pillText}>{language === "vi" ? "VI" : "EN"}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.pill}
        onPress={toggleColorMode}
      >
        <Ionicons
          name={isDark ? "moon-outline" : "sunny-outline"}
          size={15}
          color={palette.primaryDark}
        />
        <Text style={styles.pillText}>{isDark ? t("dark") : t("light")}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(palette: (typeof authPalettes)["light"]) {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      justifyContent: "flex-end",
      marginBottom: 18,
    },
    pill: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: "row",
      gap: 6,
      minHeight: 34,
      paddingHorizontal: 12,
    },
    pillText: {
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "900",
    },
  });
}
