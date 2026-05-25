import { apiClient } from "@/services/apiClient";
import type {
  UpsertUserProfileRequest,
  UserProfileResponse,
} from "@/types/profile";

export const profileService = {
  getProfile(): Promise<UserProfileResponse> {
    return apiClient<UserProfileResponse>("/api/users/me/profile");
  },

  saveProfile(request: UpsertUserProfileRequest): Promise<UserProfileResponse> {
    return apiClient<UserProfileResponse>("/api/users/me/profile", {
      method: "PUT",
      body: request,
    });
  },
};
