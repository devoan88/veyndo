import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/env";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith("sk_test_")) {
    return NextResponse.json({ error: "Stripe Test-Key fehlt." }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Bitte anmelden." }, { status: 401 });
  const { data: owner } = await supabase.from("owners").select("stripe_customer_id").eq("id", user.id).single();
  if (!owner?.stripe_customer_id) {
    return NextResponse.json({ error: "Noch kein Stripe-Kunde. Zuerst einen Plan starten." }, { status: 400 });
  }
  const stripe = new Stripe(secret);
  const portal = await stripe.billingPortal.sessions.create({
    customer: owner.stripe_customer_id,
    return_url: `${siteOrigin()}/dashboard`,
  });
  return NextResponse.json({ url: portal.url });
}
