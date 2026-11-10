import type { Business } from "./types";
import { PLANS } from "./plans";
import type { Locale } from "./i18n/config";
import { DEFAULT_LOCALE } from "./i18n/config";
import { getMessages } from "./i18n/messages";

export type EditorTab = "basis" | "kontakt" | "leistungen" | "fotos" | "zeiten" | "impressum";

export type Step = { key: string; label: string; done: boolean; tab: EditorTab; weight: number };

/** What makes a profile convincing, in the order an owner should do it. */
export function profileSteps(b: Business, locale: Locale = DEFAULT_LOCALE): Step[] {
  const plan = PLANS[b.tier];
  const c = getMessages(locale).completeness;
  const priced = b.services.filter((s) => s.title.trim() && s.priceLabel.trim()).length;
  const steps: Step[] = [
    { key: "phone", label: c.phone, done: !!b.phone.trim(), tab: "kontakt", weight: 15 },
    { key: "cover", label: c.cover, done: !!b.coverDataUrl, tab: "basis", weight: 15 },
    { key: "services", label: c.services, done: priced >= 3, tab: "leistungen", weight: 15 },
    { key: "street", label: c.street, done: !!b.street.trim(), tab: "kontakt", weight: 10 },
    { key: "legal", label: c.legal, done: !!b.legalName.trim(), tab: "impressum", weight: 10 },
    { key: "about", label: c.about, done: b.about.trim().length >= 40, tab: "basis", weight: 10 },
    { key: "hours", label: c.hours, done: b.hours.some((h) => !h.closed), tab: "zeiten", weight: 10 },
  ];
  if (plan.gallery > 0) {
    steps.push({ key: "photos", label: c.photos, done: (b.photos ?? []).length >= 3, tab: "fotos", weight: 10 });
  }
  if (plan.whatsapp) {
    steps.push({ key: "wa", label: c.wa, done: !!b.whatsapp.trim(), tab: "kontakt", weight: 5 });
  }
  return steps;
}

export function profileScore(b: Business, locale: Locale = DEFAULT_LOCALE) {
  const steps = profileSteps(b, locale);
  const total = steps.reduce((n, s) => n + s.weight, 0);
  const got = steps.filter((s) => s.done).reduce((n, s) => n + s.weight, 0);
  const pct = Math.round((got / total) * 100);
  return { pct, steps, next: steps.find((s) => !s.done) ?? null };
}
