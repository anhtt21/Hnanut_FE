export type ColorMode = "light" | "dark";

export type AuthPalette = {
  screenBg: string;
  cardBg: string;
  headerBand: string;
  heroCardBg: string;
  heroBg: string;
  text: string;
  muted: string;
  label: string;
  inputBg: string;
  inputText: string;
  placeholder: string;
  icon: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  divider: string;
  border: string;
  errorBg: string;
  errorText: string;
  policy: string;
  orange: string;
  yellow: string;
};

export const authPalettes: Record<ColorMode, AuthPalette> = {
  light: {
    screenBg: "#F5FBF7",
    cardBg: "#FFFFFF",
    headerBand: "#DDF8E8",
    heroCardBg: "#FFFFFF",
    heroBg: "#E3F7EB",
    text: "#12211A",
    muted: "#6E7F77",
    label: "#52645C",
    inputBg: "#F3F7F4",
    inputText: "#12211A",
    placeholder: "#9AA9A2",
    icon: "#8CA39A",
    primary: "#18B75F",
    primaryDark: "#0B8F4D",
    primarySoft: "#E7F8ED",
    divider: "#E2EBE5",
    border: "#E2EBE5",
    errorBg: "#FEF2F2",
    errorText: "#DC2626",
    policy: "#7B8D85",
    orange: "#F97316",
    yellow: "#FACC15",
  },
  dark: {
    screenBg: "#07140F",
    cardBg: "#10241A",
    headerBand: "#123B27",
    heroCardBg: "#10241A",
    heroBg: "#173F2B",
    text: "#F3FFF8",
    muted: "#A9B9B1",
    label: "#C7D8CF",
    inputBg: "#183126",
    inputText: "#F3FFF8",
    placeholder: "#7F9188",
    icon: "#A8B9B0",
    primary: "#22C55E",
    primaryDark: "#34D978",
    primarySoft: "#153D28",
    divider: "#244234",
    border: "#294A3A",
    errorBg: "#3D1519",
    errorText: "#FCA5A5",
    policy: "#91A69B",
    orange: "#FB923C",
    yellow: "#FDE047",
  },
};
