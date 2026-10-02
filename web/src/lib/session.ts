"use client";

import { supabaseConfigured } from "./env";
import { createClient } from "./supabase/client";

/**
 * Demo visitors build without an account: we open an anonymous Supabase session,
 * so the demo is stored in Veyndo's database (never public; see businesses RLS).
 * Returns false if no session could be opened; the demo then stays in this browser.
 */
export async function ensureSession(): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) return true;
  try {
    const result = await Promise.race([
      supabase.auth.signInAnonymously(),
      new Promise<{ error: Error }>((resolve) =>
        setTimeout(() => resolve({ error: new Error("anonymous-timeout") }), 8000),
      ),
    ]);
    return !result.error;
  } catch {
    return false;
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
