import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { authPalettes, type AuthPalette } from "@/constants/appTheme";
import { usePreferences } from "@/stores/preferenceStore";

export default function ExploreScreen() {
  const { colorMode, t } = usePreferences();
  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("exploreTitle")}</Text>
      <Text style={styles.description}>{t("exploreDescription")}</Text>
    </View>
  );
}

function createStyles(palette: AuthPalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.screenBg,
      flex: 1,
      gap: 12,
      justifyContent: "center",
      padding: 24,
    },
    title: {
      color: palette.text,
      fontSize: 30,
      fontWeight: "900",
    },
    description: {
      color: palette.muted,
      fontSize: 16,
      lineHeight: 22,
    },
  });
}
