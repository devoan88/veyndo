"use client";

import type { Business, OpeningDay, PlanTier, Service } from "./types";
import { getTemplate } from "./templates";
import { supabaseConfigured } from "./env";
import { createClient } from "./supabase/client";
import { fromTemplate } from "./factory";
export { newServiceId, fromTemplate } from "./factory";

const KEY = "veyndo.business.v1";

export function saveDraft(b: Business) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...b, updatedAt: new Date().toISOString() }));
  } catch {}
}

export function loadDraft(): Business | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Business) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

function localLoad(): Business | null {
  return loadDraft();
}

function localSave(b: Business) {
  saveDraft(b);
}

function hm(t: string | null | undefined) {
  if (!t) return undefined;
  return String(t).slice(0, 5);
}

type BizRow = {
  id: string;
  slug: string;
  template_key: string;
  name: string;
  tagline: string | null;
  about: string | null;
  street: string | null;
  postal_code: string | null;
  city: string;
  district: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  accent_color: string;
  cover_path: string | null;
  legal_name: string | null;
  legal_form: string | null;
  uid_number: string | null;
  is_published: boolean;
  updated_at: string;
};

function publicCoverUrl(path: string | null) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/photos/${path}`;
}

function mapRow(
  row: BizRow,
  services: Service[],
  hours: OpeningDay[],
  tier: PlanTier,
): Business {
  return {
    id: row.id,
    slug: row.slug,
    templateKey: row.template_key,
    name: row.name,
    tagline: row.tagline || "",
    about: row.about || "",
    street: row.street || "",
    postalCode: row.postal_code || "",
    city: row.city,
    district: row.district || "",
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    email: row.email || "",
    instagram: row.instagram || "",
    accentColor: row.accent_color,
    coverDataUrl: publicCoverUrl(row.cover_path),
    services,
    hours,
    legalName: row.legal_name || "",
    legalForm: row.legal_form || "",
    uidNumber: row.uid_number || "",
    isPublished: row.is_published,
    tier,
    updatedAt: row.updated_at,
  };
}

async function currentUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

async function fetchTier(ownerId: string): Promise<PlanTier> {
  const supabase = createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("tier,status")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (data && ["active", "trialing", "past_due"].includes(data.status)) return data.tier as PlanTier;
  return "basis";
}

async function loadRemote(): Promise<Business | null> {
  const supabase = createClient();
  const user = await currentUser();
  if (!user) return loadDraft();

  const { data: row, error } = await supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();
  if (error) throw error;
  if (!row) {
    const draft = loadDraft();
    if (draft) {
      const saved = await saveRemote(draft, user.id);
      clearDraft();
      return saved;
    }
    return null;
  }

  const [{ data: svcs }, { data: hrs }, tier] = await Promise.all([
    supabase.from("services").select("*").eq("business_id", row.id).order("position"),
    supabase.from("opening_hours").select("*").eq("business_id", row.id).order("weekday"),
    fetchTier(user.id),
  ]);

  const services: Service[] = (svcs || []).map((s: { id: string; title: string; price_label: string | null; duration_min: number | null }) => ({
    id: s.id,
    title: s.title,
    priceLabel: s.price_label || "",
    durationMin: s.duration_min,
  }));
  const hours: OpeningDay[] = (hrs || []).map((h: { weekday: number; closed: boolean; opens: string | null; closes: string | null; note: string | null }) => ({
    weekday: h.weekday,
    closed: h.closed,
    opens: hm(h.opens),
    closes: hm(h.closes),
    note: h.note || undefined,
  }));
  if (hours.length === 0) {
    hours.push(...Array.from({ length: 7 }, (_, i) => ({ weekday: i + 1, closed: i >= 5, opens: "09:00", closes: "18:00" })));
  }
  return mapRow(row as BizRow, services, hours, tier);
}

async function uploadCover(businessId: string, dataUrl: string) {
  const supabase = createClient();
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const path = `${businessId}/cover.jpg`;
  const { error } = await supabase.storage.from("photos").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
  if (error) throw error;
  return path;
}

async function saveRemote(b: Business, ownerId?: string): Promise<Business> {
  const supabase = createClient();
  const user = ownerId ? { id: ownerId } : await currentUser();
  if (!user) {
    localSave(b);
    return b;
  }

  let coverPath: string | null = null;
  if (b.coverDataUrl?.startsWith("data:")) {
    coverPath = await uploadCover(b.id, b.coverDataUrl);
  } else if (b.coverDataUrl?.includes("/photos/")) {
    const marker = "/object/public/photos/";
    const i = b.coverDataUrl.indexOf(marker);
    if (i >= 0) coverPath = b.coverDataUrl.slice(i + marker.length);
  }

  const payload = {
    id: b.id,
    owner_id: user.id,
    slug: b.slug,
    template_key: b.templateKey,
    name: b.name.slice(0, 80) || "Betrieb",
    tagline: b.tagline.slice(0, 120) || null,
    about: b.about.slice(0, 600) || null,
    street: b.street || null,
    postal_code: b.postalCode || null,
    city: b.city || "Wien",
    district: b.district || null,
    phone: b.phone || null,
    whatsapp: b.whatsapp || null,
    email: b.email || null,
    instagram: b.instagram || null,
    accent_color: b.accentColor,
    cover_path: coverPath,
    legal_name: b.legalName || null,
    legal_form: b.legalForm || null,
    uid_number: b.uidNumber || null,
    is_published: b.isPublished,
  };

  const { error: upErr } = await supabase.from("businesses").upsert(payload);
  if (upErr) throw upErr;

  await supabase.from("services").delete().eq("business_id", b.id);
  if (b.services.length) {
    const { error } = await supabase.from("services").insert(
      b.services.map((s, i) => ({
        id: s.id,
        business_id: b.id,
        position: i,
        title: s.title.slice(0, 80) || "Leistung",
        price_label: s.priceLabel.slice(0, 30) || null,
        duration_min: s.durationMin ?? null,
      })),
    );
    if (error) throw error;
  }

  await supabase.from("opening_hours").delete().eq("business_id", b.id);
  if (b.hours.length) {
    const { error } = await supabase.from("opening_hours").insert(
      b.hours.map((h) => ({
        business_id: b.id,
        weekday: h.weekday,
        opens: h.closed ? null : h.opens || null,
        closes: h.closed ? null : h.closes || null,
        closed: h.closed,
        note: h.note || null,
      })),
    );
    if (error) throw error;
  }

  const tier = await fetchTier(user.id);
  const next = { ...b, coverDataUrl: coverPath ? publicCoverUrl(coverPath) : b.coverDataUrl, tier, updatedAt: new Date().toISOString() };
  return next;
}

export async function loadBusiness(): Promise<Business | null> {
  if (!supabaseConfigured()) return localLoad();
  try {
    return await loadRemote();
  } catch {
    return localLoad();
  }
}

export async function saveBusiness(b: Business): Promise<Business> {
  if (!supabaseConfigured()) {
    localSave(b);
    return b;
  }
  try {
    return await saveRemote(b);
  } catch {
    localSave(b);
    return b;
  }
}

export async function clearBusiness(): Promise<void> {
  clearDraft();
  if (!supabaseConfigured()) return;
  try {
    const supabase = createClient();
    const user = await currentUser();
    if (!user) return;
    await supabase.from("businesses").delete().eq("owner_id", user.id);
  } catch {}
}

export function newBusiness(templateKey: string, name?: string): Business {
  return fromTemplate(getTemplate(templateKey), name);
}

export async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  if (!supabaseConfigured()) {
    const d = loadDraft();
    return Boolean(d && d.slug === slug && d.id !== exceptId);
  }
  const supabase = createClient();
  const q = supabase.from("businesses").select("id").eq("slug", slug);
  const { data } = await q.maybeSingle();
  if (!data) return false;
  return data.id !== exceptId;
}

export async function loadStats(businessId: string): Promise<Record<string, number>> {
  const empty = { view: 0, call: 0, whatsapp: 0, route: 0, qr: 0 };
  if (!supabaseConfigured()) return empty;
  const supabase = createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.from("events").select("kind").eq("business_id", businessId).gte("created_at", since);
  if (error || !data) return empty;
  const out = { ...empty };
  for (const row of data) {
    const k = row.kind as keyof typeof out;
    if (k in out) out[k] += 1;
  }
  return out;
}
