import type { FoodSearchItem } from "@/types/food";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type MealDraftItem = {
  draftItemId: string;
  food: FoodSearchItem;
  gram: number;
  quantity: number;
};

export type MealDraftTotals = {
  itemCount: number;
  totalGram: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type MealDraft = {
  mealType: MealType;
  eatenAt: string;
  note: string;
  selectedFoods: MealDraftItem[];
  localImageUri: string | null;
  totals: MealDraftTotals;
};

export type CreateMealItemRequest = {
  foodId: string;
  gram: number;
};

export type CreateMealRequest = {
  mealType: MealType;
  eatenAt: string;
  note?: string | null;
  items: CreateMealItemRequest[];
};

export type UpdateMealItemRequest = {
  mealItemId?: string | null;
  foodId: string;
  gram: number;
};

export type UpdateMealRequest = {
  mealType: MealType;
  eatenAt: string;
  note?: string | null;
  items: UpdateMealItemRequest[];
};

export type MealItemResponse = {
  id: string;
  foodId: string;
  nameSnapshot: string;
  gram: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  isUserEdited: boolean;
};

export type MealImageResponse = {
  id: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  createdAt: string;
};

export type MealResponse = {
  id: string;
  userId: string;
  mealType: MealType;
  eatenAt: string;
  note?: string | null;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  items: MealItemResponse[];
  images: MealImageResponse[];
};
