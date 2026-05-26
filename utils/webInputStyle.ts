import { Platform, type TextStyle } from "react-native";

export const webInputStyle =
  Platform.OS === "web"
    ? ({
        outlineColor: "transparent",
        outlineStyle: "none",
        outlineWidth: 0,
      } as unknown as TextStyle)
    : undefined;
