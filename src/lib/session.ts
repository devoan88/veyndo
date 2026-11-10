"use client";

import { supabaseConfigured } from "./env";
import { createClient } from "./supabase/client";

/**
 * Demo visitors build without an account: we open an anonymous Supabase session,
 * so the demo is stored in Veyndo's database (never public; see businesses RLS).
 * Returns false if no session could be opened; the demo then stays in this browser.
 */
let inflight: Promise<boolean> | null = null;

const ANON_FLAG = "veyndo.anon.ok";

/** At most one anonymous sign-in attempt per browser tab session. */
export async function ensureSession(): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  if (inflight) return inflight;
  inflight = (async () => {
    const supabase = createClient();
    const existing = await supabase.auth.getSession();
    if (existing.data.session?.user) return true;
    // Soft client cap: refuse rapid re-anon if a prior attempt already ran this tab.
    try {
      if (sessionStorage.getItem(ANON_FLAG) === "1") {
        const again = await supabase.auth.getSession();
        return !!again.data.session?.user;
      }
      sessionStorage.setItem(ANON_FLAG, "1");
    } catch {}
    const { data } = await supabase.auth.signInAnonymously();
    if (data.user) return true;
    // A parallel call may have created the session already.
    const again = await supabase.auth.getSession();
    return !!again.data.session?.user;
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
