import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { FoodSearchItem } from "@/types/food";
import type {
  MealDraft,
  MealDraftItem,
  MealDraftTotals,
  MealType,
} from "@/types/meal";

type MealDraftState = {
  draft: MealDraft;
  setMealType: (mealType: MealType) => void;
  setEatenAt: (eatenAt: string) => void;
  setNote: (note: string) => void;
  setLocalImageUri: (uri: string | null) => void;
  addFood: (food: FoodSearchItem, gram?: number) => void;
  decrementFood: (foodId: string) => void;
  updateFoodGram: (foodId: string, gram: number) => void;
  removeFood: (foodId: string) => void;
  getFoodQuantity: (foodId: string) => number;
  resetDraft: () => void;
};

const MealDraftContext = createContext<MealDraftState | undefined>(undefined);

export function MealDraftProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<MealDraft>(() => createEmptyDraft());

  const setMealType = useCallback((mealType: MealType) => {
    setDraft((current) => ({ ...current, mealType }));
  }, []);

  const setEatenAt = useCallback((eatenAt: string) => {
    setDraft((current) => ({ ...current, eatenAt }));
  }, []);

  const setNote = useCallback((note: string) => {
    setDraft((current) => ({ ...current, note }));
  }, []);

  const setLocalImageUri = useCallback((uri: string | null) => {
    setDraft((current) => ({ ...current, localImageUri: uri }));
  }, []);

  const addFood = useCallback((food: FoodSearchItem, gram?: number) => {
    setDraft((current) => {
      const safeGram = normalizeGram(gram ?? food.defaultServingGram);
      const existing = current.selectedFoods.find(
        (item) => item.food.id === food.id,
      );

      const selectedFoods = existing
        ? current.selectedFoods.map((item) =>
            item.food.id === food.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [
            ...current.selectedFoods,
            {
              draftItemId: createDraftItemId(food.id),
              food,
              gram: safeGram,
              quantity: 1,
            },
          ];

      return withTotals({ ...current, selectedFoods });
    });
  }, []);

  const decrementFood = useCallback((foodId: string) => {
    setDraft((current) => {
      const selectedFoods = current.selectedFoods.flatMap((item) => {
        if (item.food.id !== foodId) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      });

      return withTotals({ ...current, selectedFoods });
    });
  }, []);

  const updateFoodGram = useCallback((foodId: string, gram: number) => {
    setDraft((current) => {
      const safeGram = normalizeGram(gram);

      const selectedFoods = current.selectedFoods.map((item) =>
        item.food.id === foodId ? { ...item, gram: safeGram } : item,
      );

      return withTotals({ ...current, selectedFoods });
    });
  }, []);

  const removeFood = useCallback((foodId: string) => {
    setDraft((current) => {
      const selectedFoods = current.selectedFoods.filter(
        (item) => item.food.id !== foodId,
      );

      return withTotals({ ...current, selectedFoods });
    });
  }, []);

  const getFoodQuantity = useCallback(
    (foodId: string) =>
      draft.selectedFoods.find((item) => item.food.id === foodId)?.quantity ??
      0,
    [draft.selectedFoods],
  );

  const resetDraft = useCallback(() => {
    setDraft(createEmptyDraft());
  }, []);

  const value = useMemo<MealDraftState>(
    () => ({
      draft,
      setMealType,
      setEatenAt,
      setNote,
      setLocalImageUri,
      addFood,
      decrementFood,
      updateFoodGram,
      removeFood,
      getFoodQuantity,
      resetDraft,
    }),
    [
      draft,
      setMealType,
      setEatenAt,
      setNote,
      setLocalImageUri,
      addFood,
      decrementFood,
      updateFoodGram,
      removeFood,
      getFoodQuantity,
      resetDraft,
    ],
  );

  return (
    <MealDraftContext.Provider value={value}>
      {children}
    </MealDraftContext.Provider>
  );
}

export function useMealDraft(): MealDraftState {
  const context = useContext(MealDraftContext);

  if (!context) {
    throw new Error("useMealDraft must be used inside MealDraftProvider.");
  }

  return context;
}

function createEmptyDraft(): MealDraft {
  return withTotals({
    mealType: "Lunch",
    eatenAt: new Date().toISOString(),
    note: "",
    selectedFoods: [],
    localImageUri: null,
    totals: createEmptyTotals(),
  });
}

function withTotals(draft: MealDraft): MealDraft {
  return {
    ...draft,
    totals: calculateTotals(draft.selectedFoods),
  };
}

function calculateTotals(items: MealDraftItem[]): MealDraftTotals {
  return items.reduce<MealDraftTotals>((total, item) => {
    const gram = item.gram * item.quantity;
    const ratio = gram / 100;
    const nutrition = item.food.nutritionPer100g;

    return {
      itemCount: total.itemCount + item.quantity,
      totalGram: round2(total.totalGram + gram),
      calories: round2(total.calories + nutrition.calories * ratio),
      protein: round2(total.protein + nutrition.protein * ratio),
      fat: round2(total.fat + nutrition.fat * ratio),
      carbs: round2(total.carbs + nutrition.carbs * ratio),
    };
  }, createEmptyTotals());
}

function createEmptyTotals(): MealDraftTotals {
  return {
    itemCount: 0,
    totalGram: 0,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
}

function normalizeGram(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 100;
  return Math.round(value * 100) / 100;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function createDraftItemId(foodId: string): string {
  return `${foodId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
