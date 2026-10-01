import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { demoBusiness } from "@/lib/demo";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { supabaseConfigured } from "@/lib/env";
import PublicProfileClient from "./PublicProfileClient";
import type { Business, OpeningDay, PlanTier, ProfileTheme, Service } from "@/lib/types";

function hm(t: string | null | undefined) {
  if (!t) return undefined;
  return String(t).slice(0, 5);
}

async function loadPublished(slug: string): Promise<Business | null> {
  const demo = demoBusiness(slug);
  if (demo) return demo;
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: row } = await supabase.from("businesses").select("*").eq("slug", slug).maybeSingle();
  if (!row) return null;
  const [{ data: svcs }, { data: hrs }, { data: planRow }, { data: pics }] = await Promise.all([
    supabase.from("services").select("*").eq("business_id", row.id).order("position"),
    supabase.from("opening_hours").select("*").eq("business_id", row.id).order("weekday"),
    supabase.from("published_subscription_tier").select("tier,status").eq("business_id", row.id).maybeSingle(),
    supabase.from("photos").select("id,path").eq("business_id", row.id).order("position"),
  ]);
  let tier: PlanTier = "basis";
  if (planRow && ["active", "trialing", "past_due"].includes(planRow.status)) tier = planRow.tier as PlanTier;
  const services: Service[] = (svcs || []).map((s: { id: string; title: string; price_label: string | null; duration_min: number | null }) => ({
    id: s.id,
    title: s.title,
    priceLabel: s.price_label || "",
    durationMin: s.duration_min,
  }));
  const hours: OpeningDay[] = (hrs || []).map((h: { weekday: number; closed: boolean; opens: string | null; closes: string | null }) => ({
    weekday: h.weekday,
    closed: h.closed,
    opens: hm(h.opens),
    closes: hm(h.closes),
  }));
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cover = row.cover_path && base ? `${base}/storage/v1/object/public/photos/${row.cover_path}` : null;
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
    theme: (row.theme as ProfileTheme) || "klassisch",
    coverDataUrl: cover,
    photos: base ? (pics || []).map((p: { id: string; path: string }) => ({ id: p.id, url: `${base}/storage/v1/object/public/photos/${p.path}` })) : [],
    services,
    hours: hours.length ? hours : Array.from({ length: 7 }, (_, i) => ({ weekday: i + 1, closed: i >= 5, opens: "09:00", closes: "18:00" })),
    legalName: row.legal_name || "",
    legalForm: row.legal_form || "",
    uidNumber: row.uid_number || "",
    isPublished: row.is_published,
    tier,
    updatedAt: row.updated_at,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = await loadPublished(slug);
  if (!b) return { title: "Nicht gefunden" };
  return {
    title: `${b.name} · ${b.tagline}`,
    description: b.about || b.tagline,
  };
}

export default async function PublicProfile({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
}) {
  const { slug } = await params;
  const { src } = await searchParams;
  const b = await loadPublished(slug);
  if (!b) notFound();
  const isDemo = slug.startsWith("beispiel-");
  return (
    <>
      {isDemo && (
        <div className="notice" style={{ borderRadius: 0, margin: 0, textAlign: "center" }}>
          Beispielprofil. <Link href="/start">So eines in 10 Minuten erstellen</Link>
        </div>
      )}
      {!isDemo && !b.isPublished && (
        <div className="notice" style={{ borderRadius: 0, margin: 0, textAlign: "center" }}>
          Vorschau: Diese Seite ist noch nicht veröffentlicht. <Link href="/dashboard">Zum Dashboard</Link>
        </div>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(b)) }} />
      <PublicProfileClient b={b} srcQr={src === "qr"} />
    </>
  );
}
