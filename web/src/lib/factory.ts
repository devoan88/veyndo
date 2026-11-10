import type { Business, Template } from "./types";
import type { Profession } from "./professions";
import { getTemplates } from "./templates";
import { toSlug } from "./slug";
import type { Locale } from "./i18n/config";
import { DEFAULT_LOCALE, marketCity } from "./i18n/config";
import { getMessages } from "./i18n/messages";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const newServiceId = uid;

export function fromTemplate(t: Template, name?: string, _locale: Locale = DEFAULT_LOCALE): Business {
  void _locale;
  const businessName = name?.trim() || t.example.name;
  const city = t.example.city;
  const districtPhrase = `${city} ${t.example.district}`;
  return {
    id: uid(),
    slug: toSlug(businessName),
    templateKey: t.key,
    name: businessName,
    tagline: t.tagline.replace("{district}", districtPhrase),
    about: t.about,
    street: "",
    postalCode: t.example.district,
    city,
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
export function fromProfession(p: Profession, name?: string, locale: Locale = DEFAULT_LOCALE): Business {
  const templates = getTemplates(locale);
  const base = p.base ? templates.find((t) => t.key === p.base) : undefined;
  if (base) return { ...fromTemplate(base, name, locale), templateKey: p.key, accentColor: p.accent };

  const m = getMessages(locale);
  const label = m.professionLabels[p.key] ?? p.label;
  const city = marketCity(locale);
  const businessName = name?.trim() || label;
  const preset = p.hours === "termin" ? null : HOURS[p.hours ?? "werktags"];
  const free = "უფასო";
  const onRequest = "შეთანხმებით";
  const byAppt = m.hours.byAppointment;
  const services = (p.services ?? []).map(([title, priceLabel, durationMin]) => ({
    id: uid(),
    title,
    priceLabel: priceLabel
      .replace(/kostenlos/gi, free)
      .replace(/auf Anfrage/gi, onRequest),
    durationMin,
  }));

  return {
    id: uid(),
    slug: toSlug(businessName),
    templateKey: p.key,
    name: businessName,
    tagline: p.tagline ?? `${label} ${city}-ში`,
    about: `${label} ${city}-ში. პირადი, საიმედო და დრო თქვენთვის.`,
    street: "",
    postalCode: "",
    city,
    district: "",
    phone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    accentColor: p.accent,
    theme: "klassisch",
    coverDataUrl: null,
    photos: [],
    services,
    hours: [1, 2, 3, 4, 5, 6, 7].map((weekday) => {
      if (!preset) return { weekday, closed: weekday > 5, note: weekday > 5 ? undefined : byAppt };
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
