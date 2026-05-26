import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authPalettes, type AuthPalette } from "@/constants/appTheme";
import { usePreferences } from "@/stores/preferenceStore";
import type { FoodSearchItem } from "@/types/food";
import { getFoodImageUri } from "@/utils/foodImages";

export default function FoodImagePreview({
  food,
  onClose,
}: {
  food: FoodSearchItem;
  onClose: () => void;
}) {
  const { colorMode, t } = usePreferences();
  const palette = authPalettes[colorMode];
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [failed, setFailed] = useState(false);
  const uri = useMemo(() => getFoodImageUri(food), [food]);

  return (
    <View style={styles.overlay}>
      <Pressable
        accessibilityLabel={t("close")}
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.category} numberOfLines={1}>
              {food.category}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {food.name}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={t("close")}
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color={palette.icon} />
          </Pressable>
        </View>

        {uri && !failed ? (
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="cover"
            transition={180}
            onError={() => setFailed(true)}
          />
        ) : (
          <View style={styles.fallback}>
            <Ionicons
              name="restaurant-outline"
              size={44}
              color={palette.primaryDark}
            />
          </View>
        )}
      </View>
    </View>
  );
}

function createStyles(palette: AuthPalette) {
  return StyleSheet.create({
    overlay: {
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
      bottom: 0,
      justifyContent: "center",
      left: 0,
      padding: 22,
      position: "absolute",
      right: 0,
      top: 0,
      zIndex: 40,
    },
    card: {
      backgroundColor: palette.cardBg,
      borderColor: palette.border,
      borderRadius: 24,
      borderWidth: 1,
      gap: 14,
      maxWidth: 420,
      padding: 14,
      width: "100%",
    },
    header: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 12,
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
    title: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 25,
      marginTop: 2,
    },
    closeButton: {
      alignItems: "center",
      backgroundColor: palette.inputBg,
      borderRadius: 18,
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    image: {
      aspectRatio: 1,
      borderRadius: 18,
      width: "100%",
    },
    fallback: {
      alignItems: "center",
      aspectRatio: 1,
      backgroundColor: palette.primarySoft,
      borderRadius: 18,
      justifyContent: "center",
      width: "100%",
    },
  });
}
