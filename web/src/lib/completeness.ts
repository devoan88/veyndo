import type { Business } from "./types";
import { PLANS } from "./plans";

export type EditorTab = "basis" | "kontakt" | "leistungen" | "fotos" | "zeiten" | "impressum";

export type Step = { key: string; label: string; done: boolean; tab: EditorTab; weight: number };

/** What makes a profile convincing, in the order an owner should do it. */
export function profileSteps(b: Business): Step[] {
  const plan = PLANS[b.tier];
  const priced = b.services.filter((s) => s.title.trim() && s.priceLabel.trim()).length;
  const steps: Step[] = [
    { key: "phone", label: "Telefonnummer eintragen", done: !!b.phone.trim(), tab: "kontakt", weight: 15 },
    { key: "cover", label: "Titelfoto hochladen", done: !!b.coverDataUrl, tab: "basis", weight: 15 },
    { key: "services", label: "Mindestens 3 Leistungen mit Preis", done: priced >= 3, tab: "leistungen", weight: 15 },
    { key: "street", label: "Adresse eintragen", done: !!b.street.trim(), tab: "kontakt", weight: 10 },
    { key: "legal", label: "Impressum ausfüllen", done: !!b.legalName.trim(), tab: "impressum", weight: 10 },
    { key: "about", label: "Ein paar Sätze über Sie", done: b.about.trim().length >= 40, tab: "basis", weight: 10 },
    { key: "hours", label: "Öffnungszeiten prüfen", done: b.hours.some((h) => !h.closed), tab: "zeiten", weight: 10 },
  ];
  if (plan.gallery > 0) {
    steps.push({ key: "photos", label: "3 Fotos in die Galerie", done: (b.photos ?? []).length >= 3, tab: "fotos", weight: 10 });
  }
  if (plan.whatsapp) {
    steps.push({ key: "wa", label: "WhatsApp-Nummer eintragen", done: !!b.whatsapp.trim(), tab: "kontakt", weight: 5 });
  }
  return steps;
}

export function profileScore(b: Business) {
  const steps = profileSteps(b);
  const total = steps.reduce((n, s) => n + s.weight, 0);
  const got = steps.filter((s) => s.done).reduce((n, s) => n + s.weight, 0);
  const pct = Math.round((got / total) * 100);
  return { pct, steps, next: steps.find((s) => !s.done) ?? null };
}
