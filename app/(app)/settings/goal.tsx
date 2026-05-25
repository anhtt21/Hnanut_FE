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
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authPalettes, type AuthPalette } from "@/constants/appTheme";
import { ApiError, getApiErrorMessage } from "@/services/apiError";
import { profileService } from "@/services/profileService";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";
import type {
  ActivityLevel,
  Gender,
  Goal,
  UpsertUserProfileRequest,
  UserProfileResponse,
} from "@/types/profile";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type Option<T extends string> = { value: T; label: string };

export default function GoalSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorMode, language, t } = usePreferences();

  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  const [goal, setGoal] = useState<Goal>("MaintainWeight");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("Moderate");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initials = useMemo(
    () => getInitials(user?.fullName || "Hnanut"),
    [user?.fullName],
  );

  const genderOptions = useMemo<Option<Gender>[]>(
    () => [
      { value: "Male", label: t("male") },
      { value: "Female", label: t("female") },
      { value: "Other", label: t("other") },
    ],
    [t],
  );

  const goalOptions = useMemo<Option<Goal>[]>(
    () => [
      { value: "LoseWeight", label: t("loseWeight") },
      { value: "MaintainWeight", label: t("maintainWeight") },
      { value: "GainWeight", label: t("gainWeight") },
    ],
    [t],
  );

  const activityOptions = useMemo<Option<ActivityLevel>[]>(
    () => [
      { value: "Sedentary", label: t("sedentary") },
      { value: "Light", label: t("lightActivity") },
      { value: "Moderate", label: t("moderateActivity") },
      { value: "Active", label: t("activeActivity") },
      { value: "VeryActive", label: t("veryActiveActivity") },
    ],
    [t],
  );

  const selectedActivityLabel =
    activityOptions.find((item) => item.value === activityLevel)?.label ??
    activityLevel;

  const fillForm = useCallback((profile: UserProfileResponse) => {
    setHeightCm(String(profile.heightCm));
    setWeightKg(String(profile.weightKg));
    setAge(String(profile.age));
    setDailyCalorieTarget(String(profile.dailyCalorieTarget));
    setGender(profile.gender);
    setGoal(profile.goal);
    setActivityLevel(profile.activityLevel);
  }, []);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const profile = await profileService.getProfile();
      fillForm(profile);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 404) {
        setError(t("profileNotFound"));
        return;
      }

      setError(getApiErrorMessage(loadError, language));
    } finally {
      setIsLoading(false);
    }
  }, [fillForm, language, t]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSave() {
    const request = buildRequest();

    if (!request) {
      setError(t("invalidProfileForm"));
      setSuccess(null);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const saved = await profileService.saveProfile(request);
      fillForm(saved);
      setSuccess(t("profileSaved"));
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, language));
    } finally {
      setIsSaving(false);
    }
  }

  function buildRequest(): UpsertUserProfileRequest | null {
    const nextHeight = toNumber(heightCm);
    const nextWeight = toNumber(weightKg);
    const nextAge = Number(age);
    const nextTarget = Number(dailyCalorieTarget);

    if (
      Number.isNaN(nextHeight) ||
      Number.isNaN(nextWeight) ||
      Number.isNaN(nextAge) ||
      Number.isNaN(nextTarget) ||
      nextHeight <= 0 ||
      nextHeight > 300 ||
      nextWeight <= 0 ||
      nextWeight > 500 ||
      nextAge <= 0 ||
      nextAge > 120 ||
      nextTarget <= 0 ||
      nextTarget > 10000
    ) {
      return null;
    }

    return {
      heightCm: nextHeight,
      weightKg: nextWeight,
      age: nextAge,
      gender,
      goal,
      activityLevel,
      dailyCalorieTarget: nextTarget,
    };
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.brandText}>Hnanut</Text>
              <Text style={styles.title}>{t("goalSettings")}</Text>
              <Text style={styles.subtitle}>{t("editGoalHint")}</Text>
            </View>

            <Pressable style={styles.headerIcon} onPress={() => router.back()}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={palette.primaryDark}
              />
            </Pressable>
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
                {dailyCalorieTarget || "0"} {t("dailyCalorieTarget")}
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
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <View style={styles.metricsGrid}>
            <MetricCard
              icon="resize-outline"
              label={t("heightCm")}
              value={`${heightCm || "0"} cm`}
              palette={palette}
              styles={styles}
            />
            <MetricCard
              icon="barbell-outline"
              label={t("weightKg")}
              value={`${weightKg || "0"} kg`}
              palette={palette}
              styles={styles}
            />
            <MetricCard
              icon="calendar-outline"
              label={t("age")}
              value={age || "0"}
              palette={palette}
              styles={styles}
            />
            <MetricCard
              icon="walk-outline"
              label={t("activityLevel")}
              value={selectedActivityLabel}
              palette={palette}
              styles={styles}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("bodyMetrics")}</Text>

            <View style={styles.inputGrid}>
              <ProfileField
                label={t("heightCm")}
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="decimal-pad"
                styles={styles}
              />
              <ProfileField
                label={t("weightKg")}
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="decimal-pad"
                styles={styles}
              />
              <ProfileField
                label={t("age")}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                styles={styles}
              />
              <ProfileField
                label={t("dailyCalorieTarget")}
                value={dailyCalorieTarget}
                onChangeText={setDailyCalorieTarget}
                keyboardType="numeric"
                styles={styles}
              />
            </View>

            <OptionGroup
              label={t("gender")}
              value={gender}
              options={genderOptions}
              onChange={setGender}
              styles={styles}
            />

            <OptionGroup
              label={t("goal")}
              value={goal}
              options={goalOptions}
              onChange={setGoal}
              styles={styles}
            />

            <OptionGroup
              label={t("activityLevel")}
              value={activityLevel}
              options={activityOptions}
              onChange={setActivityLevel}
              styles={styles}
            />

            <Pressable
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              disabled={isSaving}
              onPress={handleSave}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.saveButtonText}>{t("saveProfile")}</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

