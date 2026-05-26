import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FoodImagePreview from "@/components/food-image-preview";
import { authPalettes, type AuthPalette } from "@/constants/appTheme";
import { getApiErrorMessage } from "@/services/apiError";
import { foodService } from "@/services/foodService";
import { usePreferences, type Language } from "@/stores/preferenceStore";
import type { FoodSearchItem } from "@/types/food";
import { getFoodImageUri } from "@/utils/foodImages";
import { useMealDraft } from "@/stores/mealDraftStore";
import type { MealDraftItem } from "@/types/meal";
import { webInputStyle } from "@/utils/webInputStyle";

const SEARCH_DELAY_MS = 400;
const MIN_QUERY_LENGTH = 2;

export default function ExploreScreen() {
  const router = useRouter();
  const { colorMode, language, t } = usePreferences();
  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);
  const chipScrollRef = useRef<ScrollView>(null);

  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<FoodSearchItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [chipOffset, setChipOffset] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [previewFood, setPreviewFood] = useState<FoodSearchItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    draft,
    addFood,
    decrementFood,
    removeFood,
    getFoodQuantity,
  } = useMealDraft();

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!canSearch) {
      setFoods([]);
      setError(null);
      setIsLoading(false);
      setSelectedCategory("all");
      return;
    }

    let isActive = true;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await foodService.searchFoods(trimmedQuery, 30);
        if (!isActive) return;

        setFoods(response.items);
        setSelectedCategory("all");
      } catch (searchError) {
        if (!isActive) return;

        setFoods([]);
        setError(getApiErrorMessage(searchError, language));
      } finally {
        if (isActive) setIsLoading(false);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [canSearch, trimmedQuery, language]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(foods.map((food) => food.category)),
    ).sort();

    return ["all", ...uniqueCategories];
  }, [foods]);

  const visibleFoods = useMemo(() => {
    if (selectedCategory === "all") return foods;
    return foods.filter((food) => food.category === selectedCategory);
  }, [foods, selectedCategory]);

  const cartItems = draft.selectedFoods;
  const cartItemCount = draft.totals.itemCount;
  const cartCalories = draft.totals.calories;
  const cartServingGram = draft.totals.totalGram;

  function scrollChips(direction: "left" | "right") {
    const nextOffset =
      direction === "left" ? Math.max(0, chipOffset - 180) : chipOffset + 180;

    setChipOffset(nextOffset);
    chipScrollRef.current?.scrollTo({ x: nextOffset, animated: true });
  }

  useEffect(() => {
    if (cartItems.length === 0) {
      setIsCartOpen(false);
    }
  }, [cartItems.length]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>Hnanut</Text>
          <Text style={styles.title}>{t("exploreTitle")}</Text>
          <Text style={styles.subtitle}>{t("exploreDescription")}</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={palette.icon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("foodSearchPlaceholder")}
            placeholderTextColor={palette.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.searchInput, webInputStyle]}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} style={styles.clearButton}>
              <Ionicons name="close" size={18} color={palette.icon} />
            </Pressable>
          ) : null}
        </View>

        {categories.length > 1 ? (
          <View style={styles.chipRail}>
            <Pressable
              accessibilityLabel="Scroll filters left"
              disabled={chipOffset <= 0}
              onPress={() => scrollChips("left")}
              style={[
                styles.chipNav,
                chipOffset <= 0 && styles.chipNavDisabled,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={
                  chipOffset <= 0 ? palette.placeholder : palette.primaryDark
                }
              />
            </Pressable>

            <ScrollView
              ref={chipScrollRef}
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroller}
              contentContainerStyle={styles.chipRow}
              onScroll={(event) =>
                setChipOffset(event.nativeEvent.contentOffset.x)
              }
              scrollEventThrottle={16}
            >
              {categories.map((category) => {
                const isActive = selectedCategory === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {category === "all" ? t("allFoods") : category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              accessibilityLabel="Scroll filters right"
              onPress={() => scrollChips("right")}
              style={styles.chipNav}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.primaryDark}
              />
            </Pressable>
          </View>
        ) : (
          <View style={styles.chipSpacer} />
        )}

        {isLoading ? (
          <StateView
            icon="sync-outline"
            title={t("loadingFoods")}
            description={trimmedQuery}
            palette={palette}
            styles={styles}
            loading
          />
        ) : error ? (
          <StateView
            icon="alert-circle-outline"
            title={t("foodSearchErrorTitle")}
            description={error}
            palette={palette}
            styles={styles}
          />
        ) : !canSearch ? (
          <StateView
            icon="restaurant-outline"
            title={t("foodSearchInitialTitle")}
            description={t("foodSearchInitialDescription")}
            palette={palette}
            styles={styles}
          />
        ) : visibleFoods.length === 0 ? (
          <StateView
            icon="search-outline"
            title={t("foodSearchEmptyTitle")}
            description={t("foodSearchEmptyDescription")}
            palette={palette}
            styles={styles}
          />
        ) : (
          <FlatList
            data={visibleFoods}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: cartItemCount > 0 ? 132 : 28 },
            ]}
            renderItem={({ item }) => (
              <FoodCard
                food={item}
                quantity={getFoodQuantity(item.id)}
                language={language}
                palette={palette}
                styles={styles}
                onAdd={() => addFood(item)}
                onDecrement={() => decrementFood(item.id)}
                onPreview={() => setPreviewFood(item)}
                labels={{
                  caloriesPer100g: t("caloriesPer100g"),
                  defaultServing: t("defaultServing"),
                  verifiedFood: t("verifiedFood"),
                  addFood: t("addFood"),
                  proteinShort: t("proteinShort"),
                  carbsShort: t("carbsShort"),
                  fatShort: t("fatShort"),
                }}
              />
            )}
          />
        )}
      </View>

      {cartItemCount > 0 && !isCartOpen ? (
        <CartBar
          count={cartItemCount}
          calories={cartCalories}
          grams={cartServingGram}
          language={language}
          styles={styles}
          labels={{
            selectedFoods: t("selectedFoods"),
            totalItems: t("totalItems"),
            caloriesShort: t("caloriesShort"),
            viewMealDraft: t("viewMealDraft"),
          }}
          onOpen={() => setIsCartOpen(true)}
        />
      ) : null}

      {isCartOpen ? (
        <>
          <Pressable
            accessibilityLabel={t("close")}
            style={styles.scrim}
            onPress={() => setIsCartOpen(false)}
          />
          <CartSheet
            items={cartItems}
            calories={cartCalories}
            grams={cartServingGram}
            language={language}
            palette={palette}
            styles={styles}
            onClose={() => setIsCartOpen(false)}
            onAdd={addFood}
            onDecrement={decrementFood}
            onRemove={removeFood}
            onPreview={setPreviewFood}
            onContinue={() => {
              setIsCartOpen(false);
              router.push("../meals/create");
            }}
            labels={{
              mealDraft: t("mealDraft"),
              mealDraftHint: t("mealDraftHint"),
              totalCalories: t("totalCalories"),
              totalItems: t("totalItems"),
              caloriesShort: t("caloriesShort"),
              defaultServing: t("defaultServing"),
              removeFood: t("removeFood"),
              continueMeal: t("continueMeal"),
              close: t("close"),
            }}
          />
        </>
      ) : null}

      {previewFood ? (
        <FoodImagePreview
          food={previewFood}
          onClose={() => setPreviewFood(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

type FoodCardProps = {
  food: FoodSearchItem;
  quantity: number;
  language: Language;
  palette: AuthPalette;
  styles: ReturnType<typeof createStyles>;
  onAdd: () => void;
  onDecrement: () => void;
  onPreview: () => void;
  labels: {
    caloriesPer100g: string;
    defaultServing: string;
    verifiedFood: string;
    addFood: string;
    proteinShort: string;
    carbsShort: string;
    fatShort: string;
  };
};

function FoodCard({
  food,
  quantity,
  language,
  palette,
  styles,
  onAdd,
  onDecrement,
  onPreview,
  labels,
}: FoodCardProps) {
  const nutrition = food.nutritionPer100g;

  return (
    <View style={styles.card}>
      <FoodPhoto
        food={food}
        palette={palette}
        styles={styles}
        size="card"
        onPreview={onPreview}
      />

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.titleBlock}>
            <Text style={styles.category} numberOfLines={1}>
              {food.category}
            </Text>
            <Text style={styles.foodName} numberOfLines={2}>
              {food.name}
            </Text>
          </View>

          <View style={styles.calorieBox}>
            <Text style={styles.calorieValue}>
              {formatCalories(nutrition.calories, language)}
            </Text>
            <Text style={styles.calorieLabel}>{labels.caloriesPer100g}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.servingPill}>
            <Ionicons
              name="scale-outline"
              size={14}
              color={palette.primaryDark}
            />
            <Text style={styles.servingText}>
              {labels.defaultServing} {food.defaultServingGram}g
            </Text>
          </View>

          {food.isVerified ? (
            <View style={styles.verifiedPill}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={palette.primaryDark}
              />
              <Text style={styles.verifiedText}>{labels.verifiedFood}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.macroRow}>
          <Macro
            label={labels.proteinShort}
            value={nutrition.protein}
            language={language}
            styles={styles}
          />
          <Macro
            label={labels.carbsShort}
            value={nutrition.carbs}
            language={language}
            styles={styles}
          />
          <Macro
            label={labels.fatShort}
            value={nutrition.fat}
            language={language}
            styles={styles}
          />
        </View>

        {quantity > 0 ? (
          <View style={styles.stepper}>
            <Pressable style={styles.stepperButton} onPress={onDecrement}>
              <Ionicons name="remove" size={17} color={palette.primaryDark} />
            </Pressable>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <Pressable style={styles.stepperButtonActive} onPress={onAdd}>
              <Ionicons name="add" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.addButton} onPress={onAdd}>
            <Text style={styles.addButtonText}>{labels.addFood}</Text>
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function FoodPhoto({
  food,
  palette,
  styles,
  size,
  onPreview,
}: {
  food: FoodSearchItem;
  palette: AuthPalette;
  styles: ReturnType<typeof createStyles>;
  size: "card" | "sheet";
  onPreview: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const lastTapRef = useRef(0);
  const uri = useMemo(() => getFoodImageUri(food), [food]);
  const frameStyle =
    size === "card" ? styles.foodPhotoCard : styles.foodPhotoSheet;
  const iconSize = size === "card" ? 23 : 20;

  function handlePress() {
    const now = Date.now();

    if (now - lastTapRef.current < 320) {
      onPreview();
    }

    lastTapRef.current = now;
  }

  if (!uri || failed) {
    return (
      <Pressable
        style={[frameStyle, styles.foodImageFallback]}
        onPress={handlePress}
      >
        <Ionicons
          name="restaurant-outline"
          size={iconSize}
          color={palette.primaryDark}
        />
      </Pressable>
    );
  }

  return (
    <Pressable style={frameStyle} onPress={handlePress}>
      <Image
        source={{ uri }}
        style={styles.foodImage}
        contentFit="cover"
        transition={160}
        onError={() => setFailed(true)}
      />
    </Pressable>
  );
}

function Macro({
  label,
  value,
  language,
  styles,
}: {
  label: string;
  value: number;
  language: Language;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.macroPill}>
      <Text style={styles.macroLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.macroValue}>{formatMacro(value, language)}g</Text>
    </View>
  );
}

function CartBar({
  count,
  calories,
  grams,
  language,
  styles,
  labels,
  onOpen,
}: {
  count: number;
  calories: number;
  grams: number;
  language: Language;
  styles: ReturnType<typeof createStyles>;
  labels: {
    selectedFoods: string;
    totalItems: string;
    caloriesShort: string;
    viewMealDraft: string;
  };
  onOpen: () => void;
}) {
  return (
    <View style={styles.cartBar}>
      <View style={styles.cartIcon}>
        <Ionicons name="basket-outline" size={22} color="#FFFFFF" />
      </View>

      <View style={styles.cartCopy}>
        <Text style={styles.cartLabel}>{labels.selectedFoods}</Text>
        <Text style={styles.cartTitle} numberOfLines={1}>
          {count} {labels.totalItems} - {formatCalories(calories, language)}{" "}
          {labels.caloriesShort} - {formatCalories(grams, language)}g
        </Text>
      </View>

      <Pressable style={styles.cartAction} onPress={onOpen}>
        <Text style={styles.cartActionText}>{labels.viewMealDraft}</Text>
      </Pressable>
    </View>
  );
}

function CartSheet({
  items,
  calories,
  grams,
  language,
  palette,
  styles,
  labels,
  onClose,
  onAdd,
  onDecrement,
  onRemove,
  onPreview,
  onContinue,
}: {
  items: MealDraftItem[];
  calories: number;
  grams: number;
  language: Language;
  palette: AuthPalette;
  styles: ReturnType<typeof createStyles>;
  labels: {
    mealDraft: string;
    mealDraftHint: string;
    totalCalories: string;
    totalItems: string;
    caloriesShort: string;
    defaultServing: string;
    removeFood: string;
    continueMeal: string;
    close: string;
  };
  onClose: () => void;
  onAdd: (food: FoodSearchItem) => void;
  onDecrement: (foodId: string) => void;
  onRemove: (foodId: string) => void;
  onPreview: (food: FoodSearchItem) => void;
  onContinue: () => void;
}) {
  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <View style={styles.cartSheet}>
      <View style={styles.sheetHandle} />

      <View style={styles.sheetHeader}>
        <View style={styles.sheetTitleBlock}>
          <Text style={styles.sheetTitle}>{labels.mealDraft}</Text>
          <Text style={styles.sheetDescription}>{labels.mealDraftHint}</Text>
        </View>
        <Pressable style={styles.sheetClose} onPress={onClose}>
          <Ionicons name="close" size={20} color={palette.icon} />
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{labels.totalItems}</Text>
          <Text style={styles.summaryValue}>{count}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{labels.totalCalories}</Text>
          <Text style={styles.summaryValue}>
            {formatCalories(calories, language)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{labels.defaultServing}</Text>
          <Text style={styles.summaryValue}>
            {formatCalories(grams, language)}g
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.cartList}
        contentContainerStyle={styles.cartListContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <View key={item.food.id} style={styles.cartItem}>
            <FoodPhoto
              food={item.food}
              palette={palette}
              styles={styles}
              size="sheet"
              onPreview={() => onPreview(item.food)}
            />

            <View style={styles.cartItemBody}>
              <Text style={styles.cartItemName} numberOfLines={1}>
                {item.food.name}
              </Text>
              <Text style={styles.cartItemMeta}>
                {formatCalories(draftItemCalories(item), language)}{" "}
                {labels.caloriesShort} x {item.quantity}
              </Text>
              <Pressable onPress={() => onRemove(item.food.id)}>
                <Text style={styles.removeText}>{labels.removeFood}</Text>
              </Pressable>
            </View>

            <View style={styles.cartStepper}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => onDecrement(item.food.id)}
              >
                <Ionicons name="remove" size={16} color={palette.primaryDark} />
              </Pressable>
              <Text style={styles.cartQuantity}>{item.quantity}</Text>
              <Pressable
                style={styles.stepperButtonActive}
                onPress={() => onAdd(item.food)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.primarySheetButton} onPress={onContinue}>
        <Text style={styles.primarySheetButtonText}>{labels.continueMeal}</Text>
      </Pressable>
    </View>
  );
}

function StateView({
  icon,
  title,
  description,
  palette,
  styles,
  loading = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  palette: AuthPalette;
  styles: ReturnType<typeof createStyles>;
  loading?: boolean;
}) {
  return (
    <View style={styles.stateBox}>
      {loading ? (
        <ActivityIndicator color={palette.primaryDark} />
      ) : (
        <Ionicons name={icon} size={30} color={palette.primaryDark} />
      )}
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
    </View>
  );
}

function draftItemCalories(item: MealDraftItem) {
  return (item.food.nutritionPer100g.calories * item.gram) / 100;
}

function formatCalories(value: number, language: Language) {
  return new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMacro(value: number, language: Language) {
  return new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function createStyles(palette: AuthPalette) {
  return StyleSheet.create({
    safeArea: {
      backgroundColor: palette.screenBg,
      flex: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    header: {
      marginBottom: 16,
    },
    brand: {
      color: palette.primaryDark,
      fontSize: 14,
      fontWeight: "900",
      marginBottom: 8,
    },
    title: {
      color: palette.text,
      fontSize: 30,
      fontWeight: "900",
      lineHeight: 36,
    },
    subtitle: {
      color: palette.muted,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 6,
    },
    searchBox: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: "row",
      minHeight: 56,
      paddingHorizontal: 16,
    },
    searchInput: {
      color: palette.inputText,
      flex: 1,
      fontSize: 15,
      fontWeight: "800",
      paddingHorizontal: 10,
    },
    clearButton: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 17,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    chipRail: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      height: 48,
      justifyContent: "center",
      marginTop: 8,
    },
    chipSpacer: {
      height: 14,
    },
    chipScroller: {
      flex: 1,
      minWidth: 0,
    },
    chipRow: {
      alignItems: "center",
      gap: 8,
      paddingRight: 4,
    },
    chipNav: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 16,
      borderWidth: 1,
      height: 32,
      justifyContent: "center",
      width: 32,
    },
    chipNavDisabled: {
      opacity: 0.42,
    },
    chip: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 999,
      borderWidth: 1,
      flexShrink: 0,
      height: 34,
      justifyContent: "center",
      minWidth: 76,
      paddingHorizontal: 14,
    },
    chipActive: {
      backgroundColor: palette.primaryDark,
      borderColor: palette.primaryDark,
    },
    chipText: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "900",
    },
    chipTextActive: {
      color: "#FFFFFF",
    },
    listContent: {
      gap: 12,
      paddingTop: 2,
    },
    card: {
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      padding: 14,
    },
    foodPhotoCard: {
      alignItems: "center",
      borderRadius: 18,
      height: 52,
      justifyContent: "center",
      overflow: "hidden",
      width: 52,
    },
    foodPhotoSheet: {
      alignItems: "center",
      borderRadius: 16,
      height: 42,
      justifyContent: "center",
      overflow: "hidden",
      width: 42,
    },
    foodImage: {
      height: "100%",
      width: "100%",
    },
    foodImageFallback: {
      backgroundColor: palette.primarySoft,
    },
    cardBody: {
      flex: 1,
      gap: 10,
    },
    cardHeader: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 10,
      justifyContent: "space-between",
    },
    titleBlock: {
      flex: 1,
      minWidth: 0,
    },
    category: {
      color: palette.primaryDark,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    foodName: {
      color: palette.text,
      fontSize: 17,
      fontWeight: "900",
      lineHeight: 21,
      marginTop: 2,
    },
    calorieBox: {
      alignItems: "flex-end",
      minWidth: 72,
    },
    calorieValue: {
      color: palette.primaryDark,
      fontSize: 18,
      fontWeight: "900",
    },
    calorieLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "800",
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    servingPill: {
      alignItems: "center",
      backgroundColor: palette.primarySoft,
      borderRadius: 999,
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    servingText: {
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "900",
    },
    verifiedPill: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 999,
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    verifiedText: {
      color: palette.label,
      fontSize: 12,
      fontWeight: "800",
    },
    macroRow: {
      flexDirection: "row",
      gap: 8,
    },
    macroPill: {
      backgroundColor: palette.inputBg,
      borderRadius: 12,
      flex: 1,
      minHeight: 54,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    macroLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "800",
    },
    macroValue: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "900",
      marginTop: 4,
    },
    addButton: {
      alignItems: "center",
      alignSelf: "flex-end",
      backgroundColor: palette.primaryDark,
      borderRadius: 999,
      flexDirection: "row",
      gap: 4,
      minHeight: 44,
      paddingHorizontal: 16,
      paddingVertical: 9,
    },
    addButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "900",
    },
    stepper: {
      alignItems: "center",
      alignSelf: "flex-end",
      backgroundColor: palette.primarySoft,
      borderRadius: 999,
      flexDirection: "row",
      gap: 12,
      minHeight: 44,
      paddingHorizontal: 6,
    },
    stepperButton: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 17,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    stepperButtonActive: {
      alignItems: "center",
      backgroundColor: palette.primaryDark,
      borderRadius: 17,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    stepperValue: {
      color: palette.primaryDark,
      fontSize: 16,
      fontWeight: "900",
      minWidth: 16,
      textAlign: "center",
    },
    stateBox: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 22,
      borderWidth: 1,
      gap: 8,
      marginTop: 12,
      padding: 28,
    },
    stateTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "900",
      textAlign: "center",
    },
    stateDescription: {
      color: palette.muted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
    },
    cartBar: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 22,
      borderWidth: 1,
      bottom: 14,
      flexDirection: "row",
      gap: 12,
      left: 14,
      padding: 12,
      position: "absolute",
      right: 14,
      zIndex: 6,
    },
    cartIcon: {
      alignItems: "center",
      backgroundColor: palette.primaryDark,
      borderRadius: 20,
      height: 42,
      justifyContent: "center",
      width: 42,
    },
    cartCopy: {
      flex: 1,
      minWidth: 0,
    },
    cartLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "900",
    },
    cartTitle: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "900",
      marginTop: 2,
    },
    cartAction: {
      backgroundColor: palette.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    cartActionText: {
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "900",
    },
    scrim: {
      backgroundColor: "rgba(0,0,0,0.28)",
      bottom: 0,
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
      zIndex: 8,
    },
    cartSheet: {
      backgroundColor: palette.cardBg,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      bottom: 0,
      left: 0,
      maxHeight: "76%",
      paddingBottom: 16,
      paddingHorizontal: 18,
      paddingTop: 10,
      position: "absolute",
      right: 0,
      zIndex: 9,
    },
    sheetHandle: {
      alignSelf: "center",
      backgroundColor: palette.border,
      borderRadius: 999,
      height: 4,
      marginBottom: 14,
      width: 48,
    },
    sheetHeader: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
    },
    sheetTitleBlock: {
      flex: 1,
    },
    sheetTitle: {
      color: palette.text,
      fontSize: 22,
      fontWeight: "900",
    },
    sheetDescription: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },
    sheetClose: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 18,
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    summaryRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 14,
    },
    summaryCard: {
      backgroundColor: palette.inputBg,
      borderRadius: 14,
      flex: 1,
      padding: 10,
    },
    summaryLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "800",
    },
    summaryValue: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "900",
      marginTop: 4,
    },
    cartList: {
      marginTop: 12,
    },
    cartListContent: {
      gap: 10,
      paddingBottom: 12,
    },
    cartItem: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 16,
      flexDirection: "row",
      gap: 10,
      padding: 10,
    },
    cartItemBody: {
      flex: 1,
      minWidth: 0,
    },
    cartItemName: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "900",
    },
    cartItemMeta: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "800",
      marginTop: 3,
    },
    removeText: {
      color: palette.errorText,
      fontSize: 12,
      fontWeight: "900",
      marginTop: 5,
    },
    cartStepper: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    cartQuantity: {
      color: palette.text,
      fontSize: 15,
      fontWeight: "900",
      minWidth: 18,
      textAlign: "center",
    },
    primarySheetButton: {
      alignItems: "center",
      backgroundColor: palette.primaryDark,
      borderRadius: 999,
      marginTop: 4,
      minHeight: 48,
      justifyContent: "center",
    },
    primarySheetButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },
  });
}
