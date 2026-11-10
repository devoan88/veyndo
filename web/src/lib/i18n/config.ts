export const LOCALES = ["ka"] as const;
export type Locale = "ka" | "de";

/** Georgian-only product surface (veyndo.ge). German kept only as fallback catalog. */
export const DEFAULT_LOCALE: Locale = "ka";
export const LOCALE_COOKIE = "veyndo_locale";
export const LOCALE_HEADER = "x-veyndo-locale";

/** Production Georgian hosts. */
export const GE_HOSTS = new Set(["veyndo.ge", "www.veyndo.ge"]);

export function normalizeHost(host: string | null | undefined): string {
  return (host || "").split(":")[0].trim().toLowerCase();
}

/** Product always resolves to Georgian. */
export function localeFromHost(_host?: string | null): Locale {
  void _host;
  return DEFAULT_LOCALE;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ka" || value === "de";
}

export function htmlLang(_locale?: Locale): string {
  void _locale;
  return "ka";
}

export function ogLocale(_locale?: Locale): string {
  void _locale;
  return "ka_GE";
}

export function profileDomainFor(_locale?: Locale): string {
  void _locale;
  return process.env.NEXT_PUBLIC_PROFILE_DOMAIN || "veyndo.ge";
}

export function siteUrlFor(_locale?: Locale): string {
  void _locale;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://veyndo.ge";
}

export function marketCity(_locale?: Locale): string {
  void _locale;
  return "თბილისი";
}

export function marketCountry(_locale?: Locale): string {
  void _locale;
  return "საქართველო";
}
