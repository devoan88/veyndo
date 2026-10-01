import { fromTemplate } from "./factory";
import { TEMPLATES } from "./templates";
import { branchPhoto, DEMO_GALLERY, photo } from "./photos";
import type { Business, ProfileTheme } from "./types";

const DEMO_THEME: Record<string, ProfileTheme> = {
  friseur: "frisch", nagelstudio: "frisch", kosmetik: "klassisch", massage: "klassisch",
  physiotherapie: "frisch", psychotherapie: "klassisch", elektriker: "modern", installateur: "modern", reinigung: "frisch",
};

export function demoBusiness(slug: string): Business | null {
  if (!slug.startsWith("beispiel-")) return null;
  const t = TEMPLATES.find((x) => x.key === slug.slice("beispiel-".length));
  if (!t) return null;
  const b = fromTemplate(t);
  return {
    ...b,
    slug,
    tier: "profil",
    phone: "+43 1 234 56 78",
    whatsapp: "+43 664 123 45 67",
    street: "Beispielgasse 1",
    postalCode: t.example.district,
    legalName: `${t.example.name} (Beispiel)`,
    isPublished: true,
    theme: DEMO_THEME[t.key] ?? "klassisch",
    coverDataUrl: branchPhoto(t.key, 1200, 640),
    photos: (DEMO_GALLERY[t.key] ?? []).map((id) => ({ id, url: photo(id, 1400) })),
  };
}
