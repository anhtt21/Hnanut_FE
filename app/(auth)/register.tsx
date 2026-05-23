import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getApiErrorMessage } from "@/services/apiError";
import { authService } from "@/services/authService";
import { useAuth } from "@/stores/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { setSession } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    !isSubmitting;

  async function handleSubmit() {
    const validationError = validateRegister(fullName, email, password);

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
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Đăng ký</Text>
        <Text style={styles.subtitle}>Tạo tài khoản HnaNut mới.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Họ tên</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Demo User"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="demo@gmail.com"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Tối thiểu 8 ký tự"
            style={styles.input}
          />
          <Text style={styles.hint}>
            Cần chữ hoa, chữ thường, số và ký tự đặc biệt.
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </Pressable>

        <Link href="/login" style={styles.link}>
          Đã có tài khoản? Đăng nhập
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

function validateRegister(
  fullName: string,
  email: string,
  password: string,
): string | null {
  if (!fullName.trim()) {
    return "Họ tên là bắt buộc.";
  }

  if (!isValidGmail(email)) {
    return "Email phải là địa chỉ Gmail, ví dụ demo@gmail.com.";
  }

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9\s]/.test(password)
  ) {
    return "Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
  }

  return null;
}

function isValidGmail(value: string): boolean {
  return /^[^\s@]+@gmail\.com$/i.test(value.trim());
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  card: {
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  hint: {
    fontSize: 13,
    color: "#64748B",
  },
  error: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#0A7EA4",
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  link: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#0A7EA4",
  },
});
