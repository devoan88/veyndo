import type { ProfileTheme } from "./types";

export const THEMES: { key: ProfileTheme; label: string; bg: string; fg: string; card: string }[] = [
  { key: "klassisch", label: "Klassisch", bg: "#fffdf9", fg: "#2c362b", card: "#f1ebdf" },
  { key: "modern", label: "Modern", bg: "#121612", fg: "#eef0ea", card: "#232b24" },
  { key: "frisch", label: "Frisch", bg: "#ffffff", fg: "#1d221d", card: "#f0f2ea" },
];

export const SWATCHES = ["#b98b86", "#8a9a62", "#3d4a3a", "#5b7c99", "#c27c4e", "#8e6fa8", "#b8a06a", "#2c2c2c"];
