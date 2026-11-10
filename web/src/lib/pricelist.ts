import type { Locale } from "./i18n/config";
import { DEFAULT_LOCALE } from "./i18n/config";
import { getMessages } from "./i18n/messages";

export type PriceItem = { name: string; desc: string; price: string };
export type PriceGroup = { key: string; title: string; intro: string; items: PriceItem[] };

function itemsFrom(rows: [string, string, string][]): PriceItem[] {
  return rows.map(([name, desc, price]) => ({ name, desc, price }));
}

/** Public price list (Georgian product default). */
export function getPriceList(locale: Locale = DEFAULT_LOCALE): PriceGroup[] {
  const p = getMessages(locale).priceList;
  return [
    { key: "websites", title: p.websitesTitle, intro: p.websitesIntro, items: itemsFrom(p.websitesItems) },
    {
      key: "sichtbarkeit",
      title: p.sichtbarkeitTitle,
      intro: p.sichtbarkeitIntro,
      items: itemsFrom(p.sichtbarkeitItems),
    },
    { key: "extras", title: p.extrasTitle, intro: p.extrasIntro, items: itemsFrom(p.extrasItems) },
    { key: "software", title: p.softwareTitle, intro: p.softwareIntro, items: itemsFrom(p.softwareItems) },
    { key: "betreuung", title: p.betreuungTitle, intro: p.betreuungIntro, items: itemsFrom(p.betreuungItems) },
  ];
}

export const PRICE_LIST = getPriceList(DEFAULT_LOCALE);
