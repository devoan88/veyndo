import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { demoBusiness } from "@/lib/demo";

const KINDS = ["view", "call", "whatsapp", "route", "qr"] as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const slug = String(body?.slug || "");
  const kind = String(body?.kind || "");
  if (!(KINDS as readonly string[]).includes(kind) || !slug || demoBusiness(slug)) {
    return NextResponse.json({ ok: true });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ ok: true });
  }
  const supabase = await createClient();
  const { data: biz } = await supabase.from("businesses").select("id").eq("slug", slug).maybeSingle();
  if (!biz) return NextResponse.json({ ok: true });
  await supabase.from("events").insert({ business_id: biz.id, kind });
  return NextResponse.json({ ok: true });
}
