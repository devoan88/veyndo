import { DEFAULT_LOCALE, type Locale } from "./config";

/** Product is Georgian-only. */
export function getClientLocale(): Locale {
  return DEFAULT_LOCALE;
}

export function setClientLocaleCookie(_locale?: Locale) {
  void _locale;
}
