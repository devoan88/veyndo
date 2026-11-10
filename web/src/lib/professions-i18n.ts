import type { Locale } from "./i18n/config";
import { getMessages } from "./i18n/messages";
import { CATEGORIES, PROFESSIONS, type Profession } from "./professions";

const CAT_DE_TO_KA: Record<string, string> = {
  Schönheit: "სილამაზე",
  Gesundheit: "ჯანმრთელობა",
  Handwerk: "ხელოსნობა",
  "Essen & Handel": "საჭმელი და ვაჭრობა",
  "Sport & Lernen": "სპორტი და სწავლა",
  "Kreativ & Beratung": "კრეატივი და კონსულტაცია",
  "Auto & Tier": "ავტო და ცხოველი",
};

export function getCategories(locale: Locale): string[] {
  return locale === "ka" ? getMessages("ka").categories : CATEGORIES;
}

/** Professions with localized labels/categories for the active locale. */
export function getLocalizedProfessions(locale: Locale): Profession[] {
  if (locale !== "ka") return PROFESSIONS;
  const labels = getMessages("ka").professionLabels;
  return PROFESSIONS.map((p) => ({
    ...p,
    label: labels[p.key] ?? p.label,
    cat: CAT_DE_TO_KA[p.cat] ?? p.cat,
  }));
}

export function categoryKeyFromLocalized(cat: string | null, locale: Locale): string | null {
  if (!cat) return null;
  if (locale !== "ka") return cat;
  const entry = Object.entries(CAT_DE_TO_KA).find(([, ka]) => ka === cat);
  return entry ? entry[0] : cat;
}
