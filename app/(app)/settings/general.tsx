import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { type ComponentProps, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authPalettes, type AuthPalette } from "@/constants/appTheme";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export default function GeneralSettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { colorMode, language, t, toggleColorMode, toggleLanguage } =
    usePreferences();

  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.headerIcon} onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={palette.primaryDark}
            />
          </Pressable>

          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>{t("generalSettings")}</Text>
            <Text style={styles.subtitle}>{t("generalSettingsHint")}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("generalSettings")}</Text>

          <SettingsRow
            icon="language-outline"
            title={t("language")}
            value={language.toUpperCase()}
            onPress={() => void toggleLanguage()}
            palette={palette}
            styles={styles}
          />

          <SettingsRow
            icon={colorMode === "dark" ? "moon-outline" : "sunny-outline"}
            title={t("appearance")}
            value={colorMode === "dark" ? t("dark") : t("light")}
            onPress={() => void toggleColorMode()}
            palette={palette}
            styles={styles}
          />
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => void handleSignOut()}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color={palette.errorText}
          />
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  title,
  value,
  onPress,
  palette,
  styles,
}: {
  icon: IoniconName;
  title: string;
  value: string;
  onPress: () => void;
  palette: AuthPalette;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable style={styles.settingsRow} onPress={onPress}>
      <View style={styles.settingsIcon}>
        <Ionicons name={icon} size={18} color={palette.primaryDark} />
      </View>
      <View style={styles.settingsTextBlock}>
        <Text style={styles.settingsTitle}>{title}</Text>
        <Text style={styles.settingsValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={palette.icon} />
    </Pressable>
  );
}

function createStyles(palette: AuthPalette) {
  return StyleSheet.create({
    safeArea: {
      backgroundColor: palette.screenBg,
      flex: 1,
    },
    scrollContent: {
      gap: 16,
      padding: 18,
      paddingBottom: 32,
    },
    headerRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
    },
    headerIcon: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 18,
      borderWidth: 1,
      height: 38,
      justifyContent: "center",
      width: 38,
    },
    headerTextBlock: {
      flex: 1,
    },
    title: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "900",
    },
    subtitle: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 4,
    },
    card: {
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 22,
      borderWidth: 1,
      gap: 12,
      padding: 16,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "900",
    },
    settingsRow: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 16,
      flexDirection: "row",
      gap: 12,
      minHeight: 64,
      paddingHorizontal: 12,
    },
    settingsIcon: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 13,
      height: 32,
      justifyContent: "center",
      width: 32,
    },
    settingsTextBlock: {
      flex: 1,
      gap: 3,
    },
    settingsTitle: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "900",
    },
    settingsValue: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "800",
    },
    logoutButton: {
      alignItems: "center",
      backgroundColor: palette.errorBg,
      borderRadius: 999,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      minHeight: 52,
    },
    logoutText: {
      color: palette.errorText,
      fontSize: 14,
      fontWeight: "900",
    },
  });
}
