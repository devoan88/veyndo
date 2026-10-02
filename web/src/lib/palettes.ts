import type { ProfileTheme } from "./types";

export type Palette = { key: string; name: string; theme: ProfileTheme; accent: string; mood: string };

// Ready-made looks for the demo builder: style + colour in one tap.
export const PALETTES: Palette[] = [
  { key: "salbei", name: "Salbei", theme: "klassisch", accent: "#8a9a62", mood: "ruhig, natürlich" },
  { key: "rose", name: "Rosé", theme: "frisch", accent: "#b98b86", mood: "zart, freundlich" },
  { key: "melange", name: "Wiener Melange", theme: "klassisch", accent: "#8b6a4e", mood: "warm, traditionell" },
  { key: "nachtblau", name: "Nachtblau", theme: "modern", accent: "#5b7c99", mood: "seriös, ruhig" },
  { key: "terracotta", name: "Terracotta", theme: "klassisch", accent: "#c27c4e", mood: "herzlich, erdig" },
  { key: "lavendel", name: "Lavendel", theme: "frisch", accent: "#8e6fa8", mood: "sanft, kreativ" },
  { key: "gold", name: "Schwarz & Gold", theme: "modern", accent: "#b8a06a", mood: "edel, exklusiv" },
  { key: "mint", name: "Mint", theme: "frisch", accent: "#4f9d8a", mood: "sauber, frisch" },
  { key: "bordeaux", name: "Bordeaux", theme: "klassisch", accent: "#8c3b4a", mood: "elegant, genussvoll" },
  { key: "koralle", name: "Koralle", theme: "frisch", accent: "#e0725a", mood: "lebendig, mutig" },
  { key: "wald", name: "Waldgrün", theme: "modern", accent: "#5f8a5a", mood: "stark, bodenständig" },
  { key: "graphit", name: "Graphit", theme: "modern", accent: "#c9a227", mood: "technisch, klar" },
];

export const THEME_BG: Record<ProfileTheme, { bg: string; fg: string; card: string }> = {
  klassisch: { bg: "#fffdf9", fg: "#2c362b", card: "#f1ebdf" },
  modern: { bg: "#121612", fg: "#eef0ea", card: "#232b24" },
  frisch: { bg: "#ffffff", fg: "#1d221d", card: "#f0f2ea" },
};
