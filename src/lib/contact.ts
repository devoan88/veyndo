// Personal sales: orders are taken personally (WhatsApp, phone, contact form)
// until online payments are live.
import type { Locale } from "./i18n/config";
import { siteUrlFor } from "./i18n/config";

export const CONTACT = {
  whatsapp: "436643568802",
  phone: "+43 664 4390540",
  phoneHref: "tel:+436644390540",
  form: "https://veyndo.ge/#kontakt",
};

export function contactFormUrl(locale: Locale = "de") {
  return `${siteUrlFor(locale)}/#kontakt`;
}

export function whatsappHref(text: string) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}