function ProfileField({
  label,
  value,
  onChangeText,
  keyboardType,
  styles,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType: "numeric" | "decimal-pad";
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder="0"
        placeholderTextColor={styles.placeholderColor.color}
        style={styles.input}
      />
    </View>
  );
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  styles,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onChange(option.value)}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function toNumber(value: string): number {
  return Number(value.replace(",", "."));
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
    keyboardView: {
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
    successText: {
      backgroundColor: palette.primarySoft,
      borderRadius: 14,
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "800",
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
      gap: 16,
      padding: 16,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "900",
    },
    inputGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    field: {
      flexBasis: "48%",
      flexGrow: 1,
      gap: 7,
    },
    fieldLabel: {
      color: palette.label,
      fontSize: 12,
      fontWeight: "900",
    },
    input: {
      backgroundColor: palette.inputBg,
      borderRadius: 14,
      color: palette.inputText,
      fontSize: 15,
      fontWeight: "800",
      minHeight: 50,
      paddingHorizontal: 14,
    },
    placeholderColor: {
      color: palette.placeholder,
    },
    optionGroup: {
      gap: 8,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      backgroundColor: palette.inputBg,
      borderColor: palette.border,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 13,
      paddingVertical: 9,
    },
    chipSelected: {
      backgroundColor: palette.primaryDark,
      borderColor: palette.primaryDark,
    },
    chipText: {
      color: palette.label,
      fontSize: 12,
      fontWeight: "800",
    },
    chipTextSelected: {
      color: "#FFFFFF",
    },
    saveButton: {
      alignItems: "center",
      backgroundColor: palette.primary,
      borderRadius: 999,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      minHeight: 52,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },
    disabledButton: {
      opacity: 0.6,
    },
  });
}
