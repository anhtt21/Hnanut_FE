import { apiClient } from "@/services/apiClient";
import { clearAuthTokens, getAuthTokens } from "@/services/authTokenStore";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";

export const authService = {
  register(request: RegisterRequest): Promise<AuthResponse> {
    return apiClient<AuthResponse>("/api/auth/register", {
      method: "POST",
      auth: false,
      body: request,
    });
  },

  login(request: LoginRequest): Promise<AuthResponse> {
    return apiClient<AuthResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: request,
    });
  },

  forgotPassword(
    request: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    return apiClient<ForgotPasswordResponse>("/api/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: request,
    });
  },

  async logout(): Promise<void> {
    const tokens = await getAuthTokens();

    try {
      if (tokens?.refreshToken) {
        await apiClient<void>("/api/auth/logout", {
          method: "POST",
          auth: false,
          retryOnUnauthorized: false,
          body: {
            refreshToken: tokens.refreshToken,
          },
        });
      }
    } finally {
      await clearAuthTokens();
    }
  },
};
