import { fromTemplate } from "./factory";
import { TEMPLATES } from "./templates";
import type { Business } from "./types";

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
  };
}
