"use client";

// Storage layer. For now the business lives in the browser (localStorage) so the
// app runs without a backend. When Supabase is connected, only this file changes:
// the same functions will read and write the tables in supabase/schema.sql.

import type { Business, Template } from "./types";
import { getTemplate } from "./templates";
import { toSlug } from "./slug";

const KEY = "veyndo.business.v1";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

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

export function loadBusiness(): Business | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Business) : null;
  } catch {
    return null;
  }
}

export function saveBusiness(b: Business): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...b, updatedAt: new Date().toISOString() }));
  } catch {
    // Storage full or blocked (e.g. private mode). The editor keeps working in memory.
  }
}

export function clearBusiness(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function newBusiness(templateKey: string, name?: string): Business {
  return fromTemplate(getTemplate(templateKey), name);
}

export const newServiceId = uid;
