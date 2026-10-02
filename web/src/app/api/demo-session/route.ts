import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdmin } from "@/lib/supabase/admin";
import { randomBytes, randomUUID } from "crypto";

/**
 * Dashboard "Allow anonymous sign-ins" is still off on this project.
 * We mint a throwaway confirmed user with the service role (server only)
 * so Demo-Studio can save unpublished rows without an email from the visitor.
 */
export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json({ ok: false }, { status: 503 });

  const email = `demo.${randomUUID()}@users.veyndo.app`;
  const password = randomBytes(24).toString("base64url");
  const admin = createAdmin();
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { demo: true },
  });
  if (created.error || !created.data.user) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const browser = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const signed = await browser.auth.signInWithPassword({ email, password });
  const session = signed.data.session;
  if (signed.error || !session) return NextResponse.json({ ok: false }, { status: 500 });

  return NextResponse.json({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
