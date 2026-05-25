import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authPalettes, type AuthPalette } from "@/constants/appTheme";
import { ApiError, getApiErrorMessage } from "@/services/apiError";
import { profileService } from "@/services/profileService";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";
import type { UserProfileResponse } from "@/types/profile";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorMode, language, t } = usePreferences();

  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(
    () => getInitials(user?.fullName || "Hnanut"),
    [user?.fullName],
  );

  const activityLabel = profile
    ? getActivityLabel(profile.activityLevel, t)
    : "-";

  const goalLabel = profile ? getGoalLabel(profile.goal, t) : "-";

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileService.getProfile();
      setProfile(response);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 404) {
        setProfile(null);
        setError(t("profileNotFound"));
        return;
      }

      setError(getApiErrorMessage(loadError, language));
    } finally {
      setIsLoading(false);
    }
  }, [language, t]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandText}>Hnanut</Text>
            <Text style={styles.title}>{t("profileTitle")}</Text>
            <Text style={styles.subtitle}>{t("profileSubtitle")}</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={palette.primaryDark}
            />
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.userName}>{user?.fullName || "Hnanut"}</Text>
          <Text style={styles.userEmail}>{user?.email || "Account"}</Text>

          <View style={styles.targetPill}>
            <Ionicons
              name="flame-outline"
              size={15}
              color={palette.primaryDark}
            />
            <Text style={styles.targetPillText}>
              {profile?.dailyCalorieTarget ?? 0} {t("dailyCalorieTarget")}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.messageCard}>
            <ActivityIndicator color={palette.primaryDark} />
            <Text style={styles.messageText}>{t("loadingDefault")}</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="resize-outline"
            label={t("heightCm")}
            value={profile ? `${profile.heightCm} cm` : "-"}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            icon="barbell-outline"
            label={t("weightKg")}
            value={profile ? `${profile.weightKg} kg` : "-"}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            icon="calendar-outline"
            label={t("age")}
            value={profile ? String(profile.age) : "-"}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            icon="walk-outline"
            label={t("activityLevel")}
            value={activityLabel}
            palette={palette}
            styles={styles}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("personalInfo")}</Text>

          <InfoRow label={t("goal")} value={goalLabel} styles={styles} />
          <InfoRow
            label={t("targetCalories")}
            value={`${profile?.dailyCalorieTarget ?? 0} ${t("caloriesShort")}`}
            styles={styles}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("settings")}</Text>

          <SettingsRow
            icon="person-outline"
            title={t("accountSettings")}
            value={t("editAccountHint")}
            onPress={() => router.push("../settings/account")}
            palette={palette}
            styles={styles}
          />

          <SettingsRow
            icon="flag-outline"
            title={t("goalSettings")}
            value={t("editGoalHint")}
            onPress={() => router.push("../settings/goal")}
            palette={palette}
            styles={styles}
          />

          <SettingsRow
            icon="settings-outline"
            title={t("generalSettings")}
            value={t("generalSettingsHint")}
            onPress={() => router.push("../settings/general")}
            palette={palette}
            styles={styles}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
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
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <Ionicons name={icon} size={18} color={palette.primaryDark} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getActivityLabel(
  value: UserProfileResponse["activityLevel"],
  t: ReturnType<typeof usePreferences>["t"],
): string {
  switch (value) {
    case "Sedentary":
      return t("sedentary");
    case "Light":
      return t("lightActivity");
    case "Moderate":
      return t("moderateActivity");
    case "Active":
      return t("activeActivity");
    case "VeryActive":
      return t("veryActiveActivity");
  }
}

function getGoalLabel(
  value: UserProfileResponse["goal"],
  t: ReturnType<typeof usePreferences>["t"],
): string {
  switch (value) {
    case "LoseWeight":
      return t("loseWeight");
    case "MaintainWeight":
      return t("maintainWeight");
    case "GainWeight":
      return t("gainWeight");
  }
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
      justifyContent: "space-between",
    },
    brandText: {
      color: palette.primaryDark,
      fontSize: 13,
      fontWeight: "900",
    },
    title: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "900",
      marginTop: 4,
    },
    subtitle: {
      color: palette.muted,
      fontSize: 13,
      marginTop: 4,
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
    targetPill: {
      alignItems: "center",
      backgroundColor: palette.primarySoft,
      borderRadius: 999,
      flexDirection: "row",
      gap: 6,
      marginTop: 14,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    targetPillText: {
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "900",
    },
    messageCard: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 16,
      flexDirection: "row",
      gap: 10,
      padding: 14,
    },
    messageText: {
      color: palette.muted,
      fontSize: 13,
      fontWeight: "700",
    },
    errorText: {
      backgroundColor: palette.errorBg,
      borderRadius: 14,
      color: palette.errorText,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
      padding: 12,
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    metricCard: {
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 18,
      borderWidth: 1,
      flexBasis: "48%",
      flexGrow: 1,
      minHeight: 116,
      padding: 14,
    },
    metricIcon: {
      alignItems: "center",
      backgroundColor: palette.primarySoft,
      borderRadius: 14,
      height: 32,
      justifyContent: "center",
      width: 32,
    },
    metricLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "800",
      marginTop: 12,
    },
    metricValue: {
      color: palette.text,
      fontSize: 19,
      fontWeight: "900",
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
      justifyContent: "space-between",
      minHeight: 52,
      paddingHorizontal: 14,
    },
    infoLabel: {
      color: palette.muted,
      fontSize: 13,
      fontWeight: "800",
    },
    infoValue: {
      color: palette.text,
      fontSize: 13,
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
      fontSize: 11,
      fontWeight: "700",
      lineHeight: 15,
    },
  });
}
