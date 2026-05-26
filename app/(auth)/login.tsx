import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

import AuthPreferenceBar from "@/components/auth-preference-bar";
import { authPalettes, type AuthPalette } from "@/constants/appTheme";
import { getApiErrorMessage } from "@/services/apiError";
import { authService } from "@/services/authService";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";
import { webInputStyle } from "@/utils/webInputStyle";

export default function LoginScreen() {
  const router = useRouter();
  const { setSession } = useAuth();
  const { colorMode, language, t } = usePreferences();
  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    const validationError = validateLogin(email, password, t);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      await setSession(response);
      router.replace("/");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, language));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleToggleForgotPassword() {
    setIsForgotOpen((value) => !value);
    setForgotMessage(null);
    setForgotError(null);
    setForgotEmail((value) => value || email.trim());
  }

  async function handleForgotSubmit() {
    if (!isValidGmail(forgotEmail)) {
      setForgotError(t("gmailError"));
      setForgotMessage(null);
      return;
    }

    try {
      setForgotError(null);
      setForgotMessage(null);

      const response = await authService.forgotPassword({
        email: forgotEmail.trim(),
      });

      setForgotMessage(response.message || t("forgotSuccess"));
    } catch (submitError) {
      setForgotError(getApiErrorMessage(submitError, language));
    }
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
          <AuthPreferenceBar />

          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Ionicons name="nutrition" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.brandText}>Hnanut</Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroImage}>
              <View style={styles.plate}>
                <View style={styles.foodDotLarge} />
                <View style={styles.foodDotSmall} />
                <View style={styles.foodStick} />
              </View>
              <View style={styles.metricBadge}>
                <Text style={styles.metricLabel}>{t("caloriesShort")}</Text>
                <Text style={styles.metricValue}>420</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{t("loginTitle")}</Text>
            <Text style={styles.subtitle}>{t("loginSubtitle")}</Text>

            <View style={styles.field}>
              <Text style={styles.label}>{t("email")}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={palette.icon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder={t("emailPlaceholder")}
                  placeholderTextColor={palette.placeholder}
                  style={[styles.input, webInputStyle]}
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t("password")}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleToggleForgotPassword}
                >
                  <Text style={styles.forgotText}>{t("forgotPassword")}</Text>
                </Pressable>
              </View>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={palette.icon}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  placeholder={t("passwordPlaceholder")}
                  placeholderTextColor={palette.placeholder}
                  style={[styles.input, webInputStyle]}
                />
                <Pressable
                  accessibilityLabel={
                    isPasswordVisible ? t("hidePassword") : t("showPassword")
                  }
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => setIsPasswordVisible((value) => !value)}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={palette.icon}
                  />
                </Pressable>
              </View>
            </View>

            {isForgotOpen ? (
              <View style={styles.forgotPanel}>
                <Text style={styles.forgotTitle}>{t("forgotTitle")}</Text>
                <Text style={styles.forgotSubtitle}>{t("forgotSubtitle")}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={palette.icon} />
                  <TextInput
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder={t("forgotEmailPlaceholder")}
                    placeholderTextColor={palette.placeholder}
                    style={[styles.input, webInputStyle]}
                  />
                </View>
                {forgotError ? (
                  <Text style={styles.fieldError}>{forgotError}</Text>
                ) : null}
                {forgotMessage ? (
                  <Text style={styles.successText}>{forgotMessage}</Text>
                ) : null}
                <View style={styles.forgotActions}>
                  <Pressable
                    style={styles.smallSecondaryButton}
                    onPress={handleToggleForgotPassword}
                  >
                    <Text style={styles.smallSecondaryButtonText}>
                      {t("forgotClose")}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.smallPrimaryButton}
                    onPress={handleForgotSubmit}
                  >
                    <Text style={styles.smallPrimaryButtonText}>
                      {t("forgotSubmit")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
              disabled={!canSubmit}
              onPress={handleSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{t("loginButton")}</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>{t("or")}</Text>
              <View style={styles.divider} />
            </View>

            <Link href="/register" asChild>
              <Pressable style={styles.secondaryButton}>
                <Ionicons
                  name="person-add-outline"
                  size={16}
                  color={palette.primaryDark}
                />
                <Text style={styles.secondaryButtonText}>
                  {t("loginRegisterCta")}
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function validateLogin(
  email: string,
  password: string,
  t: ReturnType<typeof usePreferences>["t"],
): string | null {
  if (!isValidGmail(email)) {
    return t("gmailError");
  }

  if (!password.trim()) {
    return t("passwordRequired");
  }

  return null;
}

function isValidGmail(value: string): boolean {
  return /^[^\s@]+@gmail\.com$/i.test(value.trim());
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
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 22,
      paddingVertical: 24,
    },
    brandRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      marginBottom: 18,
    },
    brandMark: {
      alignItems: "center",
      backgroundColor: palette.primaryDark,
      borderRadius: 16,
      height: 30,
      justifyContent: "center",
      width: 30,
    },
    brandText: {
      color: palette.primaryDark,
      fontSize: 15,
      fontWeight: "800",
    },
    heroCard: {
      alignSelf: "center",
      backgroundColor: palette.heroCardBg,
      borderRadius: 24,
      elevation: 7,
      marginBottom: -42,
      padding: 10,
      shadowColor: palette.primaryDark,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      width: "88%",
      zIndex: 2,
    },
    heroImage: {
      alignItems: "center",
      backgroundColor: palette.heroBg,
      borderRadius: 18,
      height: 154,
      justifyContent: "center",
      overflow: "hidden",
    },
    plate: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 54,
      borderWidth: 10,
      height: 108,
      justifyContent: "center",
      shadowColor: "#064E2B",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 18,
      width: 108,
    },
    foodDotLarge: {
      backgroundColor: palette.orange,
      borderRadius: 24,
      height: 48,
      transform: [{ rotate: "-14deg" }],
      width: 34,
    },
    foodDotSmall: {
      backgroundColor: palette.primary,
      borderRadius: 18,
      height: 30,
      position: "absolute",
      right: 22,
      top: 28,
      width: 30,
    },
    foodStick: {
      backgroundColor: palette.yellow,
      borderRadius: 10,
      height: 13,
      position: "absolute",
      width: 54,
    },
    metricBadge: {
      backgroundColor: palette.cardBg,
      borderRadius: 999,
      bottom: 14,
      paddingHorizontal: 14,
      paddingVertical: 8,
      position: "absolute",
      right: 14,
    },
    metricLabel: {
      color: palette.icon,
      fontSize: 10,
      fontWeight: "700",
    },
    metricValue: {
      color: palette.primaryDark,
      fontSize: 14,
      fontWeight: "900",
    },
    card: {
      backgroundColor: palette.cardBg,
      borderRadius: 28,
      elevation: 5,
      gap: 14,
      paddingBottom: 24,
      paddingHorizontal: 20,
      paddingTop: 68,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.08,
      shadowRadius: 28,
    },
    title: {
      color: palette.text,
      fontSize: 25,
      fontWeight: "900",
      textAlign: "center",
    },
    subtitle: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 6,
      textAlign: "center",
    },
    field: {
      gap: 8,
    },
    labelRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    label: {
      color: palette.label,
      fontSize: 12,
      fontWeight: "800",
    },
    forgotText: {
      color: palette.primaryDark,
      fontSize: 11,
      fontWeight: "800",
    },
    inputWrap: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 14,
      flexDirection: "row",
      gap: 10,
      minHeight: 52,
      paddingHorizontal: 14,
    },
    input: {
      color: palette.inputText,
      flex: 1,
      fontSize: 14,
      minHeight: 52,
    },
    forgotPanel: {
      backgroundColor: palette.primarySoft,
      borderRadius: 18,
      gap: 10,
      padding: 14,
    },
    forgotTitle: {
      color: palette.text,
      fontSize: 15,
      fontWeight: "900",
    },
    forgotSubtitle: {
      color: palette.muted,
      fontSize: 12,
      lineHeight: 17,
    },
    forgotActions: {
      flexDirection: "row",
      gap: 10,
    },
    smallPrimaryButton: {
      alignItems: "center",
      backgroundColor: palette.primary,
      borderRadius: 999,
      flex: 1,
      justifyContent: "center",
      minHeight: 40,
      paddingHorizontal: 12,
    },
    smallPrimaryButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "900",
    },
    smallSecondaryButton: {
      alignItems: "center",
      borderColor: palette.border,
      borderRadius: 999,
      borderWidth: 1,
      flex: 1,
      justifyContent: "center",
      minHeight: 40,
      paddingHorizontal: 12,
    },
    smallSecondaryButtonText: {
      color: palette.label,
      fontSize: 12,
      fontWeight: "900",
    },
    fieldError: {
      color: palette.errorText,
      fontSize: 12,
      fontWeight: "700",
    },
    successText: {
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
    },
    error: {
      backgroundColor: palette.errorBg,
      borderRadius: 12,
      color: palette.errorText,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
      padding: 12,
    },
    primaryButton: {
      alignItems: "center",
      backgroundColor: palette.primary,
      borderRadius: 999,
      justifyContent: "center",
      marginTop: 4,
      minHeight: 52,
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },
    dividerRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
    },
    divider: {
      backgroundColor: palette.divider,
      flex: 1,
      height: 1,
    },
    dividerText: {
      color: palette.placeholder,
      fontSize: 11,
      fontWeight: "700",
    },
    secondaryButton: {
      alignItems: "center",
      borderColor: palette.border,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      minHeight: 46,
    },
    secondaryButtonText: {
      color: palette.label,
      fontSize: 13,
      fontWeight: "800",
    },
  });
}
