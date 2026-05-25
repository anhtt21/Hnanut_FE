export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type AuthResponse = {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  avatarUrl?: string | null;
};

export type AuthTokens = Pick<
  AuthResponse,
  | "accessToken"
  | "accessTokenExpiresAtUtc"
  | "refreshToken"
  | "refreshTokenExpiresAtUtc"
>;

export type AuthUser = Pick<
  AuthResponse,
  "userId" | "email" | "fullName" | "role" | "avatarUrl"
>;

export type ForgotPasswordResponse = {
  message: string;
};
