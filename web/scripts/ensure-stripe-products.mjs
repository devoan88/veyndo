#!/usr/bin/env node
/**
 * Creates TEST products/prices if STRIPE_SECRET_KEY (sk_test_) is set.
 * Never uses live keys. Idempotent: reuse product by name; skip existing lookup_keys.
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY || "";
const isTest =
  key.startsWith("sk_test_") ||
  key.startsWith("rk_test_") ||
  key.startsWith("rkcs_test_");
if (!isTest) {
  console.log("Skip Stripe products: no TEST key in env.");
  process.exit(0);
}

const stripe = new Stripe(key);

const prices = [
  { product: "Veyndo Profil", lookup: "profil_monthly", amount: 900, interval: "month" },
  { product: "Veyndo Profil", lookup: "profil_yearly", amount: 9000, interval: "year" },
  { product: "Veyndo Pro", lookup: "pro_monthly", amount: 1900, interval: "month" },
  { product: "Veyndo Pro", lookup: "pro_yearly", amount: 19000, interval: "year" },
];

const productCache = {};

async function productByName(name) {
  if (productCache[name]) return productCache[name];
  const found = await stripe.products.search({ query: `name:'${name}'` });
  const product = found.data[0] || (await stripe.products.create({ name }));
  productCache[name] = product;
  return product;
}

for (const row of prices) {
  const existing = await stripe.prices.list({ lookup_keys: [row.lookup], limit: 1 });
  if (existing.data[0]) {
    console.log("exists", row.lookup, existing.data[0].id);
    continue;
  }
  const product = await productByName(row.product);
  const price = await stripe.prices.create({
    product: product.id,
    currency: "eur",
    unit_amount: row.amount,
    recurring: { interval: row.interval },
    lookup_key: row.lookup,
  });
  console.log("created", row.lookup, price.id);
}
