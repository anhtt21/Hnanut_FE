export type AccountResponse = {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
};

export type UpdateAccountRequest = {
  fullName: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type AvatarResponse = {
  avatarUrl: string;
};
