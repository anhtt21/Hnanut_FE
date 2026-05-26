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

export default function RegisterScreen() {
  const router = useRouter();
  const { setSession } = useAuth();
  const { colorMode, language, t } = usePreferences();
  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmPasswordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !confirmPasswordMismatch &&
    !isSubmitting;

  async function handleSubmit() {
    const validationError = validateRegister(
      fullName,
      email,
      password,
      confirmPassword,
      t,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authService.register({
        fullName: fullName.trim(),
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

          <View style={styles.card}>
            <View style={styles.headerBand}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}>
                  <Ionicons name="nutrition" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.brandText}>Hnanut</Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{t("registerTitle")}</Text>
              <Text style={styles.subtitle}>{t("registerSubtitle")}</Text>

              <View style={styles.field}>
                <Text style={styles.label}>{t("fullName")}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={palette.icon}
                  />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder={t("fullNamePlaceholder")}
                    placeholderTextColor={palette.placeholder}
                    style={[styles.input, webInputStyle]}
                  />
                </View>
              </View>

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
                <Text style={styles.label}>{t("password")}</Text>
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
                    placeholder={t("passwordCreatePlaceholder")}
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
                      name={
                        isPasswordVisible ? "eye-off-outline" : "eye-outline"
                      }
                      size={18}
                      color={palette.icon}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t("confirmPassword")}</Text>
                <View
                  style={[
                    styles.inputWrap,
                    confirmPasswordMismatch && styles.inputWrapError,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={palette.icon}
                  />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!isConfirmVisible}
                    placeholder={t("confirmPasswordPlaceholder")}
                    placeholderTextColor={palette.placeholder}
                    style={[styles.input, webInputStyle]}
                  />
                  <Pressable
                    accessibilityLabel={
                      isConfirmVisible ? t("hidePassword") : t("showPassword")
                    }
                    accessibilityRole="button"
                    hitSlop={10}
                    onPress={() => setIsConfirmVisible((value) => !value)}
                  >
                    <Ionicons
                      name={isConfirmVisible ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={palette.icon}
                    />
                  </Pressable>
                </View>
                {confirmPasswordMismatch ? (
                  <Text style={styles.fieldError}>{t("confirmMismatch")}</Text>
                ) : (
                  <Text style={styles.hint}>{t("passwordHint")}</Text>
                )}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[
                  styles.primaryButton,
                  !canSubmit && styles.buttonDisabled,
                ]}
                disabled={!canSubmit}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {t("registerButton")}
                  </Text>
                )}
              </Pressable>

              <Link href="/login" style={styles.footerLink}>
                {t("registerLoginCta")}
              </Link>
            </View>
          </View>

          <Text style={styles.policyText}>{t("policy")}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function validateRegister(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  t: ReturnType<typeof usePreferences>["t"],
): string | null {
  if (!fullName.trim()) {
    return t("fullNameRequired");
  }

  if (!isValidGmail(email)) {
    return t("gmailError");
  }

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9\s]/.test(password)
  ) {
    return t("passwordStrongError");
  }

  if (password !== confirmPassword) {
    return t("confirmMismatch");
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
    card: {
      alignSelf: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 28,
      elevation: 5,
      maxWidth: 420,
      overflow: "hidden",
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.08,
      shadowRadius: 28,
      width: "100%",
    },
    headerBand: {
      backgroundColor: palette.headerBand,
      paddingBottom: 22,
      paddingHorizontal: 20,
      paddingTop: 18,
    },
    brandRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
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
      fontWeight: "900",
    },
    content: {
      gap: 14,
      paddingBottom: 24,
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    title: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "900",
      textAlign: "center",
    },
    subtitle: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 4,
      textAlign: "center",
    },
    field: {
      gap: 8,
    },
    label: {
      color: palette.label,
      fontSize: 12,
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
    inputWrapError: {
      borderColor: palette.errorText,
      borderWidth: 1,
    },
    input: {
      color: palette.inputText,
      flex: 1,
      fontSize: 14,
      minHeight: 52,
    },
    hint: {
      color: palette.policy,
      fontSize: 11,
      lineHeight: 16,
    },
    fieldError: {
      color: palette.errorText,
      fontSize: 11,
      fontWeight: "700",
      lineHeight: 16,
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
    footerLink: {
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "900",
      textAlign: "center",
    },
    policyText: {
      alignSelf: "center",
      color: palette.policy,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 18,
      maxWidth: 340,
      textAlign: "center",
    },
  });
}
