// Slug rules from docs/spec.md §5
export const RESERVED_SLUGS = new Set([
  "app", "www", "admin", "api", "mail", "veyndo", "hilfe", "support",
  "login", "status", "blog", "impressum", "datenschutz", "agb",
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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return s.length >= 3 ? s : "mein-betrieb";
}

export function slugProblem(slug: string): string | null {
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug)) {
    return "3 bis 40 Zeichen: Kleinbuchstaben, Zahlen und Bindestriche.";
  }
  if (RESERVED_SLUGS.has(slug)) return "Diese Adresse ist reserviert.";
  return null;
}

export const PROFILE_DOMAIN = "veyndo.at";
export const profileUrl = (slug: string) => `https://${slug}.${PROFILE_DOMAIN}`;
