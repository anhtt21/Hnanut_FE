import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { UserProfileResponse } from "@/types/profile";

type ProfileState = {
  profile: UserProfileResponse | null;
  setProfile: (profile: UserProfileResponse) => void;
  clearProfile: () => void;
};

const ProfileContext = createContext<ProfileState | undefined>(undefined);

export function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfileState] = useState<UserProfileResponse | null>(null);

  const setProfile = useCallback((nextProfile: UserProfileResponse) => {
    setProfileState(nextProfile);
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
  }, []);

  const value = useMemo<ProfileState>(
    () => ({
      profile,
      setProfile,
      clearProfile,
    }),
    [profile, setProfile, clearProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfileStore(): ProfileState {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfileStore must be used inside ProfileProvider.");
  }

  return context;
}
