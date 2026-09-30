import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function tierFromLookup(key: string | null | undefined): "profil" | "pro" | "basis" {
  if (!key) return "basis";
  if (key.startsWith("pro_")) return "pro";
  if (key.startsWith("profil_")) return "profil";
  return "basis";
}

function intervalFrom(price: Stripe.Price | undefined): "month" | "year" | null {
  const i = String(price?.recurring?.interval || "");
  if (i === "month" || i === "year") return i;
  return null;
}

function throwIfError(error: { message: string } | null, context: string) {
  if (error) {
    console.error(context, error.message);
    throw new Error(`${context}: ${error.message}`);
  }
}

async function upsertSub(
  admin: ReturnType<typeof createAdmin>,
  ownerId: string,
  sub: Stripe.Subscription,
) {
  const price = sub.items.data[0]?.price;
  const lookup = typeof price === "object" ? price.lookup_key : null;
  const item = sub.items.data[0] as { current_period_end?: number } | undefined;
  const periodUnix =
    (sub as unknown as { current_period_end?: number }).current_period_end || item?.current_period_end || 0;
  const statusMap: Record<string, string> = {
    trialing: "trialing",
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "incomplete",
    unpaid: "past_due",
    paused: "canceled",
  };
  const row = {
    owner_id: ownerId,
    stripe_subscription_id: sub.id,
    tier: sub.status === "canceled" ? "basis" : tierFromLookup(lookup),
    status: statusMap[sub.status] || "active",
    interval: intervalFrom(typeof price === "object" ? price : undefined),
    current_period_end: periodUnix ? new Date(periodUnix * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "owner_id" });
  throwIfError(error, "subscriptions upsert");
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret?.startsWith("sk_test_") || !whsec) {
    return NextResponse.json({ error: "Webhook nicht konfiguriert" }, { status: 503 });
  }
  const stripe = new Stripe(secret);
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no sig" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whsec);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  try {
    const admin = createAdmin();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const ownerId = session.client_reference_id || session.metadata?.owner_id;
      const subId = session.subscription;
      if (ownerId && typeof subId === "string") {
        const sub = await stripe.subscriptions.retrieve(subId);
        if (session.customer && typeof session.customer === "string") {
          const { error } = await admin.from("owners").update({ stripe_customer_id: session.customer }).eq("id", ownerId);
          throwIfError(error, "owners stripe_customer_id");
        }
        await upsertSub(admin, ownerId, sub);
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const ownerId = sub.metadata?.owner_id;
      let oid = ownerId;
      if (!oid && typeof sub.customer === "string") {
        const { data, error } = await admin.from("owners").select("id").eq("stripe_customer_id", sub.customer).maybeSingle();
        throwIfError(error, "owners lookup by customer");
        oid = data?.id;
      }
      if (oid) {
        if (event.type === "customer.subscription.deleted") {
          const { error } = await admin.from("subscriptions").upsert({
            owner_id: oid,
            stripe_subscription_id: sub.id,
            tier: "basis",
            status: "canceled",
            updated_at: new Date().toISOString(),
          }, { onConflict: "owner_id" });
          throwIfError(error, "subscriptions canceled");
        } else {
          await upsertSub(admin, oid, sub);
        }
      }
    }

    if (event.type === "invoice.payment_failed") {
      const inv = event.data.object as Stripe.Invoice;
      const customer =
        "customer" in inv && typeof (inv as { customer?: unknown }).customer === "string"
          ? (inv as { customer: string }).customer
          : null;
      if (customer) {
        const { data, error } = await admin.from("owners").select("id").eq("stripe_customer_id", customer).maybeSingle();
        throwIfError(error, "owners lookup payment_failed");
        if (data) {
          const { error: upErr } = await admin.from("subscriptions").update({ status: "past_due", updated_at: new Date().toISOString() }).eq("owner_id", data.id);
          throwIfError(upErr, "subscriptions past_due");
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("stripe webhook", e);
    return NextResponse.json({ error: "db write failed" }, { status: 500 });
  }
}
