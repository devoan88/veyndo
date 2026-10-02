"use client";

import { supabaseConfigured } from "./env";
import { createClient } from "./supabase/client";

/**
 * Demo visitors build without an account: we open an anonymous Supabase session,
 * so the demo is stored in Veyndo's database (never public; see businesses RLS).
 * Returns false if no session could be opened; the demo then stays in this browser.
 */
let inflight: Promise<boolean> | null = null;

export async function ensureSession(): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  if (inflight) return inflight;
  inflight = (async () => {
    const supabase = createClient();
    const existing = await supabase.auth.getSession();
    if (existing.data.session?.user) return true;
    const { data } = await supabase.auth.signInAnonymously();
    if (data.user) return true;
    const again = await supabase.auth.getSession();
    if (again.data.session?.user) return true;
    const res = await fetch("/api/demo-session", { method: "POST" });
    if (!res.ok) return false;
    const tokens = (await res.json()) as { access_token?: string; refresh_token?: string };
    if (!tokens.access_token || !tokens.refresh_token) return false;
    const set = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
    return !!set.data.session?.user;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/** Saves the "please put me online" request for Ani (table service_requests). */
export async function sendDemoRequest(message: string): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { error } = await supabase.from("service_requests").insert({
    owner_id: data.user.id,
    topic: "website",
    message: message.slice(0, 1000),
  });
  return !error;
}
