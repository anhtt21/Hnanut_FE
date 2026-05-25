import { apiClient } from "@/services/apiClient";
import type { FoodDetail, SearchFoodsResponse } from "@/types/food";

export const foodService = {
  searchFoods(query: string, limit = 20): Promise<SearchFoodsResponse> {
    const safeQuery = query.trim();
    const safeLimit = Math.max(1, Math.min(limit, 50));

    return apiClient<SearchFoodsResponse>(
      `/api/foods/search?query=${encodeURIComponent(safeQuery)}&limit=${safeLimit}`,
    );
  },

  getFood(foodId: string): Promise<FoodDetail> {
    return apiClient<FoodDetail>(`/api/foods/${foodId}`);
  },
};
