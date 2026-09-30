import type { Business, Template } from "./types";
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
