import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { demoBusiness } from "@/lib/demo";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const KINDS = ["view", "call", "whatsapp", "route", "qr"] as const;
const MAX_BODY = 2048;

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`events:ip:${ip}`, 60, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }
  let body: { slug?: string; kind?: string; sid?: string } | null = null;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const slug = String(body?.slug || "").slice(0, 64);
  const kind = String(body?.kind || "");
  const sid = String(body?.sid || "").slice(0, 64);
  if (!(KINDS as readonly string[]).includes(kind) || !slug || demoBusiness(slug)) {
    return NextResponse.json({ ok: true });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ ok: true });
  }

  // Per IP+slug+kind and optional session id — soft de-dupe for view spam.
  const sessionKey = sid || ip;
  if (!rateLimit(`events:${kind}:${slug}:${sessionKey}`, kind === "view" ? 3 : 20, 60 * 60_000)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const supabase = await createClient();
  const { data: biz } = await supabase
    .from("businesses")
    .select("id,is_published,is_blocked")
    .eq("slug", slug)
    .maybeSingle();
  if (!biz || !biz.is_published || biz.is_blocked) return NextResponse.json({ ok: true });
  await supabase.from("events").insert({ business_id: biz.id, kind });
  return NextResponse.json({ ok: true });
}
