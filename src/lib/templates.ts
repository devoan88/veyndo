import type { Template } from "./types";
import type { Locale } from "./i18n/config";
import { DEFAULT_LOCALE } from "./i18n/config";
import { getMessages } from "./i18n/messages";

import nagelstudioDe from "@/content/templates/de/nagelstudio.json";
import friseurDe from "@/content/templates/de/friseur.json";
import kosmetikDe from "@/content/templates/de/kosmetik.json";
import physiotherapieDe from "@/content/templates/de/physiotherapie.json";
import massageDe from "@/content/templates/de/massage.json";
import psychotherapieDe from "@/content/templates/de/psychotherapie.json";
import elektrikerDe from "@/content/templates/de/elektriker.json";
import installateurDe from "@/content/templates/de/installateur.json";
import reinigungDe from "@/content/templates/de/reinigung.json";

import nagelstudioKa from "@/content/templates/ka/nagelstudio.json";
import friseurKa from "@/content/templates/ka/friseur.json";
import kosmetikKa from "@/content/templates/ka/kosmetik.json";
import physiotherapieKa from "@/content/templates/ka/physiotherapie.json";
import massageKa from "@/content/templates/ka/massage.json";
import psychotherapieKa from "@/content/templates/ka/psychotherapie.json";
import elektrikerKa from "@/content/templates/ka/elektriker.json";
import installateurKa from "@/content/templates/ka/installateur.json";
import reinigungKa from "@/content/templates/ka/reinigung.json";

const DE: Template[] = [
  nagelstudioDe, friseurDe, kosmetikDe,
  physiotherapieDe, massageDe, psychotherapieDe,
  elektrikerDe, installateurDe, reinigungDe,
] as Template[];

const KA: Template[] = [
  nagelstudioKa, friseurKa, kosmetikKa,
  physiotherapieKa, massageKa, psychotherapieKa,
  elektrikerKa, installateurKa, reinigungKa,
] as Template[];

export function getTemplates(locale: Locale = DEFAULT_LOCALE): Template[] {
  return locale === "de" ? DE : KA;
}

/** Product default = Georgian templates. */
export const TEMPLATES: Template[] = KA;

export function getGroups(locale: Locale = DEFAULT_LOCALE): Record<Template["group"], string> {
  const g = getMessages(locale).groups;
  return { schoenheit: g.schoenheit, gesundheit: g.gesundheit, handwerk: g.handwerk };
}

export const GROUPS: Record<Template["group"], string> = getGroups(DEFAULT_LOCALE);

export function getTemplate(key: string, locale: Locale = DEFAULT_LOCALE): Template {
  const list = getTemplates(locale);
  return list.find((t) => t.key === key) ?? list[0];
}
