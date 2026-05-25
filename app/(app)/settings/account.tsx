import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { type ComponentProps, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authPalettes, type AuthPalette } from "@/constants/appTheme";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorMode, t } = usePreferences();

  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);
  const initials = useMemo(
    () => getInitials(user?.fullName || "Hnanut"),
    [user?.fullName],
  );

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
            <Text style={styles.title}>{t("accountSettings")}</Text>
            <Text style={styles.subtitle}>{t("editAccountHint")}</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.userName}>{user?.fullName || "Hnanut"}</Text>
          <Text style={styles.userEmail}>{user?.email || "Account"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("personalInfo")}</Text>

          <InfoRow
            icon="person-outline"
            label={t("displayName")}
            value={user?.fullName || "-"}
            palette={palette}
            styles={styles}
          />

          <InfoRow
            icon="mail-outline"
            label={t("email")}
            value={user?.email || "-"}
            palette={palette}
            styles={styles}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("password")}</Text>

          <View style={styles.comingSoonBox}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color={palette.primaryDark}
            />
            <View style={styles.comingSoonTextBlock}>
              <Text style={styles.comingSoonTitle}>{t("password")}</Text>
              <Text style={styles.comingSoonText}>{t("comingSoon")}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  palette,
  styles,
}: {
  icon: IoniconName;
  label: string;
  value: string;
  palette: AuthPalette;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={palette.primaryDark} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
    profileCard: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 24,
      borderWidth: 1,
      padding: 18,
    },
    avatar: {
      alignItems: "center",
      backgroundColor: palette.primarySoft,
      borderColor: palette.primaryDark,
      borderRadius: 44,
      borderWidth: 3,
      height: 88,
      justifyContent: "center",
      width: 88,
    },
    avatarText: {
      color: palette.primaryDark,
      fontSize: 26,
      fontWeight: "900",
    },
    userName: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "900",
      marginTop: 12,
    },
    userEmail: {
      color: palette.muted,
      fontSize: 12,
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
    infoRow: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 16,
      flexDirection: "row",
      gap: 12,
      minHeight: 58,
      paddingHorizontal: 12,
    },
    infoIcon: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 13,
      height: 32,
      justifyContent: "center",
      width: 32,
    },
    infoTextBlock: {
      flex: 1,
      gap: 3,
    },
    infoLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "800",
    },
    infoValue: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "900",
    },
    comingSoonBox: {
      alignItems: "center",
      backgroundColor: palette.primarySoft,
      borderRadius: 18,
      flexDirection: "row",
      gap: 12,
      padding: 14,
    },
    comingSoonTextBlock: {
      flex: 1,
      gap: 4,
    },
    comingSoonTitle: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "900",
    },
    comingSoonText: {
      color: palette.muted,
      fontSize: 12,
      lineHeight: 17,
    },
  });
}
