import { DEFAULT_LOCALE, type Locale } from "./config";

/** Product is Georgian-only — always resolve to ka. */
export async function getLocale(): Promise<Locale> {
  return DEFAULT_LOCALE;
}
