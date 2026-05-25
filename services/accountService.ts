import { API_BASE_URL } from "@/config/api";
import { apiClient } from "@/services/apiClient";
import type {
  AccountResponse,
  AvatarResponse,
  ChangePasswordRequest,
  UpdateAccountRequest,
} from "@/types/account";

export const accountService = {
  getAccount(): Promise<AccountResponse> {
    return apiClient<AccountResponse>("/api/users/me/account");
  },

  updateAccount(request: UpdateAccountRequest): Promise<AccountResponse> {
    return apiClient<AccountResponse>("/api/users/me/account", {
      method: "PUT",
      body: request,
    });
  },

  changePassword(request: ChangePasswordRequest): Promise<void> {
    return apiClient<void>("/api/users/me/account/password", {
      method: "PUT",
      body: request,
    });
  },

  uploadAvatar(formData: FormData): Promise<AvatarResponse> {
    return apiClient<AvatarResponse>("/api/users/me/account/avatar", {
      method: "POST",
      body: formData,
    });
  },
};

export function toApiAssetUrl(url?: string | null): string | null {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}
