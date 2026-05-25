export type FoodNutrition = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

export type FoodSearchItem = {
  id: string;
  name: string;
  category: string;
  defaultServingGram: number;
  isVerified: boolean;
  imageUrl?: string | null;
  nutritionPer100g: FoodNutrition;
};

export type SearchFoodsResponse = {
  items: FoodSearchItem[];
};

export type FoodDetail = {
  id: string;
  name: string;
  normalizedName: string;
  category: string;
  defaultServingGram: number;
  isVerified: boolean;
  imageUrl?: string | null;
  aliases: string[];
  nutritionPer100g: FoodNutrition;
};
