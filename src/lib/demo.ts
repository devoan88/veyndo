import { fromTemplate } from "./factory";
import { getTemplates } from "./templates";
import { branchPhoto, DEMO_GALLERY, photo } from "./photos";
import type { Business, ProfileTheme } from "./types";
import type { Locale } from "./i18n/config";
import { DEFAULT_LOCALE } from "./i18n/config";

const DEMO_THEME: Record<string, ProfileTheme> = {
  friseur: "frisch", nagelstudio: "frisch", kosmetik: "klassisch", massage: "klassisch",
  physiotherapie: "frisch", psychotherapie: "klassisch", elektriker: "modern", installateur: "modern", reinigung: "frisch",
};

export function demoBusiness(slug: string, locale: Locale = DEFAULT_LOCALE): Business | null {
  if (!slug.startsWith("beispiel-")) return null;
  const t = getTemplates(locale).find((x) => x.key === slug.slice("beispiel-".length));
  if (!t) return null;
  const b = fromTemplate(t, undefined, locale);
  return {
    ...b,
    slug,
    tier: "profil",
    phone: "+995 32 000 00 00",
    whatsapp: "+995 555 00 00 00",
    street: "ნიმუშის ქუჩა 1",
    postalCode: t.example.district,
    legalName: `${t.example.name} (მაგალითი)`,
    isPublished: true,
    theme: DEMO_THEME[t.key] ?? "klassisch",
    coverDataUrl: branchPhoto(t.key, 1200, 640),
    photos: (DEMO_GALLERY[t.key] ?? []).map((id) => ({ id, url: photo(id, 1400) })),
  };
}
