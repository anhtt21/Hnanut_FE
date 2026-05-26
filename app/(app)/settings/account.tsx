import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";
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
  Image,
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
import { accountService, toApiAssetUrl } from "@/services/accountService";
import { getApiErrorMessage } from "@/services/apiError";
import { useAuth } from "@/stores/authStore";
import { usePreferences } from "@/stores/preferenceStore";
import type { AccountResponse } from "@/types/account";
import { webInputStyle } from "@/utils/webInputStyle";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();
  const { colorMode, language, t } = usePreferences();

  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const remoteAvatarUri = toApiAssetUrl(account?.avatarUrl ?? user?.avatarUrl);
  const avatarUri = localAvatarUri ?? withCacheBust(remoteAvatarUri, avatarVersion);
  const shouldShowAvatar = Boolean(avatarUri) && !avatarLoadFailed;

  const initials = useMemo(
    () => getInitials(fullName || user?.fullName || "Hnanut"),
    [fullName, user?.fullName],
  );

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUri]);

  const loadAccount = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await accountService.getAccount();
      setAccount(response);
      setFullName(response.fullName);
      updateUser({
        userId: response.userId,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
        avatarUrl: response.avatarUrl ?? null,
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, language));
    } finally {
      setIsLoading(false);
    }
  }, [language, updateUser]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  async function handleUpdateAccount() {
    if (!fullName.trim()) {
      setError(t("fullNameRequired"));
      setSuccess(null);
      return;
    }

    setIsSavingAccount(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await accountService.updateAccount({
        fullName: fullName.trim(),
      });

      setAccount(response);
      setFullName(response.fullName);
      updateUser({
        userId: response.userId,
        email: response.email,
        role: response.role,
        fullName: response.fullName,
        avatarUrl: response.avatarUrl ?? null,
      });
      setSuccess(t("accountSaved"));
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, language));
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      setSuccess(null);
      return;
    }

    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      await accountService.changePassword({
        currentPassword,
        newPassword,
      });

      await signOut();
      router.replace("/login");
    } catch (passwordError) {
      setError(getApiErrorMessage(passwordError, language));
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handlePickAvatar() {
    setIsUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ["images"],
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      setLocalAvatarUri(result.assets[0].uri);
      setAvatarLoadFailed(false);

      const formData = await buildAvatarFormData(result.assets[0]);
      const response = await accountService.uploadAvatar(formData);

      setAccount((current) =>
        current
          ? { ...current, avatarUrl: response.avatarUrl }
          : user
            ? {
                userId: user.userId,
                email: user.email,
                fullName: fullName.trim() || user.fullName,
                role: user.role,
                avatarUrl: response.avatarUrl,
              }
            : current,
      );
      updateUser({ avatarUrl: response.avatarUrl });
      setAvatarVersion(Date.now());
      setSuccess(t("avatarUpdated"));
    } catch (avatarError) {
      setLocalAvatarUri(null);
      setError(getApiErrorMessage(avatarError, language));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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

          {isLoading ? (
            <View style={styles.messageCard}>
              <ActivityIndicator color={palette.primaryDark} />
              <Text style={styles.messageText}>{t("loadingDefault")}</Text>
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <View style={styles.profileCard}>
            {shouldShowAvatar ? (
              <Image
                source={{ uri: avatarUri! }}
                style={styles.avatarImage}
                resizeMode="cover"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}

            <Pressable
              style={styles.avatarButton}
              disabled={isUploadingAvatar}
              onPress={handlePickAvatar}
            >
              {isUploadingAvatar ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.avatarButtonText}>{t("pickAvatar")}</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("personalInfo")}</Text>

            <Field
              icon="person-outline"
              label={t("displayName")}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t("fullNamePlaceholder")}
              styles={styles}
              palette={palette}
            />

            <ReadonlyRow
              icon="mail-outline"
              label={t("email")}
              value={account?.email ?? user?.email ?? "-"}
              styles={styles}
              palette={palette}
            />
          </View>

          <View style={styles.card}>
            <Pressable
              style={styles.passwordToggleRow}
              onPress={() => setIsPasswordOpen((value) => !value)}
            >
              <View style={styles.passwordIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={palette.primaryDark}
                />
              </View>
              <Text style={styles.passwordToggleText}>
                {t("changePassword")}
              </Text>
              <Ionicons
                name={isPasswordOpen ? "chevron-up" : "chevron-forward"}
                size={18}
                color={palette.icon}
              />
            </Pressable>

            {isPasswordOpen ? (
              <View style={styles.passwordForm}>
                <Field
                  icon="lock-closed-outline"
                  label={t("currentPassword")}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder={t("passwordPlaceholder")}
                  secureTextEntry
                  styles={styles}
                  palette={palette}
                />

                <Field
                  icon="key-outline"
                  label={t("newPassword")}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t("passwordCreatePlaceholder")}
                  secureTextEntry
                  styles={styles}
                  palette={palette}
                />

                <Field
                  icon="shield-checkmark-outline"
                  label={t("confirmPassword")}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t("confirmPasswordPlaceholder")}
                  secureTextEntry
                  styles={styles}
                  palette={palette}
                />

                <Pressable
                  style={[
                    styles.primaryButton,
                    isChangingPassword && styles.disabledButton,
                  ]}
                  disabled={isChangingPassword}
                  onPress={handleChangePassword}
                >
                  {isChangingPassword ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {t("changePassword")}
                    </Text>
                  )}
                </Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.primaryButton,
              (isSavingAccount || isLoading) && styles.disabledButton,
            ]}
            disabled={isSavingAccount || isLoading}
            onPress={handleUpdateAccount}
          >
            {isSavingAccount ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{t("updateAccount")}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  styles,
  palette,
}: {
  icon: IoniconName;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  styles: ReturnType<typeof createStyles>;
  palette: AuthPalette;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={palette.icon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.placeholder}
          secureTextEntry={secureTextEntry}
          style={[styles.input, webInputStyle]}
        />
      </View>
    </View>
  );
}

