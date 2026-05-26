import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { type ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { mealService } from "@/services/mealService";
import { useMealDraft } from "@/stores/mealDraftStore";
import { usePreferences, type Language } from "@/stores/preferenceStore";
import type { FoodSearchItem } from "@/types/food";
import type {
  CreateMealRequest,
  MealDraft,
  MealDraftItem,
  MealResponse,
  MealType,
} from "@/types/meal";
import { getFoodImageUri } from "@/utils/foodImages";
import { webInputStyle } from "@/utils/webInputStyle";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type MealTypeOption = {
  value: MealType;
  icon: IoniconName;
  label: string;
};

export default function CreateMealScreen() {
  const router = useRouter();
  const { colorMode, language, t } = usePreferences();
  const {
    draft,
    setMealType,
    setEatenAt,
    setNote,
    addFood,
    decrementFood,
    updateFoodGram,
    removeFood,
    resetDraft,
  } = useMealDraft();

  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [info, setInfo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState(() =>
    formatDateInput(draft.eatenAt),
  );
  const [timeInput, setTimeInput] = useState(() =>
    formatTimeInput(draft.eatenAt),
  );
  const [savedMeal, setSavedMeal] = useState<MealResponse | null>(null);
  const [previewFood, setPreviewFood] = useState<FoodSearchItem | null>(null);

  const mealTypeOptions = useMemo<MealTypeOption[]>(
    () => [
      { value: "Breakfast", icon: "sunny-outline", label: t("breakfast") },
      { value: "Lunch", icon: "restaurant-outline", label: t("lunch") },
      { value: "Dinner", icon: "moon-outline", label: t("dinner") },
      { value: "Snack", icon: "cafe-outline", label: t("snack") },
    ],
    [t],
  );

  const canSave = draft.selectedFoods.length > 0;

  useEffect(() => {
    setDateInput(formatDateInput(draft.eatenAt));
    setTimeInput(formatTimeInput(draft.eatenAt));
  }, [draft.eatenAt]);

  async function handleSaveDraft() {
    const request = buildCreateMealRequest(draft);

    if (!request) {
      setError(t("invalidMealDraft"));
      setInfo(null);
      return;
    }

    setIsSaving(true);
    setError(null);
    setInfo(null);
    setSavedMeal(null);

    try {
      const response = await mealService.createMeal(request);
      resetDraft();
      setSavedMeal(response);
      setInfo(null);
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, language));
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddMoreFoods() {
    setSavedMeal(null);
    router.push("../(tabs)/explore");
  }

  function handleUseNow() {
    const now = new Date();
    setEatenAt(now.toISOString());
  }

  function handleDateInputChange(value: string) {
    setDateInput(value);

    const nextIso = buildIsoFromInputs(value, timeInput);
    if (nextIso) setEatenAt(nextIso);
  }

  function handleTimeInputChange(value: string) {
    setTimeInput(value);

    const nextIso = buildIsoFromInputs(dateInput, value);
    if (nextIso) setEatenAt(nextIso);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Pressable style={styles.headerIcon} onPress={() => router.back()}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={palette.primaryDark}
              />
            </Pressable>

            <View style={styles.headerTextBlock}>
              <Text style={styles.brand}>Hnanut</Text>
              <Text style={styles.title}>{t("createMeal")}</Text>
              <Text style={styles.subtitle}>{t("createMealHint")}</Text>
            </View>
          </View>

          <View style={styles.totalsPanel}>
            <View>
              <Text style={styles.panelLabel}>{t("mealTotals")}</Text>
              <Text style={styles.calorieTotal}>
                {formatNumber(draft.totals.calories, language)}
              </Text>
              <Text style={styles.calorieCaption}>{t("caloriesShort")}</Text>
            </View>

            <View style={styles.totalStats}>
              <TotalStat
                label={t("proteinShort")}
                value={draft.totals.protein}
                language={language}
                styles={styles}
              />
              <TotalStat
                label={t("carbsShort")}
                value={draft.totals.carbs}
                language={language}
                styles={styles}
              />
              <TotalStat
                label={t("fatShort")}
                value={draft.totals.fat}
                language={language}
                styles={styles}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("mealType")}</Text>
            </View>

            <View style={styles.typeGrid}>
              {mealTypeOptions.map((option) => (
                <MealTypeButton
                  key={option.value}
                  option={option}
                  active={draft.mealType === option.value}
                  palette={palette}
                  styles={styles}
                  onPress={() => setMealType(option.value)}
                />
              ))}
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={palette.primaryDark}
                />
              </View>

              <View style={styles.infoTextBlock}>
                <Text style={styles.infoLabel}>{t("eatenAt")}</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(draft.eatenAt, language)}
                </Text>
              </View>

              <Pressable
                style={styles.smallAction}
                onPress={handleUseNow}
              >
                <Text style={styles.smallActionText}>{t("now")}</Text>
              </Pressable>
            </View>

            <View style={styles.dateTimeGrid}>
              <View style={styles.dateTimeField}>
                <Text style={styles.inputLabel}>{t("date")}</Text>
                <TextInput
                  value={dateInput}
                  onChangeText={handleDateInputChange}
                  placeholder="2026-05-26"
                  placeholderTextColor={palette.placeholder}
                  keyboardType="numbers-and-punctuation"
                  style={[styles.dateTimeInput, webInputStyle]}
                />
              </View>

              <View style={styles.dateTimeField}>
                <Text style={styles.inputLabel}>{t("time")}</Text>
                <TextInput
                  value={timeInput}
                  onChangeText={handleTimeInputChange}
                  placeholder="07:30"
                  placeholderTextColor={palette.placeholder}
                  keyboardType="numbers-and-punctuation"
                  style={[styles.dateTimeInput, webInputStyle]}
                />
              </View>
            </View>

            <View style={styles.noteField}>
              <Text style={styles.inputLabel}>{t("note")}</Text>
              <TextInput
                value={draft.note}
                onChangeText={setNote}
                placeholder={t("notePlaceholder")}
                placeholderTextColor={palette.placeholder}
                multiline
                style={[styles.noteInput, webInputStyle]}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{t("addedFoods")}</Text>
                <Text style={styles.sectionMeta}>
                  {draft.totals.itemCount} {t("totalItems")} -{" "}
                  {formatNumber(draft.totals.totalGram, language)}{" "}
                  {t("gramsShort")}
                </Text>
              </View>

              <Pressable
                style={styles.addMoreButton}
                onPress={handleAddMoreFoods}
              >
                <Ionicons name="add" size={16} color={palette.primaryDark} />
                <Text style={styles.addMoreText}>{t("addMoreFoods")}</Text>
              </Pressable>
            </View>

            {draft.selectedFoods.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons
                  name="basket-outline"
                  size={32}
                  color={palette.primaryDark}
                />
                <Text style={styles.emptyTitle}>
                  {t("emptyMealDraftTitle")}
                </Text>
                <Text style={styles.emptyDescription}>
                  {t("emptyMealDraftDescription")}
                </Text>
                <Pressable
                  style={styles.emptyButton}
                  onPress={handleAddMoreFoods}
                >
                  <Text style={styles.emptyButtonText}>
                    {t("addMoreFoods")}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.foodList}>
                {draft.selectedFoods.map((item) => (
                  <DraftFoodRow
                    key={item.draftItemId}
                    item={item}
                    language={language}
                    palette={palette}
                    styles={styles}
                    labels={{
                      caloriesShort: t("caloriesShort"),
                      gramInput: t("gramInput"),
                      removeFood: t("removeFood"),
                      gramsShort: t("gramsShort"),
                    }}
                    onAdd={() => addFood(item.food, item.gram)}
                    onDecrement={() => decrementFood(item.food.id)}
                    onRemove={() => removeFood(item.food.id)}
                    onChangeGram={(value) =>
                      updateFoodGram(item.food.id, value)
                    }
                    onPreview={() => setPreviewFood(item.food)}
                  />
                ))}
              </View>
            )}
          </View>

          {savedMeal ? (
            <SavedMealCard
              meal={savedMeal}
              language={language}
              styles={styles}
              labels={{
                mealSaved: t("mealSaved"),
                savedMealHint: t("savedMealHint"),
                totalCalories: t("totalCalories"),
                totalItems: t("totalItems"),
                caloriesShort: t("caloriesShort"),
                backHome: t("backHome"),
                createAnotherMeal: t("createAnotherMeal"),
              }}
              onBackHome={() => router.replace("../(tabs)/index")}
              onCreateAnother={handleAddMoreFoods}
            />
          ) : null}

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
          {info ? <Text style={styles.infoBanner}>{info}</Text> : null}

        </ScrollView>

        {!savedMeal ? (
          <View style={styles.footer}>
            <Pressable
              disabled={!canSave || isSaving}
              style={[
                styles.saveButton,
                (!canSave || isSaving) && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveDraft}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.saveButtonText}>{t("saveMeal")}</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}

        {previewFood ? (
          <FoodImagePreview
            food={previewFood}
            onClose={() => setPreviewFood(null)}
          />
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function buildCreateMealRequest(draft: MealDraft): CreateMealRequest | null {
  const items = draft.selectedFoods
    .map((item) => ({
      foodId: item.food.id,
      gram: Math.round(item.gram * item.quantity * 100) / 100,
    }))
    .filter((item) => item.gram > 0);

  if (items.length === 0) return null;

  return {
    mealType: draft.mealType,
    eatenAt: draft.eatenAt,
    note: draft.note.trim() || null,
    items,
  };
}

function MealTypeButton({
  option,
  active,
  palette,
  styles,
  onPress,
}: {
  option: MealTypeOption;
  active: boolean;
  palette: AuthPalette;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.typeButton, active && styles.typeButtonActive]}
      onPress={onPress}
    >
      <Ionicons
        name={option.icon}
        size={17}
        color={active ? "#FFFFFF" : palette.primaryDark}
      />
      <Text
        style={[styles.typeButtonText, active && styles.typeButtonTextActive]}
      >
        {option.label}
      </Text>
    </Pressable>
  );
}

function TotalStat({
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
    <View style={styles.totalStat}>
      <Text style={styles.totalStatLabel}>{label}</Text>
      <Text style={styles.totalStatValue}>
        {formatNumber(value, language, 1)}g
      </Text>
    </View>
  );
}

function SavedMealCard({
  meal,
  language,
  styles,
  labels,
  onBackHome,
  onCreateAnother,
}: {
  meal: MealResponse;
  language: Language;
  styles: ReturnType<typeof createStyles>;
  labels: {
    mealSaved: string;
    savedMealHint: string;
    totalCalories: string;
    totalItems: string;
    caloriesShort: string;
    backHome: string;
    createAnotherMeal: string;
  };
  onBackHome: () => void;
  onCreateAnother: () => void;
}) {
  return (
    <View style={styles.savedCard}>
      <View style={styles.savedIcon}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
      </View>

      <Text style={styles.savedTitle}>{labels.mealSaved}</Text>
      <Text style={styles.savedDescription}>{labels.savedMealHint}</Text>

      <View style={styles.savedStats}>
        <View style={styles.savedStat}>
          <Text style={styles.savedStatLabel}>{labels.totalCalories}</Text>
          <Text style={styles.savedStatValue}>
            {formatNumber(meal.totalCalories, language)} {labels.caloriesShort}
          </Text>
        </View>
        <View style={styles.savedStat}>
          <Text style={styles.savedStatLabel}>{labels.totalItems}</Text>
          <Text style={styles.savedStatValue}>{meal.items.length}</Text>
        </View>
      </View>

      <View style={styles.savedActions}>
        <Pressable style={styles.savedPrimaryButton} onPress={onBackHome}>
          <Text style={styles.savedPrimaryText}>{labels.backHome}</Text>
        </Pressable>
        <Pressable style={styles.savedSecondaryButton} onPress={onCreateAnother}>
          <Text style={styles.savedSecondaryText}>{labels.createAnotherMeal}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DraftFoodRow({
  item,
  language,
  palette,
  styles,
  labels,
  onAdd,
  onDecrement,
  onRemove,
  onChangeGram,
  onPreview,
}: {
  item: MealDraftItem;
  language: Language;
  palette: AuthPalette;
  styles: ReturnType<typeof createStyles>;
  labels: {
    caloriesShort: string;
    gramInput: string;
    removeFood: string;
    gramsShort: string;
  };
  onAdd: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onChangeGram: (gram: number) => void;
  onPreview: () => void;
}) {
  const calories = (item.food.nutritionPer100g.calories * item.gram) / 100;

  function handleGramChange(value: string) {
    const nextValue = Number(value.replace(",", "."));

    if (Number.isFinite(nextValue) && nextValue > 0) {
      onChangeGram(nextValue);
    }
  }

  return (
    <View style={styles.foodRow}>
      <FoodPhoto
        food={item.food}
        palette={palette}
        styles={styles}
        onPreview={onPreview}
      />

      <View style={styles.foodBody}>
        <View style={styles.foodTopRow}>
          <View style={styles.foodNameBlock}>
            <Text style={styles.foodCategory} numberOfLines={1}>
              {item.food.category}
            </Text>
            <Text style={styles.foodName} numberOfLines={2}>
              {item.food.name}
            </Text>
          </View>

          <View style={styles.quantityStepper}>
            <Pressable style={styles.roundButton} onPress={onDecrement}>
              <Ionicons name="remove" size={15} color={palette.primaryDark} />
            </Pressable>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <Pressable style={styles.roundButtonActive} onPress={onAdd}>
              <Ionicons name="add" size={15} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.foodMetaRow}>
          <View style={styles.gramField}>
            <Text style={styles.gramLabel}>{labels.gramInput}</Text>
            <View style={styles.gramInputWrap}>
              <TextInput
                value={formatInputNumber(item.gram)}
                onChangeText={handleGramChange}
                keyboardType="decimal-pad"
                placeholder="100"
                placeholderTextColor={palette.placeholder}
                style={[styles.gramInput, webInputStyle]}
              />
              <Text style={styles.gramSuffix}>{labels.gramsShort}</Text>
            </View>
          </View>

          <View style={styles.itemCalories}>
            <Text style={styles.itemCaloriesValue}>
              {formatNumber(calories * item.quantity, language)}
            </Text>
            <Text style={styles.itemCaloriesLabel}>{labels.caloriesShort}</Text>
          </View>
        </View>

        <Pressable style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="trash-outline" size={14} color={palette.errorText} />
          <Text style={styles.removeText}>{labels.removeFood}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FoodPhoto({
  food,
  palette,
  styles,
  onPreview,
}: {
  food: FoodSearchItem;
  palette: AuthPalette;
  styles: ReturnType<typeof createStyles>;
  onPreview: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const lastTapRef = useRef(0);
  const uri = useMemo(() => getFoodImageUri(food), [food]);

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
        style={[styles.foodPhoto, styles.foodPhotoFallback]}
        onPress={handlePress}
      >
        <Ionicons
          name="restaurant-outline"
          size={22}
          color={palette.primaryDark}
        />
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.foodPhoto} onPress={handlePress}>
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

function formatDateTime(value: string, language: Language) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDateInput(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function formatTimeInput(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [padDatePart(date.getHours()), padDatePart(date.getMinutes())].join(
    ":",
  );
}

function buildIsoFromInputs(dateInput: string, timeInput: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateInput.trim());
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(timeInput.trim());

  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (
    month < 1 ||
    month > 12 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day, hour, minute, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function formatNumber(
  value: number,
  language: Language,
  maximumFractionDigits = 0,
) {
  return new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits,
  }).format(value);
}

function formatInputNumber(value: number) {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100);
}

function createStyles(palette: AuthPalette) {
  return StyleSheet.create({
    safeArea: {
      backgroundColor: palette.screenBg,
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      gap: 14,
      padding: 18,
      paddingBottom: 112,
    },
    headerRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
    },
    headerIcon: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 18,
      borderWidth: 1,
      height: 38,
      justifyContent: "center",
      width: 38,
    },
    headerTextBlock: {
      flex: 1,
    },
    brand: {
      color: palette.primaryDark,
      fontSize: 13,
      fontWeight: "900",
    },
    title: {
      color: palette.text,
      fontSize: 27,
      fontWeight: "900",
      marginTop: 4,
    },
    subtitle: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 5,
    },
    totalsPanel: {
      backgroundColor: palette.primaryDark,
      borderRadius: 24,
      flexDirection: "row",
      gap: 14,
      justifyContent: "space-between",
      padding: 18,
    },
    panelLabel: {
      color: "rgba(255,255,255,0.76)",
      fontSize: 12,
      fontWeight: "800",
    },
    calorieTotal: {
      color: "#FFFFFF",
      fontSize: 38,
      fontWeight: "900",
      lineHeight: 44,
      marginTop: 2,
    },
    calorieCaption: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 12,
      fontWeight: "900",
    },
    totalStats: {
      flex: 1,
      gap: 8,
      maxWidth: 160,
    },
    totalStat: {
      backgroundColor: "rgba(255,255,255,0.14)",
      borderRadius: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    totalStatLabel: {
      color: "rgba(255,255,255,0.78)",
      fontSize: 11,
      fontWeight: "800",
    },
    totalStatValue: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "900",
    },
    card: {
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 22,
      borderWidth: 1,
      gap: 14,
      padding: 16,
    },
    sectionHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "900",
    },
    sectionMeta: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "800",
      marginTop: 3,
    },
    typeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    typeButton: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderColor: palette.border,
      borderRadius: 16,
      borderWidth: 1,
      flexBasis: "48%",
      flexDirection: "row",
      flexGrow: 1,
      gap: 8,
      minHeight: 48,
      paddingHorizontal: 12,
    },
    typeButtonActive: {
      backgroundColor: palette.primaryDark,
      borderColor: palette.primaryDark,
    },
    typeButtonText: {
      color: palette.label,
      flex: 1,
      fontSize: 13,
      fontWeight: "900",
    },
    typeButtonTextActive: {
      color: "#FFFFFF",
    },
    infoRow: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 16,
      flexDirection: "row",
      gap: 10,
      padding: 12,
    },
    infoIcon: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 14,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    infoTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    infoLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "800",
    },
    infoValue: {
      color: palette.text,
      fontSize: 13,
      fontWeight: "900",
      marginTop: 3,
    },
    smallAction: {
      backgroundColor: palette.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    smallActionText: {
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "900",
    },
    dateTimeGrid: {
      flexDirection: "row",
      gap: 10,
    },
    dateTimeField: {
      flex: 1,
      gap: 8,
    },
    dateTimeInput: {
      backgroundColor: palette.inputBg,
      borderRadius: 14,
      color: palette.inputText,
      fontSize: 14,
      fontWeight: "900",
      minHeight: 48,
      paddingHorizontal: 14,
    },
    noteField: {
      gap: 8,
    },
    inputLabel: {
      color: palette.label,
      fontSize: 12,
      fontWeight: "900",
    },
    noteInput: {
      backgroundColor: palette.inputBg,
      borderRadius: 16,
      color: palette.inputText,
      fontSize: 14,
      minHeight: 86,
      padding: 14,
      textAlignVertical: "top",
    },
    addMoreButton: {
      alignItems: "center",
      backgroundColor: palette.primarySoft,
      borderRadius: 999,
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    addMoreText: {
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "900",
    },
    emptyBox: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 18,
      gap: 8,
      padding: 22,
    },
    emptyTitle: {
      color: palette.text,
      fontSize: 17,
      fontWeight: "900",
      textAlign: "center",
    },
    emptyDescription: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
    },
    emptyButton: {
      backgroundColor: palette.primaryDark,
      borderRadius: 999,
      marginTop: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    emptyButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
    },
    foodList: {
      gap: 10,
    },
    foodRow: {
      backgroundColor: palette.inputBg,
      borderRadius: 18,
      flexDirection: "row",
      gap: 12,
      padding: 12,
    },
    foodPhoto: {
      alignItems: "center",
      borderRadius: 16,
      height: 54,
      justifyContent: "center",
      overflow: "hidden",
      width: 54,
    },
    foodPhotoFallback: {
      backgroundColor: palette.primarySoft,
    },
    foodImage: {
      height: "100%",
      width: "100%",
    },
    foodBody: {
      flex: 1,
      gap: 10,
      minWidth: 0,
    },
    foodTopRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 8,
    },
    foodNameBlock: {
      flex: 1,
      minWidth: 0,
    },
    foodCategory: {
      color: palette.primaryDark,
      fontSize: 10,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    foodName: {
      color: palette.text,
      fontSize: 15,
      fontWeight: "900",
      lineHeight: 19,
      marginTop: 2,
    },
    quantityStepper: {
      alignItems: "center",
      flexDirection: "row",
      gap: 6,
    },
    roundButton: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 15,
      height: 30,
      justifyContent: "center",
      width: 30,
    },
    roundButtonActive: {
      alignItems: "center",
      backgroundColor: palette.primaryDark,
      borderRadius: 15,
      height: 30,
      justifyContent: "center",
      width: 30,
    },
    quantityText: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "900",
      minWidth: 16,
      textAlign: "center",
    },
    foodMetaRow: {
      alignItems: "flex-end",
      flexDirection: "row",
      gap: 10,
      justifyContent: "space-between",
    },
    gramField: {
      flex: 1,
      gap: 5,
    },
    gramLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "800",
    },
    gramInputWrap: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderRadius: 12,
      flexDirection: "row",
      minHeight: 42,
      paddingHorizontal: 10,
    },
    gramInput: {
      color: palette.inputText,
      flex: 1,
      fontSize: 14,
      fontWeight: "900",
      minHeight: 42,
      padding: 0,
    },
    gramSuffix: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "900",
    },
    itemCalories: {
      alignItems: "flex-end",
      minWidth: 72,
    },
    itemCaloriesValue: {
      color: palette.primaryDark,
      fontSize: 18,
      fontWeight: "900",
    },
    itemCaloriesLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "800",
    },
    savedCard: {
      alignItems: "center",
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 22,
      borderWidth: 1,
      gap: 10,
      padding: 18,
    },
    savedIcon: {
      alignItems: "center",
      backgroundColor: palette.primaryDark,
      borderRadius: 22,
      height: 44,
      justifyContent: "center",
      width: 44,
    },
    savedTitle: {
      color: palette.text,
      fontSize: 19,
      fontWeight: "900",
      textAlign: "center",
    },
    savedDescription: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
    },
    savedStats: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
    },
    savedStat: {
      backgroundColor: palette.inputBg,
      borderRadius: 14,
      flex: 1,
      padding: 12,
    },
    savedStatLabel: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "800",
    },
    savedStatValue: {
      color: palette.text,
      fontSize: 15,
      fontWeight: "900",
      marginTop: 4,
    },
    savedActions: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
    },
    savedPrimaryButton: {
      alignItems: "center",
      backgroundColor: palette.primaryDark,
      borderRadius: 999,
      flex: 1,
      justifyContent: "center",
      minHeight: 44,
      paddingHorizontal: 12,
    },
    savedPrimaryText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
    },
    savedSecondaryButton: {
      alignItems: "center",
      backgroundColor: palette.primarySoft,
      borderRadius: 999,
      flex: 1,
      justifyContent: "center",
      minHeight: 44,
      paddingHorizontal: 12,
    },
    savedSecondaryText: {
      color: palette.primaryDark,
      fontSize: 13,
      fontWeight: "900",
    },
    removeButton: {
      alignItems: "center",
      alignSelf: "flex-start",
      flexDirection: "row",
      gap: 5,
    },
    removeText: {
      color: palette.errorText,
      fontSize: 12,
      fontWeight: "900",
    },
    infoBanner: {
      backgroundColor: palette.primarySoft,
      borderRadius: 16,
      color: palette.primaryDark,
      fontSize: 12,
      fontWeight: "800",
      lineHeight: 18,
      padding: 12,
    },
    errorBanner: {
      backgroundColor: palette.errorBg,
      borderRadius: 16,
      color: palette.errorText,
      fontSize: 12,
      fontWeight: "800",
      lineHeight: 18,
      padding: 12,
    },
    saveButton: {
      alignItems: "center",
      backgroundColor: palette.primary,
      borderRadius: 999,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      minHeight: 52,
    },
    footer: {
      backgroundColor: palette.screenBg,
      borderTopColor: palette.border,
      borderTopWidth: 1,
      paddingBottom: Platform.OS === "web" ? 18 : 22,
      paddingHorizontal: 18,
      paddingTop: 10,
    },
    saveButtonDisabled: {
      opacity: 0.45,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },
  });
}
