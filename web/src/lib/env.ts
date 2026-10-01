export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** TEST secret only — sk_test_ or Stripe sandbox restricted keys. Never live. */
export function isStripeTestSecret(secret: string | undefined): secret is string {
  if (!secret) return false;
  return (
    secret.startsWith("sk_test_") ||
    secret.startsWith("rk_test_") ||
    secret.startsWith("rkcs_test_")
  );
}

export function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