function ReadonlyRow({
  icon,
  label,
  value,
  styles,
  palette,
}: {
  icon: IoniconName;
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
  palette: AuthPalette;
}) {
  return (
    <View style={styles.readonlyRow}>
      <Ionicons name={icon} size={18} color={palette.icon} />
      <View style={styles.readonlyTextBlock}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.readonlyValue}>{value}</Text>
      </View>
    </View>
  );
}

async function buildAvatarFormData(asset: ImagePickerAsset): Promise<FormData> {
  const formData = new FormData();
  const mimeType = asset.mimeType ?? "image/jpeg";
  const fileName = asset.fileName ?? `avatar.${extensionFromMime(mimeType)}`;

  if (Platform.OS === "web") {
    const blob = await fetch(asset.uri).then((response) => response.blob());
    formData.append("file", blob, fileName);
    return formData;
  }

  formData.append("file", {
    uri: asset.uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  return formData;
}

function withCacheBust(url: string | null, version: number): string | null {
  if (!url) return null;

  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("file:")) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}v=${version}`;
}

function extensionFromMime(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
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
    safeArea: { backgroundColor: palette.screenBg, flex: 1 },
    keyboardView: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { gap: 16, padding: 18, paddingBottom: 112 },
    headerRow: { alignItems: "center", flexDirection: "row", gap: 12 },
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
    headerTextBlock: { flex: 1 },
    title: { color: palette.text, fontSize: 24, fontWeight: "900" },
    subtitle: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 4,
    },
    messageCard: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 16,
      flexDirection: "row",
      gap: 10,
      padding: 14,
    },
    messageText: { color: palette.muted, fontSize: 13, fontWeight: "700" },
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
    profileCard: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 24,
      borderWidth: 1,
      gap: 12,
      padding: 18,
    },
    avatar: {
      alignItems: "center",
      backgroundColor: palette.primarySoft,
      borderColor: palette.primaryDark,
      borderRadius: 48,
      borderWidth: 3,
      height: 96,
      justifyContent: "center",
      width: 96,
    },
    avatarImage: {
      borderColor: palette.primaryDark,
      borderRadius: 48,
      borderWidth: 3,
      height: 96,
      width: 96,
    },
    avatarText: { color: palette.primaryDark, fontSize: 28, fontWeight: "900" },
    avatarButton: {
      alignItems: "center",
      backgroundColor: palette.primary,
      borderRadius: 999,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      minHeight: 42,
      paddingHorizontal: 16,
    },
    avatarButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
    card: {
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 22,
      borderWidth: 1,
      gap: 14,
      padding: 16,
    },
    sectionTitle: { color: palette.text, fontSize: 16, fontWeight: "900" },
    field: { gap: 8 },
    label: { color: palette.label, fontSize: 12, fontWeight: "900" },
    inputWrap: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 14,
      flexDirection: "row",
      gap: 10,
      minHeight: 52,
      paddingHorizontal: 14,
    },
    input: { color: palette.inputText, flex: 1, fontSize: 14, minHeight: 52 },
    readonlyRow: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 14,
      flexDirection: "row",
      gap: 10,
      minHeight: 54,
      paddingHorizontal: 14,
    },
    readonlyTextBlock: { flex: 1, gap: 3 },
    readonlyValue: { color: palette.text, fontSize: 14, fontWeight: "800" },
    primaryButton: {
      alignItems: "center",
      backgroundColor: palette.primary,
      borderRadius: 999,
      justifyContent: "center",
      minHeight: 52,
    },
    footer: {
      backgroundColor: palette.screenBg,
      borderTopColor: palette.border,
      borderTopWidth: 1,
      paddingBottom: Platform.OS === "web" ? 18 : 22,
      paddingHorizontal: 18,
      paddingTop: 10,
    },
    primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
    disabledButton: { opacity: 0.6 },
    passwordToggleRow: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 16,
      flexDirection: "row",
      gap: 12,
      minHeight: 58,
      paddingHorizontal: 12,
    },
    passwordIcon: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 13,
      height: 32,
      justifyContent: "center",
      width: 32,
    },
    passwordToggleText: {
      color: palette.text,
      flex: 1,
      fontSize: 14,
      fontWeight: "900",
    },
    passwordForm: {
      gap: 14,
    },
  });
}
