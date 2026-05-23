import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { authPalettes } from "@/constants/appTheme";
import { usePreferences } from "@/stores/preferenceStore";

type FullScreenLoaderProps = {
  label?: string;
};

export default function FullScreenLoader({ label }: FullScreenLoaderProps) {
  const { colorMode, t } = usePreferences();
  const palette = authPalettes[colorMode];
  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={palette.primary} size="large" />
      <Text style={styles.text}>{label ?? t("loadingDefault")}</Text>
    </View>
  );
}

function createStyles(palette: (typeof authPalettes)["light"]) {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: palette.screenBg,
      flex: 1,
      gap: 12,
      justifyContent: "center",
      padding: 24,
    },
    text: {
      color: palette.muted,
      fontSize: 15,
    },
  });
}
