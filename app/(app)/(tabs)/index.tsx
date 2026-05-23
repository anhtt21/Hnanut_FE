import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authPalettes, type AuthPalette } from "@/constants/appTheme";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { colorMode, t } = usePreferences();
  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HnaNut</Text>
      <Text style={styles.description}>{t("homeDescription")}</Text>

      {user ? (
        <Text style={styles.userText}>
          {user.fullName} - {user.email}
        </Text>
      ) : (
        <Text style={styles.userText}>{t("restoredSession")}</Text>
      )}

      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>{t("signOut")}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(palette: AuthPalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.screenBg,
      flex: 1,
      gap: 16,
      justifyContent: "center",
      padding: 24,
    },
    title: {
      color: palette.text,
      fontSize: 32,
      fontWeight: "800",
    },
    description: {
      color: palette.muted,
      fontSize: 16,
    },
    userText: {
      color: palette.label,
      fontSize: 15,
    },
    button: {
      alignItems: "center",
      backgroundColor: palette.primaryDark,
      borderRadius: 8,
      marginTop: 8,
      paddingVertical: 14,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
