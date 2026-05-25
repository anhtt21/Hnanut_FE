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
    forgotSubtitle:
      "Nhập Gmail đã đăng ký để chuẩn bị yêu cầu đặt lại mật khẩu.",
    forgotSubmit: "Gửi yêu cầu",
    forgotClose: "Đóng",
    forgotSuccess:
      "Yêu cầu khôi phục đã được ghi nhận. Backend gửi email reset sẽ được nối ở task tiếp theo.",
    forgotEmailPlaceholder: "example@gmail.com",
    passwordPlaceholder: "Nhập mật khẩu",
    loginRegisterCta: "Chưa có tài khoản? Đăng ký",
    registerTitle: "Tạo tài khoản Hnanut",
    registerSubtitle: "Bắt đầu hành trình dinh dưỡng tốt hơn cùng chúng tôi.",
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
    tabExplore: "Tìm món",
    exploreTitle: "Tìm món ăn",
    exploreDescription: "Nhập tên món, nguyên liệu hoặc cách gọi quen thuộc.",
    foodSearchPlaceholder: "Tìm cơm, phở, bánh mì...",
    allFoods: "Tất cả",
    loadingFoods: "Đang tìm món...",
    foodSearchInitialTitle: "Tìm món để bắt đầu",
    foodSearchInitialDescription:
      "Thử “cơm”, “phở”, “bánh mì” hoặc tên không dấu.",
    foodSearchEmptyTitle: "Chưa tìm thấy món",
    foodSearchEmptyDescription: "Thử từ khóa khác hoặc bỏ dấu tiếng Việt.",
    foodSearchErrorTitle: "Không tải được món",
    caloriesPer100g: "kcal/100g",
    defaultServing: "Khẩu phần",
    verifiedFood: "Đã xác thực",
    addFood: "Thêm",
    selectedFood: "Món đã chọn",
    selectedFoods: "Món đã thêm",
    draftReady: "Sẵn sàng tạo nháp bữa ăn",
    continueMeal: "Tiếp tục",
    viewMealDraft: "Xem danh sách",
    mealDraft: "Danh sách món",
    mealDraftHint: "Kiểm tra các món đã thêm trước khi tạo bữa ăn.",
    totalCalories: "Tổng calo",
    totalItems: "món",
    removeFood: "Xóa món",
    close: "Đóng",
    proteinShort: "Đạm",
    carbsShort: "Carb",
    fatShort: "Béo",

    profileTab: "Hồ sơ",
    profileTitle: "Hồ sơ",
    profileSubtitle: "Cài đặt cá nhân và mục tiêu calo",
    personalInfo: "Thông tin cá nhân",
    bodyMetrics: "Chỉ số cơ thể",
    targetCalories: "Mục tiêu calo",
    heightCm: "Chiều cao",
    weightKg: "Cân nặng",
    age: "Tuổi",
    gender: "Giới tính",
    goal: "Mục tiêu",
    activityLevel: "Vận động",
    dailyCalorieTarget: "Calo/ngày",
    saveProfile: "Lưu hồ sơ",
    saving: "Đang lưu...",
    profileSaved: "Đã lưu hồ sơ",
    profileNotFound: "Bạn chưa có hồ sơ. Hãy nhập thông tin để bắt đầu.",
    settings: "Cài đặt ứng dụng",
    language: "Ngôn ngữ",
    appearance: "Giao diện",
    logout: "Đăng xuất",
    male: "Nam",
    female: "Nữ",
    other: "Khác",
    loseWeight: "Giảm cân",
    maintainWeight: "Giữ cân",
    gainWeight: "Tăng cân",
    sedentary: "Ít vận động",
    lightActivity: "Nhẹ",
    moderateActivity: "Vừa",
    activeActivity: "Năng động",
    veryActiveActivity: "Rất năng động",
    invalidProfileForm: "Vui lòng nhập đầy đủ thông tin hợp lệ.",

    accountSettings: "Cài đặt tài khoản",
    goalSettings: "Cài đặt mục tiêu",
    generalSettings: "Cài đặt chung",
    editAccountHint: "Thông tin đăng nhập và bảo mật tài khoản.",
    editGoalHint: "Cập nhật chỉ số cơ thể và mục tiêu dinh dưỡng.",
    generalSettingsHint: "Ngôn ngữ, giao diện và phiên đăng nhập.",
    displayName: "Tên hiển thị",
    comingSoon: "Sẽ hoàn thiện ở task backend tiếp theo.",
    back: "Quay lại",

    updateAccount: "Lưu tài khoản",
    changePassword: "Đổi mật khẩu",
    currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới",
    avatar: "Ảnh đại diện",
    pickAvatar: "Chọn ảnh",
    accountSaved: "Đã cập nhật tài khoản",
    passwordChanged: "Đã đổi mật khẩu",
    passwordMismatch: "Mật khẩu xác nhận không khớp.",
    avatarUpdated: "Đã cập nhật ảnh đại diện",
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
    tabExplore: "Foods",
    exploreTitle: "Find food",
    exploreDescription: "Search by food name, ingredient, or common alias.",
    foodSearchPlaceholder: "Search rice, pho, bread...",
    allFoods: "All",
    loadingFoods: "Searching foods...",
    foodSearchInitialTitle: "Search to get started",
    foodSearchInitialDescription:
      "Try “rice”, “pho”, “bread”, or Vietnamese without accents.",
    foodSearchEmptyTitle: "No foods found",
    foodSearchEmptyDescription: "Try another keyword or a shorter search.",
    foodSearchErrorTitle: "Could not load foods",
    caloriesPer100g: "kcal/100g",
    defaultServing: "Serving",
    verifiedFood: "Verified",
    addFood: "Add",
    selectedFood: "Selected food",
    selectedFoods: "Added foods",
    draftReady: "Meal draft ready",
    continueMeal: "Continue",
    viewMealDraft: "View list",
    mealDraft: "Food list",
    mealDraftHint: "Review selected foods before creating your meal.",
    totalCalories: "Total calories",
    totalItems: "items",
    removeFood: "Remove food",
    close: "Close",
    proteinShort: "Protein",
    carbsShort: "Carbs",
    fatShort: "Fat",

    profileTab: "Profile",
    profileTitle: "Profile",
    profileSubtitle: "Personal settings and calorie goal",
    personalInfo: "Personal info",
    bodyMetrics: "Body metrics",
    targetCalories: "Calorie goal",
    heightCm: "Height",
    weightKg: "Weight",
    age: "Age",
    gender: "Gender",
    goal: "Goal",
    activityLevel: "Activity",
    dailyCalorieTarget: "Calories/day",
    saveProfile: "Save profile",
    saving: "Saving...",
    profileSaved: "Profile saved",
    profileNotFound:
      "You do not have a profile yet. Fill in your info to start.",
    settings: "App settings",
    language: "Language",
    appearance: "Appearance",
    logout: "Sign out",
    male: "Male",
    female: "Female",
    other: "Other",
    loseWeight: "Lose weight",
    maintainWeight: "Maintain weight",
    gainWeight: "Gain weight",
    sedentary: "Sedentary",
    lightActivity: "Light",
    moderateActivity: "Moderate",
    activeActivity: "Active",
    veryActiveActivity: "Very active",
    invalidProfileForm: "Please enter valid profile information.",

    accountSettings: "Account settings",
    goalSettings: "Goal settings",
    generalSettings: "General settings",
    editAccountHint: "Sign-in and account security information.",
    editGoalHint: "Update body metrics and nutrition goals.",
    generalSettingsHint: "Language, appearance, and session.",
    displayName: "Display name",
    comingSoon: "Will be completed in a later backend task.",
    back: "Back",

    updateAccount: "Save account",
    changePassword: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    avatar: "Avatar",
    pickAvatar: "Choose image",
    accountSaved: "Account updated",
    passwordChanged: "Password changed",
    passwordMismatch: "Confirm password does not match.",
    avatarUpdated: "Avatar updated",
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
    [
      preferences,
      setLanguage,
      toggleLanguage,
      setColorMode,
      toggleColorMode,
      t,
    ],
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
