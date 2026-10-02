import type { Business } from "./types";
import { CONTACT, whatsappHref } from "./contact";
import { professionLabel } from "./professions";

export type PhotoPlan = "with" | "later" | "none";

const TRIAL_KEY = "veyndo.trial.v1";

export function isCustomerLive(b: Business) {
  return b.isPublished === true;
}

type TrialInfo = { photoPlan?: PhotoPlan; wishes?: string; tags?: string[] };

function readTrial(): TrialInfo {
  try {
    const raw = localStorage.getItem(TRIAL_KEY);
    return raw ? (JSON.parse(raw) as TrialInfo) : {};
  } catch {
    return {};
  }
}

function writeTrial(patch: TrialInfo) {
  try {
    localStorage.setItem(TRIAL_KEY, JSON.stringify({ ...readTrial(), ...patch }));
  } catch {}
}

export function loadPhotoPlan(): PhotoPlan | null {
  return readTrial().photoPlan ?? null;
}

export function savePhotoPlan(photoPlan: PhotoPlan) {
  writeTrial({ photoPlan });
}

/** What the visitor wrote in their own words in the demo builder. */
export function loadWishes(): { wishes: string; tags: string[] } {
  const t = readTrial();
  return { wishes: t.wishes ?? "", tags: t.tags ?? [] };
}

export function saveWishes(wishes: string, tags: string[]) {
  writeTrial({ wishes, tags });
}

export function visitHref(b: Business, photoPlan?: PhotoPlan | null) {
  const photos =
    photoPlan === "none" ? "ohne Fotos" : photoPlan === "later" ? "Fotos kommen später" : photoPlan === "with" ? "mit Fotos" : "noch offen";
  const ort = [b.street, [b.postalCode, b.city].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "noch ohne Adresse";
  return whatsappHref(
    `Hallo, ich möchte einen Termin für meine Veyndo-Seite.\n\nBetrieb: ${b.name}\nBranche: ${professionLabel(b.templateKey)}\nOrt: ${ort}\nTelefon: ${b.phone || "—"}\nLook: ${b.theme || "klassisch"}, Farbe ${b.accentColor}\nFotos: ${photos}${wishLines()}`,
  );
}

export { CONTACT };

function wishLines() {
  const { wishes, tags } = loadWishes();
  const parts = [tags.length ? `Wünsche: ${tags.join(", ")}` : "", wishes ? `In eigenen Worten: ${wishes}` : ""].filter(Boolean);
  return parts.length ? `\n${parts.join("\n")}` : "";
}
