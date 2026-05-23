import * as SecureStore from "expo-secure-store";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import type { ColorMode } from "@/constants/appTheme";

export type Language = "vi" | "en";

type Preferences = {
  language: Language;
  colorMode: ColorMode;
};

type PreferenceState = Preferences & {
  isDark: boolean;
  setLanguage: (language: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  setColorMode: (colorMode: ColorMode) => Promise<void>;
  toggleColorMode: () => Promise<void>;
  t: (key: TranslationKey) => string;
};

const PREFERENCES_KEY = "hnanut.preferences";

const dictionaries = {
  vi: {
    loadingDefault: "Đang tải...",
    checkingLogin: "Đang kiểm tra đăng nhập...",
    restoringSession: "Đang khôi phục phiên đăng nhập...",
    light: "Sáng",
    dark: "Tối",
    languageShort: "VI",
    email: "Email",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
    fullName: "Họ và tên",
    loginTitle: "Chào mừng trở lại",
    loginSubtitle: "Giữ nhịp dinh dưỡng của bạn mỗi ngày.",
    loginButton: "Đăng nhập",
    forgotPassword: "Quên mật khẩu?",
    forgotTitle: "Khôi phục mật khẩu",
    forgotSubtitle: "Nhập Gmail đã đăng ký để chuẩn bị yêu cầu đặt lại mật khẩu.",
    forgotSubmit: "Gửi yêu cầu",
    forgotClose: "Đóng",
    forgotSuccess:
      "Yêu cầu khôi phục đã được ghi nhận. Backend gửi email reset sẽ được nối ở task tiếp theo.",
    forgotEmailPlaceholder: "example@gmail.com",
    passwordPlaceholder: "Nhập mật khẩu",
    loginRegisterCta: "Chưa có tài khoản? Đăng ký",
    registerTitle: "Tạo tài khoản Hnanut",
    registerSubtitle:
      "Bắt đầu hành trình dinh dưỡng tốt hơn cùng chúng tôi.",
    registerButton: "Tạo tài khoản",
    registerLoginCta: "Đã có tài khoản? Đăng nhập",
    fullNamePlaceholder: "Nguyễn Văn A",
    emailPlaceholder: "example@gmail.com",
    passwordCreatePlaceholder: "Tối thiểu 8 ký tự",
    confirmPasswordPlaceholder: "Nhập lại mật khẩu",
    passwordHint: "Cần chữ hoa, chữ thường, số và ký tự đặc biệt.",
    policy:
      "Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Hnanut.",
    or: "hoặc",
    caloriesShort: "Calo",
    gmailError: "Email phải là địa chỉ Gmail, ví dụ demo@gmail.com.",
    passwordRequired: "Mật khẩu là bắt buộc.",
    fullNameRequired: "Họ tên là bắt buộc.",
    passwordStrongError:
      "Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
    confirmMismatch: "Mật khẩu xác nhận không khớp.",
    showPassword: "Hiện mật khẩu",
    hidePassword: "Ẩn mật khẩu",
    homeDescription: "Bạn đã vào khu vực app sau khi có phiên đăng nhập.",
    restoredSession: "Phiên đăng nhập đã được khôi phục từ token.",
    signOut: "Đăng xuất",
    tabHome: "Trang chủ",
    tabExplore: "Khám phá",
    exploreTitle: "Khám phá",
    exploreDescription: "Các tính năng dinh dưỡng tiếp theo sẽ được nối vào đây.",
  },
  en: {
    loadingDefault: "Loading...",
    checkingLogin: "Checking sign-in...",
    restoringSession: "Restoring your session...",
    light: "Light",
    dark: "Dark",
    languageShort: "EN",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    fullName: "Full name",
    loginTitle: "Welcome back",
    loginSubtitle: "Keep your nutrition rhythm going every day.",
    loginButton: "Sign in",
    forgotPassword: "Forgot password?",
    forgotTitle: "Reset password",
    forgotSubtitle: "Enter your registered Gmail to prepare a reset request.",
    forgotSubmit: "Send request",
    forgotClose: "Close",
    forgotSuccess:
      "Reset request captured. Email reset delivery will be connected in the next backend task.",
    forgotEmailPlaceholder: "example@gmail.com",
    passwordPlaceholder: "Enter password",
    loginRegisterCta: "No account yet? Sign up",
    registerTitle: "Create Hnanut account",
    registerSubtitle: "Start your better nutrition journey with us.",
    registerButton: "Create account",
    registerLoginCta: "Already have an account? Sign in",
    fullNamePlaceholder: "Nguyen Van A",
    emailPlaceholder: "example@gmail.com",
    passwordCreatePlaceholder: "At least 8 characters",
    confirmPasswordPlaceholder: "Re-enter password",
    passwordHint: "Use uppercase, lowercase, number, and special character.",
    policy:
      "By continuing, you agree to Hnanut's Terms of Service and Privacy Policy.",
    or: "or",
    caloriesShort: "Cal",
    gmailError: "Email must be a Gmail address, for example demo@gmail.com.",
    passwordRequired: "Password is required.",
    fullNameRequired: "Full name is required.",
    passwordStrongError:
      "Password needs at least 8 characters with uppercase, lowercase, number, and special character.",
    confirmMismatch: "Confirm password does not match.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    homeDescription: "You are inside the app after signing in.",
    restoredSession: "Your session was restored from token.",
    signOut: "Sign out",
    tabHome: "Home",
    tabExplore: "Explore",
    exploreTitle: "Explore",
    exploreDescription: "The next nutrition features will be connected here.",
  },
} as const;

type TranslationKey = keyof typeof dictionaries.vi;

const defaultPreferences: Preferences = {
  language: "vi",
  colorMode: "light",
};

let currentLanguage: Language = defaultPreferences.language;

const PreferenceContext = createContext<PreferenceState | undefined>(undefined);

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function PreferenceProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  useEffect(() => {
    void loadPreferences();
  }, []);

  const updatePreferences = useCallback(async (next: Preferences) => {
    currentLanguage = next.language;
    setPreferences(next);
    await savePreferences(next);
  }, []);

  const setLanguage = useCallback(
    async (language: Language) => {
      await updatePreferences({ ...preferences, language });
    },
    [preferences, updatePreferences],
  );

  const toggleLanguage = useCallback(async () => {
    await setLanguage(preferences.language === "vi" ? "en" : "vi");
  }, [preferences.language, setLanguage]);

  const setColorMode = useCallback(
    async (colorMode: ColorMode) => {
      await updatePreferences({ ...preferences, colorMode });
    },
    [preferences, updatePreferences],
  );

  const toggleColorMode = useCallback(async () => {
    await setColorMode(preferences.colorMode === "light" ? "dark" : "light");
  }, [preferences.colorMode, setColorMode]);

  const t = useCallback(
    (key: TranslationKey) => dictionaries[preferences.language][key],
    [preferences.language],
  );

  const value = useMemo<PreferenceState>(
    () => ({
      ...preferences,
      isDark: preferences.colorMode === "dark",
      setLanguage,
      toggleLanguage,
      setColorMode,
      toggleColorMode,
      t,
    }),
    [preferences, setLanguage, toggleLanguage, setColorMode, toggleColorMode, t],
  );

  async function loadPreferences() {
    const stored = await readStoredPreferences();

    if (stored) {
      currentLanguage = stored.language;
      setPreferences(stored);
    }
  }

  return (
    <PreferenceContext.Provider value={value}>
      {children}
    </PreferenceContext.Provider>
  );
}

export function usePreferences(): PreferenceState {
  const context = useContext(PreferenceContext);

  if (!context) {
    throw new Error("usePreferences must be used inside PreferenceProvider.");
  }

  return context;
}

async function readStoredPreferences(): Promise<Preferences | null> {
  const raw =
    Platform.OS === "web"
      ? localStorage.getItem(PREFERENCES_KEY)
      : await SecureStore.getItemAsync(PREFERENCES_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;

    return {
      language: parsed.language === "en" ? "en" : "vi",
      colorMode: parsed.colorMode === "dark" ? "dark" : "light",
    };
  } catch {
    return null;
  }
}

async function savePreferences(preferences: Preferences): Promise<void> {
  const raw = JSON.stringify(preferences);

  if (Platform.OS === "web") {
    localStorage.setItem(PREFERENCES_KEY, raw);
    return;
  }

  await SecureStore.setItemAsync(PREFERENCES_KEY, raw);
}
