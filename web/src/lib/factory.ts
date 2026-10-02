import type { Business, Template } from "./types";
import type { Profession } from "./professions";
import { TEMPLATES } from "./templates";
import { toSlug } from "./slug";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const newServiceId = uid;

export function fromTemplate(t: Template, name?: string): Business {
  const businessName = name?.trim() || t.example.name;
  return {
    id: uid(),
    slug: toSlug(businessName),
    templateKey: t.key,
    name: businessName,
    tagline: t.tagline.replace("{district}", `Wien ${t.example.district}`),
    about: t.about,
    street: "",
    postalCode: t.example.district,
    city: t.example.city,
    district: t.example.district,
    phone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    accentColor: t.accent_color,
    theme: "klassisch",
    coverDataUrl: null,
    services: t.services.map((s) => ({
      id: uid(),
      title: s.title,
      priceLabel: s.price_label,
      durationMin: s.duration_min,
    })),
    hours: t.opening_hours.map((h) => ({ ...h })),
    legalName: "",
    legalForm: "",
    uidNumber: "",
    isPublished: false,
    tier: "basis",
    updatedAt: new Date().toISOString(),
  };
}

const HOURS: Record<string, [number, string, string][]> = {
  werktags: [[1, "08:00", "17:00"], [2, "08:00", "17:00"], [3, "08:00", "17:00"], [4, "08:00", "17:00"], [5, "08:00", "15:00"]],
  salon: [[2, "09:00", "18:00"], [3, "09:00", "18:00"], [4, "09:00", "19:00"], [5, "09:00", "18:00"], [6, "09:00", "14:00"]],
  spaet: [[1, "10:00", "20:00"], [2, "10:00", "20:00"], [3, "10:00", "20:00"], [4, "10:00", "20:00"], [5, "10:00", "20:00"], [6, "10:00", "16:00"]],
};

/** Demo business for any profession of the catalog (see lib/professions.ts). */
export function fromProfession(p: Profession, name?: string): Business {
  const base = p.base ? TEMPLATES.find((t) => t.key === p.base) : undefined;
  if (base) return { ...fromTemplate(base, name), templateKey: p.key, accentColor: p.accent };

  const businessName = name?.trim() || `${p.label} Muster`;
  const preset = p.hours === "termin" ? null : HOURS[p.hours ?? "werktags"];
  return {
    id: uid(),
    slug: toSlug(businessName),
    templateKey: p.key,
    name: businessName,
    tagline: p.tagline ?? `${p.label} in Wien`,
    about: `${p.label} in Wien. Persönlich, verlässlich und mit Zeit für Sie.`,
    street: "",
    postalCode: "",
    city: "Wien",
    district: "",
    phone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    accentColor: p.accent,
    theme: "klassisch",
    coverDataUrl: null,
    photos: [],
    services: (p.services ?? []).map(([title, priceLabel, durationMin]) => ({ id: uid(), title, priceLabel, durationMin })),
    hours: [1, 2, 3, 4, 5, 6, 7].map((weekday) => {
      if (!preset) return { weekday, closed: weekday > 5, note: weekday > 5 ? undefined : "nach Vereinbarung" };
      const d = preset.find(([w]) => w === weekday);
      return d ? { weekday, closed: false, opens: d[1], closes: d[2] } : { weekday, closed: true };
    }),
    legalName: "",
    legalForm: "",
    uidNumber: "",
    isPublished: false,
    tier: "basis",
    updatedAt: new Date().toISOString(),
  };
}
