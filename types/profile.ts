export type Gender = "Male" | "Female" | "Other";
export type Goal = "LoseWeight" | "MaintainWeight" | "GainWeight";
export type ActivityLevel =
  | "Sedentary"
  | "Light"
  | "Moderate"
  | "Active"
  | "VeryActive";

export type UserProfileResponse = {
  userId: string;
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender;
  goal: Goal;
  activityLevel: ActivityLevel;
  dailyCalorieTarget: number;
};

export type UpsertUserProfileRequest = Omit<UserProfileResponse, "userId">;
