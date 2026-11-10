// Slug rules from docs/spec.md §5
import { getMessages } from "./i18n/messages";
import { DEFAULT_LOCALE, profileDomainFor, type Locale } from "./i18n/config";

export const RESERVED_SLUGS = new Set([
  "app", "www", "admin", "api", "mail", "veyndo", "hilfe", "support",
  "login", "status", "blog", "impressum", "datenschutz", "agb",
  "ka", "de",
]);

export function toSlug(input: string): string {
  const s = input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    // Drop non-latin letters (e.g. Georgian) so URLs stay ASCII.
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return s.length >= 3 ? s : "chemi-biznesi";
}

export function slugProblem(slug: string, locale: Locale = DEFAULT_LOCALE): string | null {
  const m = getMessages(locale);
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug)) {
    return m.slug.format;
  }
  if (RESERVED_SLUGS.has(slug)) return m.slug.reserved;
  return null;
}

export const PROFILE_DOMAIN = process.env.NEXT_PUBLIC_PROFILE_DOMAIN || "veyndo.ge";

export function profileDomain(_locale?: Locale): string {
  void _locale;
  return profileDomainFor(DEFAULT_LOCALE);
}

export const profileUrl = (slug: string, locale?: Locale) =>
  `https://${slug}.${profileDomain(locale)}`;
