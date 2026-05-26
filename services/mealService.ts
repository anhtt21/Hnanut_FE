import { apiClient } from "@/services/apiClient";
import type {
  CreateMealRequest,
  MealResponse,
  UpdateMealRequest,
} from "@/types/meal";

export const mealService = {
  createMeal(request: CreateMealRequest): Promise<MealResponse> {
    return apiClient<MealResponse>("/api/meals", {
      method: "POST",
      body: request,
    });
  },

  listMeals(from?: string, to?: string): Promise<MealResponse[]> {
    const params = new URLSearchParams();

    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const query = params.toString();

    return apiClient<MealResponse[]>(`/api/meals${query ? `?${query}` : ""}`);
  },

  getMeal(mealId: string): Promise<MealResponse> {
    return apiClient<MealResponse>(`/api/meals/${mealId}`);
  },

  updateMeal(
    mealId: string,
    request: UpdateMealRequest,
  ): Promise<MealResponse> {
    return apiClient<MealResponse>(`/api/meals/${mealId}`, {
      method: "PUT",
      body: request,
    });
  },

  deleteMeal(mealId: string): Promise<void> {
    return apiClient<void>(`/api/meals/${mealId}`, {
      method: "DELETE",
    });
  },
};
