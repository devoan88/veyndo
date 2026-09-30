import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { siteOrigin } from "@/lib/env";

const ALLOWED = new Set(["profil_monthly", "profil_yearly", "pro_monthly", "pro_yearly"]);

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith("sk_test_")) {
    return NextResponse.json({ error: "Stripe Test-Key fehlt in .env.local" }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Bitte anmelden." }, { status: 401 });

  let body: { lookupKey?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  const lookupKey = typeof body.lookupKey === "string" ? body.lookupKey : "";
  if (!ALLOWED.has(lookupKey)) {
    return NextResponse.json({ error: "Ungültiger Plan." }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const prices = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  const price = prices.data[0];
  if (!price) return NextResponse.json({ error: `Preis ${lookupKey} nicht in Stripe gefunden.` }, { status: 400 });

  let customer: string | undefined;
  try {
    const admin = createAdmin();
    const { data: owner } = await admin.from("owners").select("stripe_customer_id,email").eq("id", user.id).single();
    customer = owner?.stripe_customer_id as string | undefined;
    if (!customer) {
      const c = await stripe.customers.create({ email: user.email || owner?.email || undefined, metadata: { owner_id: user.id } });
      customer = c.id;
      await admin.from("owners").update({ stripe_customer_id: customer }).eq("id", user.id);
    }
  } catch {
    customer = undefined;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...(customer ? { customer } : { customer_email: user.email || undefined }),
    line_items: [{ price: price.id, quantity: 1 }],
    subscription_data: { trial_period_days: 14, metadata: { owner_id: user.id } },
    success_url: `${siteOrigin()}/dashboard?checkout=ok`,
    cancel_url: `${siteOrigin()}/dashboard?checkout=cancel`,
    client_reference_id: user.id,
    locale: "de",
    metadata: { owner_id: user.id },
  });
  return NextResponse.json({ url: session.url });
}
